import { JSONFile, Low } from 'lowdb'

import DatabaseServiceError from './database-service-error'
import { AppInfo, Database } from './types'
import _ from 'lodash'

class DatabaseService {
  private db: Low<Database>
  private isReady = false

  constructor() {
    this.db = new Low(new JSONFile('./db/db.json'))
  }

  /* Read data from database */
  async init() {
    await this.db.read()

    if (!this.db.data) {
      this.db.data = {
        subscribers: {},
        appInfo: {},
      }

      await this.db.write()
    }

    this.isReady = true
  }

  /* Get app info from database by app id */
  getAppInfo(appId: string): AppInfo | undefined {
    this.checkServiceReadyToUse(this.db.data)

    return this.db.data.appInfo[appId]
  }

  /* Set app info to database by id */
  async setAppInfo(appId: string, appInfo: AppInfo): Promise<void> {
    this.checkServiceReadyToUse(this.db.data)

    this.db.data = {
      ...this.db.data,
      appInfo: {
        ...this.db.data.appInfo,
        [appId]: appInfo,
      },
    }

    await this.db.write()
  }

  /* Get subscribers from database */
  getSubscribers(appId: string): number[] {
    this.checkServiceReadyToUse(this.db.data)

    return this.db.data?.subscribers?.[appId] || []
  }

  /* Add telegram id to database */
  async addSubscriber(appId: string, subscriberId: number): Promise<void> {
    this.checkServiceReadyToUse(this.db.data)

    const subscribers = this.db.data?.subscribers?.[appId] || []

    if (subscribers.includes(subscriberId)) {
      throw new DatabaseServiceError("You've already subscribed")
    }

    this.db.data.subscribers = {
      ...this.db.data?.subscribers,
      [appId]: this.db.data?.subscribers?.[appId]
        ? Array.from(new Set(this.db.data.subscribers[appId].concat(subscriberId)))
        : [subscriberId],
    }

    await this.db.write()
  }

  /* Remove telegram id to database */
  async removeSubscriber(appId: string, subscriberId: number) {
    this.checkServiceReadyToUse(this.db.data)

    if (!this.db.data?.subscribers?.[appId]?.includes(subscriberId)) {
      throw new DatabaseServiceError("You haven't been subscribed")
    }

    if (this.db.data.subscribers?.[appId]?.includes(subscriberId)) {
      const appSubscribers = this.db.data.subscribers?.[appId]?.filter((e) => e !== subscriberId)
      const subscribers = {
        ...this.db.data.subscribers,
        [appId]: appSubscribers,
      }

      if (_.isEmpty(appSubscribers)) {
        delete subscribers[appId]
      }

      this.db.data = {
        ...this.db.data,
        subscribers,
      }

      await this.db.write()
    }
  }

  /* Get user's subscriptions by id */
  getUserSubscriptions(subscriberId: number): { name: string; bundleId: string }[] {
    this.checkServiceReadyToUse(this.db.data)

    const bundleIds = Object.keys(this.db.data.subscribers).filter((bundleId) =>
      this.db.data?.subscribers?.[bundleId].includes(subscriberId),
    )

    return bundleIds.map((id) => ({
      name: this.db.data?.appInfo[id]?.name || id,
      bundleId: id,
    }))
  }

  /* Get applications that users are subscribed to */
  async getSubscriptionApps(): Promise<string[]> {
    this.checkServiceReadyToUse(this.db.data)

    return Object.keys(this.db.data.subscribers)
  }

  /* Check that service is ready to use */
  private checkServiceReadyToUse(input: Database | null): asserts input is Database {
    if (!this.isReady) {
      throw new DatabaseServiceError('Run init() before use DatabaseService')
    }

    if (!input || !input.appInfo || !input.subscribers) {
      throw new DatabaseServiceError('Database is corrupted')
    }
  }
}

export default DatabaseService
