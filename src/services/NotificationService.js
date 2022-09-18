import TelegramBot from 'node-telegram-bot-api'
import EnvService from './EnvService.js'
import { getMessageFromError } from '../utils/index.js'

class NotificationService {
  constructor(db, token) {
    this.bot = new TelegramBot(token, { polling: true })
    this.db = db

    this.listenForSubscribers()
  }

  listenForSubscribers() {
    this.bot.setMyCommands([
      { command: '/subscribe', description: 'Subscribe' },
      { command: '/unsubscribe', description: 'Unsubscribe' },
    ])

    this.bot.onText(/\/subscribe/, (msg) => {
      const chatId = msg.chat.id
      // TODO choose app in telegram menu
      const appId = EnvService.appStoreConfig.appId

      this.db
        .addSubscriber(appId, chatId)
        .then(() => this.bot.sendMessage(chatId, 'Successfully subscribed!'))
        .catch((e) =>
          this.bot.sendMessage(chatId, getMessageFromError(e, 'Cannot add subscription right now. Try again later.')),
        )
    })

    this.bot.onText(/\/unsubscribe/, (msg) => {
      const chatId = msg.chat.id
      // TODO choose app in telegram menu
      const appId = EnvService.appStoreConfig.appId

      this.db
        .removeSubscriber(appId, chatId)
        .then(() => this.bot.sendMessage(chatId, 'Successfully unsubscribed!'))
        .catch((e) =>
          this.bot.sendMessage(
            chatId,
            getMessageFromError(e, 'Cannot remove subscription right now. Try again later.'),
          ),
        )
    })
  }

  notifyAboutNewVersion(subscribers, appInfo) {
    if (subscribers && subscribers.length) {
      subscribers.forEach((chatId) =>
        this.bot.sendMessage(
          chatId,
          `${appInfo.name} released version ${appInfo.version}!\n\nCheck it out: ${appInfo.url}`,
        ),
      )
    }
  }
}

export default NotificationService
