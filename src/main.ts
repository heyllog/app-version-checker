import { DatabaseService } from './services/database-service'
import TelegramBotService from './services/telegram-bot-service'
import EnvService from './services/env-service'
import { AppStoreService } from './services/store-services'
import PollingService from './services/polling-services'

const main = async () => {
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
}

export default main
