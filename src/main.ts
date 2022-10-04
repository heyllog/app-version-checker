import _ from 'lodash'

import { DatabaseService } from './services/database-service'
import TelegramBotService from './services/telegram-bot-service'
import EnvService from './services/env-service'
import { AppStoreService } from './services/store-services'
import PollingService from './services/polling-services'
import { getMessageFromError } from './utils'

let retriesCount = 0

const main = async () => {
  const databaseService = new DatabaseService()
  await databaseService.init()

  const telegramBotService = new TelegramBotService(databaseService, EnvService.telegramBotToken)
  const appStoreService = new AppStoreService()

  try {
    const pollingService = new PollingService({
      appStoreService,
      databaseService,
      telegramBotService,
    })

    await pollingService.startPolling()
  } catch (e) {
    retriesCount++
    const errorName = _.isError(e) ? `${e.name}: ` : ''
    const errorMessage = getMessageFromError(e)

    /* Notify admin that service is down */
    await telegramBotService.sendMessage(EnvService.telegramAdmin, errorName.concat(errorMessage))
    console.error(e)

    if (retriesCount > 5) {
      await telegramBotService.sendMessage(EnvService.telegramAdmin, 'Service stopped')

      throw e
    }

    await main()
  }
}

export default main
