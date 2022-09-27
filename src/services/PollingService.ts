import _ from 'lodash'

import AppStoreService from './StoreServices/AppStoreService'
import DatabaseService from './database/DatabaseService'
import BotService from './BotService'
import EnvService from './EnvService'

class PollingService {
  private readonly appStoreService: AppStoreService
  private readonly database: DatabaseService
  private readonly notificationService: BotService

  constructor() {
    this.appStoreService = new AppStoreService()
    this.database = new DatabaseService()
    this.notificationService = new BotService(this.database, EnvService.telegramBotToken)
  }

  private async getVersion() {
    const { appId } = EnvService.appStoreConfig
    const appInfo = await this.appStoreService.getAppInfo({ appId })
    const lastWrittenVersion = await this.database.getVersion(appId)

    if (lastWrittenVersion !== appInfo.version) {
      await this.database.setVersion(appId, appInfo.version)
      const subscribers = await this.database.getSubscribers(appId)

      this.notificationService.notifyAboutNewVersion(subscribers, appInfo)
    }
  }

  public async startPolling () {
    try {
      await this.getVersion()

      setTimeout(async () => {
        await this.startPolling()
      }, EnvService.requestConfig.interval)
    } catch (e) {
      console.log(_.isError(e) ? e.message : e)

      setTimeout(async () => {
        await this.startPolling()
      }, EnvService.requestConfig.interval)
    }
  }
}

export default PollingService
