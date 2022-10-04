import { DatabaseService } from './services/database-service'
import TelegramBotService from './services/telegram-bot-service'
import EnvService from './services/env-service'
import { AppStoreService } from './services/store-services'
import PollingService from './services/polling-services'

let retriesCount = 0

const main = async () => {
  try {
    const databaseService = new DatabaseService()
    await databaseService.init()

    const telegramBotService = new TelegramBotService(databaseService, EnvService.telegramBotToken)
    const appStoreService = new AppStoreService()
    const pollingService = new PollingService({
      appStoreService,
      databaseService,
      telegramBotService,
    })

    await pollingService.startPolling()
  } catch (e) {
    retriesCount++

    console.error(e)

    if (retriesCount > 5) {
      throw e
    }

    await main()
  }
}

export default main
