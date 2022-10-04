import _ from 'lodash'

import { AppStoreService } from './store-services'
import { DatabaseService } from './database-service'
import TelegramBotService from './telegram-bot-service'
import EnvService from './env-service'
import { getMessageFromError } from '../utils'

class PollingService {
  private readonly appStoreService: AppStoreService
  private readonly databaseService: DatabaseService
  private readonly telegramBotService: TelegramBotService

  constructor({
    appStoreService,
    databaseService,
    telegramBotService,
  }: {
    appStoreService: AppStoreService
    databaseService: DatabaseService
    telegramBotService: TelegramBotService
  }) {
    this.appStoreService = appStoreService
    this.databaseService = databaseService
    this.telegramBotService = telegramBotService
  }

  private async getVersion() {
    const { appId } = EnvService.appStoreConfig
    const appInfo = await this.appStoreService.getAppInfo({ appId })
    const appInfoFromDatabase = await this.databaseService.getAppInfo(appId)

    if (appInfoFromDatabase?.version !== appInfo.version) {
      await this.databaseService.setAppInfo(appId, appInfo)
      const subscribers = this.databaseService.getSubscribers(appId)

      this.telegramBotService.notifyAboutNewVersion(subscribers, appInfo)
    }
  }

  public async startPolling() {
    try {
      await this.getVersion()

      setTimeout(async () => {
        await this.startPolling()
      }, EnvService.requestConfig.interval)
    } catch (e) {
      const errorName = _.isError(e) ? `${e.name}: ` : ''
      const errorMessage = getMessageFromError(e)
      /* Notify admin that service is down */
      await this.telegramBotService.sendMessage(EnvService.telegramAdmin, errorName.concat(errorMessage))

      throw e
    }
  }
}

export default PollingService
