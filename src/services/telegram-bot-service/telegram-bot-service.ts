import TelegramBot from 'node-telegram-bot-api'

import { getMessageFromError } from '../../utils'
import { DatabaseService } from '../database-service'
import EnvService from '../env-service'
import {Commands} from "./options";

interface AppInfo {
  name: string
  version: string
  url: string
}

class TelegramBotService {
  private bot: TelegramBot
  private db: DatabaseService

  constructor(db: DatabaseService, token: string) {
    this.bot = new TelegramBot(token, { polling: true })
    this.db = db

    this.listenChatCommands()
  }

  notifyAboutNewVersion(subscribers: number[], appInfo: AppInfo) {
    if (subscribers && subscribers.length) {
      subscribers.forEach((chatId) =>
        this.bot.sendMessage(
          chatId,
          `${appInfo.name} released version ${appInfo.version}!\n\nCheck it out: ${appInfo.url}`,
        ),
      )
    }
  }

  private listenChatCommands() {
    this.bot.setMyCommands([
      { command: Commands.subscribe, description: 'Subscribe' },
      { command: Commands.unsubscribe, description: 'Unsubscribe' },
    ])

    this.bot.onText(new RegExp(Commands.start), this.handleStart.bind(this))
    this.bot.onText(new RegExp(Commands.subscribe), this.handleSubscribe.bind(this))
    this.bot.onText(new RegExp(Commands.unsubscribe), this.handleUnsubscribe.bind(this))
  }

  private async handleStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id

    await this.bot.sendMessage(
      chatId,
      'Hello! Our bot can notify about new versions of the apps that is released in the AppStore. Use the menu to learn about the functionality.',
    )
  }

  private async handleSubscribe(msg: TelegramBot.Message) {
    const chatId = msg.chat.id

    try {
      // TODO choose app in telegram menu
      const appId = EnvService.appStoreConfig.appId

      await this.db.addSubscriber(appId, chatId)
      await this.bot.sendMessage(chatId, 'Successfully subscribed!')
    } catch (e) {
      await this.bot.sendMessage(chatId, getMessageFromError(e, 'Cannot add subscription right now. Try again later.'))
    }
  }

  private async handleUnsubscribe(msg: TelegramBot.Message) {
    const chatId = msg.chat.id

    try {
      // TODO choose app in telegram menu
      const appId = EnvService.appStoreConfig.appId

      await this.db.removeSubscriber(appId, chatId)
      await this.bot.sendMessage(chatId, 'Successfully unsubscribed!')
    } catch (e) {
      await this.bot.sendMessage(
        chatId,
        getMessageFromError(e, 'Cannot remove subscription right now. Try again later.'),
      )
    }
  }
}

export default TelegramBotService
