import _ from 'lodash'
import { AppStoreService } from './store-services'
import { DatabaseService } from './database-service'
import TelegramBotService from './telegram-bot-service'
import EnvService from './env-service'

class PollingService {
  private readonly appStoreService: AppStoreService
  private readonly database: DatabaseService
  private readonly botService: TelegramBotService

  constructor() {
    this.appStoreService = new AppStoreService()
    this.database = new DatabaseService()
    this.botService = new TelegramBotService(this.database, EnvService.telegramBotToken)
  }

  private async getVersion() {
    const { appId } = EnvService.appStoreConfig
    const appInfo = await this.appStoreService.getAppInfo({ appId })
    const lastWrittenVersion = await this.database.getVersion(appId)

    if (lastWrittenVersion !== appInfo.version) {
      await this.database.setVersion(appId, appInfo.version)
      const subscribers = await this.database.getSubscribers(appId)

      this.botService.notifyAboutNewVersion(subscribers, appInfo)
    }
  }

  public async startPolling() {
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
