import TelegramBot from 'node-telegram-bot-api'

import { DatabaseService } from '../database-service'
import { AppBundleId, AppForSubscription, Command } from './options'
import { getMessageFromError } from '../../utils'

interface AppInfo {
  name: string
  version: string
  storeUrl: string
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
          `${appInfo.name} released version ${appInfo.version}!\n\nCheck it out: ${appInfo.storeUrl}`,
        ),
      )
    }
  }

  async sendMessage(chatId: number, message: string) {
    await this.bot.sendMessage(chatId, message)
  }

  private listenChatCommands() {
    this.bot.setMyCommands([
      { command: Command.subscribe, description: 'Subscribe' },
      { command: Command.unsubscribe, description: 'Unsubscribe' },
    ])

    this.bot.onText(new RegExp(Command.start), this.handleStart.bind(this))
    this.bot.onText(new RegExp(Command.subscribe), this.handleSubscribe.bind(this))
    this.bot.onText(new RegExp(Command.unsubscribe), this.handleUnsubscribe.bind(this))
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this))
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

    await this.bot.sendMessage(chatId, 'Choose app to subscribe', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: AppForSubscription.ChangeNow,
              callback_data: this.formatCallbackData({
                command: Command.subscribe,
                appId: AppBundleId[AppForSubscription.ChangeNow],
              }),
            },
          ],
          // [{ text: AppsForSubscription.Custom, callback_data: AppsForSubscription.Custom }],
        ],
      },
    })
  }

  private async handleUnsubscribe(msg: TelegramBot.Message) {
    const chatId = msg.chat.id
    const userSubscriptions = this.db.getUserSubscriptions(chatId)
    const options = userSubscriptions.map((subscription) => [
      {
        text: subscription.name,
        callback_data: this.formatCallbackData({
          command: Command.unsubscribe,
          appId: subscription.bundleId,
        }),
      },
    ])

    await this.bot.sendMessage(chatId, 'Choose app to unsubscribe', {
      reply_markup: {
        inline_keyboard: options,
      },
    })
  }

  private async handleCallbackQuery(msg: TelegramBot.CallbackQuery) {
    const data = msg.data
    const chatId = msg.message?.chat.id

    if (chatId && data) {
      const { command, appId } = this.decodeCallbackData(data)

      if (command === Command.subscribe) {
        try {
          await this.db.addSubscriber(appId, chatId)
          await this.bot.sendMessage(chatId, 'Successfully subscribed!')
        } catch (e) {
          await this.bot.sendMessage(
            chatId,
            getMessageFromError(e, 'Cannot add subscription right now. Try again later.'),
          )
        }
      }

      if (command === Command.unsubscribe) {
        try {
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
  }

  private formatCallbackData(data: { command: Command; appId: string }): string {
    return JSON.stringify(data)
  }

  private decodeCallbackData(data: string): { command: Command; appId: string } {
    return JSON.parse(data)
  }
}

export default TelegramBotService
