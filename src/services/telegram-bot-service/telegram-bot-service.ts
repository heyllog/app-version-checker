import TelegramBot from 'node-telegram-bot-api'

import { DatabaseService } from '../database-service'
import { AppInfo as DatabaseAppInfo } from '../database-service/types'
import { AppBundleId, AppForSubscription, Command } from './options'
import { getMessageFromError } from '../../utils'
import logger from '../../lib/logger'

interface AppInfo {
  name: string
  version: string
  storeUrl: string
}

class TelegramBotService {
  private bot: TelegramBot
  private db: DatabaseService

  private readonly logger = logger.child({ service: 'telegram-bot-service' })

  constructor(db: DatabaseService, token: string) {
    this.bot = new TelegramBot(token, { polling: true })
    this.db = db

    this.listenChatCommands()
  }

  notifyAboutNewVersion(subscribers: number[], appInfo: AppInfo) {
    this.logger.info(`New ${appInfo.name} version - ${appInfo.version}. Notify ${subscribers.length} users`)

    if (subscribers && subscribers.length) {
      subscribers.forEach((chatId) =>
        this.bot.sendMessage(
          chatId,
          `${appInfo.name} released version ${appInfo.version}!\n\nCheck it out: ${appInfo.storeUrl}`,
        ),
      )
    }
  }

  private listenChatCommands() {
    this.logger.info('Start listening commands')

    this.bot.setMyCommands([
      { command: Command.Subscribe, description: 'Subscribe' },
      { command: Command.Unsubscribe, description: 'Unsubscribe' },
      { command: Command.Subscriptions, description: 'Show your subscriptions' },
    ])

    this.bot.onText(new RegExp(Command.Start), this.handleStart.bind(this))
    this.bot.onText(new RegExp(Command.Subscriptions), this.handleSubscriptions.bind(this))
    this.bot.onText(new RegExp(Command.Subscribe), this.handleSubscribe.bind(this))
    this.bot.onText(new RegExp(Command.Unsubscribe), this.handleUnsubscribe.bind(this))
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this))
  }

  private async handleStart(msg: TelegramBot.Message) {
    this.logger.info(`New user: ${msg.chat.id}`)
    const chatId = msg.chat.id

    await this.bot.sendMessage(
      chatId,
      'Hello! Our bot can notify about new versions of the apps that is released in the AppStore. Use the menu to learn about the functionality.',
    )
  }

  private async handleSubscriptions(msg: TelegramBot.Message) {
    this.logger.info(`User(${msg.chat.id}) requests ${Command.Subscriptions}`)

    const chatId = msg.chat.id
    const userSubscriptions = this.db.getUserSubscriptions(chatId)
    const options = userSubscriptions.map((subscription) => [
      {
        text: subscription.name,
        callback_data: this.formatCallbackData({
          command: Command.Subscriptions,
          appId: subscription.bundleId,
        }),
      },
    ])

    await this.bot.sendMessage(chatId, 'Click to see more info', {
      reply_markup: {
        inline_keyboard: options,
      },
    })
  }

  private async handleSubscribe(msg: TelegramBot.Message) {
    this.logger.info(`User(${msg.chat.id}) requests ${Command.Subscribe}`)
    const chatId = msg.chat.id

    await this.bot.sendMessage(chatId, 'Choose app to subscribe', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: AppForSubscription.ChangeNow,
              callback_data: this.formatCallbackData({
                command: Command.Subscribe,
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
    this.logger.info(`User(${msg.chat.id}) requests ${Command.Unsubscribe}`)

    const chatId = msg.chat.id
    const userSubscriptions = this.db.getUserSubscriptions(chatId)
    const options = userSubscriptions.map((subscription) => [
      {
        text: subscription.name,
        callback_data: this.formatCallbackData({
          command: Command.Unsubscribe,
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

      if (command === Command.Subscribe) {
        try {
          await this.db.addSubscriber(appId, chatId)
          await this.bot.sendMessage(chatId, 'Successfully subscribed!')
          this.logger.info(`User(${chatId}) subscribes to ${appId}`)
        } catch (e) {
          this.logger.warn(`User(${chatId}) can't subscribe to ${appId}. Error: ${getMessageFromError(e)}`)
          await this.bot.sendMessage(
            chatId,
            getMessageFromError(e, 'Cannot add subscription right now. Try again later.'),
          )
        }
      }

      if (command === Command.Unsubscribe) {
        try {
          await this.db.removeSubscriber(appId, chatId)
          await this.bot.sendMessage(chatId, 'Successfully unsubscribed!')
          this.logger.info(`User(${chatId}) unsubscribes to ${appId}`)
        } catch (e) {
          this.logger.warn(`User(${chatId}) can't unsubscribe to ${appId}. Error: ${getMessageFromError(e)}`)
          await this.bot.sendMessage(
            chatId,
            getMessageFromError(e, 'Cannot remove subscription right now. Try again later.'),
          )
        }
      }

      if (command === Command.Subscriptions) {
        try {
          const appInfo = await this.db.getAppInfo(appId)

          if (!appInfo) {
            throw new Error('Cannot show info for this app right now. Try again later.')
          }

          await this.bot.sendMessage(chatId, this.formatAppInfo(appInfo))
          this.logger.info(`User(${chatId}) watches list of subscriptions`)
        } catch (e) {
          this.logger.warn(`User(${chatId}) can't request list of subscriptions. Error: ${getMessageFromError(e)}`)
          await this.bot.sendMessage(
            chatId,
            getMessageFromError(e, 'Cannot show info for this app right now. Try again later.'),
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

  private formatAppInfo({
    name,
    version,
    currentVersionReleaseDate,
    releaseDate,
    storeUrl,
    company,
  }: DatabaseAppInfo): string {
    return `Name: ${name}\nCompany: ${company}\nVersion: ${version}\nRelease date: ${releaseDate}\nUpdated: ${currentVersionReleaseDate}\nLink to store: ${storeUrl}`
  }
}

export default TelegramBotService
