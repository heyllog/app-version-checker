import _ from 'lodash'

import { AppStoreService } from './store-services'
import { DatabaseService } from './database-service'
import TelegramBotService from './telegram-bot-service'
import EnvService from './env-service'
import { getMessageFromError } from '../utils'
import logger from '../lib/logger'

const MAX_RETRIES_COUNT = 5

class PollingService {
  private readonly appStoreService: AppStoreService
  private readonly databaseService: DatabaseService
  private readonly telegramBotService: TelegramBotService

  private readonly logger = logger.child({ service: 'polling-service' })

  /* polling retries count */
  private retriesCount: number = 0

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
    this.logger.info(`getVersion: ${new Date()}`)

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
      const errorName = _.isError(e) ? `Retry №${this.retriesCount} ${e.name}: ` : ''
      const errorMessage = getMessageFromError(e)
      this.logger.error(errorName.concat(errorMessage))

      if (this.retriesCount >= MAX_RETRIES_COUNT) {
        this.logger.error(`Shutdown after ${this.retriesCount} retries`)

        throw e
      }

      this.retriesCount = this.retriesCount + 1
      await this.startPolling()
    }
  }
}

export default PollingService
