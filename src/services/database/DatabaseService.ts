import { JSONFile, Low } from 'lowdb'

import DatabaseServiceError from './DatabaseServiceError'
import { isValidVersion } from '../../utils/index'
import EnvService from '../EnvService'
import { Database } from '../../types/database'

class DatabaseService {
  private db: Low<Database>
  private isReady = false

  constructor() {
    this.db = new Low(new JSONFile('db.json'))
  }

  /* Read data from database */
  async init() {
    await this.db.read()

    if (!this.db.data) {
      this.db.data = {
        subscribers: {},
        appVersions: {},
      }

      await this.db.write()
    }

    this.isReady = true
  }

  /* Get version from database by app id */
  async getVersion(appId: string): Promise<string | undefined> {
    if (!this.isReady) {
      await this.init()
    }

    return this.db.data?.appVersions?.[appId]
  }

  /* Set version from database for app id */
  async setVersion(appId: string, version: string) {
    if (!this.isReady) {
      await this.init()
    }

    if (isValidVersion(version)) {
      this.db.data = {
        ...this.db.data,
        appVersions: {
          ...this.db.data?.appVersions,
          [appId]: version,
        },
      }

      await this.db.write()
    } else {
      throw new DatabaseServiceError('Invalid version')
    }
  }

  /* Add telegram id to database */
  async getSubscribers(appId: string): Promise<number[]> {
    if (!this.isReady) {
      await this.init()
    }

    return this.db.data?.subscribers?.[appId] || []
  }

  /* Add telegram id to database */
  async addSubscriber(appId: string, subscriberId: number) {
    if (!this.isReady) {
      await this.init()
    }

    const subscribers = this.db.data?.subscribers?.[appId] || []

    if (subscribers.length >= EnvService.maxSubscribersCount) {
      throw new DatabaseServiceError(
        "Unfortunately, too many people have already subscribed, so we can't add a new subscription",
      )
    }

    if (subscribers.includes(subscriberId)) {
      throw new DatabaseServiceError("You've already subscribed")
    }

    const updatedSubscribers = {
      ...this.db.data?.subscribers,
      [appId]: this.db.data?.subscribers?.[appId]
        ? Array.from(new Set(this.db.data.subscribers[appId].concat(subscriberId)))
        : [subscriberId],
    }

    this.db.data = {
      ...this.db.data,
      subscribers: updatedSubscribers,
    }

    await this.db.write()
  }

  /* Remove telegram id to database */
  async removeSubscriber(appId: string, subscriberId: number) {
    if (!this.isReady) {
      await this.init()
    }

    if (!this.db.data?.subscribers?.[appId]?.includes(subscriberId)) {
      throw new DatabaseServiceError("You haven't been subscribed")
    }

    if (this.db.data.subscribers?.[appId]?.includes(subscriberId)) {
      const subscribers = this.db.data.subscribers?.[appId]?.filter((e) => e !== subscriberId) || []

      this.db.data = {
        ...this.db.data,
        subscribers: {
          ...this.db.data.subscribers,
          [appId]: subscribers,
        },
      }

      await this.db.write()
    }
  }
}

export default DatabaseService
