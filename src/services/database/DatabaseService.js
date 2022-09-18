import { JSONFile, Low } from 'lowdb'

import DatabaseServiceError from './DatabaseServiceError.js'
import { isValidVersion } from '../../utils/index.js'
import EnvService from '../EnvService.js'

class DatabaseService {
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
  async getVersion(appId) {
    if (!this.isReady) {
      await this.init()
    }

    return this.db.data?.appVersions?.[appId]
  }

  /* Set version from database for app id */
  async setVersion(appId, version) {
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
  async getSubscribers(appId) {
    if (!this.isReady) {
      await this.init()
    }

    return this.db.data.subscribers[appId]
  }

  /* Add telegram id to database */
  async addSubscriber(appId, subscriberId) {
    if (!this.isReady) {
      await this.init()
    }

    if (this.db.data.subscribers?.[appId]?.length >= EnvService.maxSubscribersCount) {
      throw new DatabaseServiceError(
        "Unfortunately, too many people have already subscribed, so we can't add a new subscription",
      )
    }

    if (this.db.data.subscribers?.[appId]?.includes(subscriberId)) {
      throw new DatabaseServiceError("You've already subscribed")
    }

    this.db.data.subscribers[appId] = this.db.data.subscribers[appId]
      ? Array.from(new Set(this.db.data.subscribers[appId].concat(subscriberId)))
      : [subscriberId]

    await this.db.write()
  }

  /* Remove telegram id to database */
  async removeSubscriber(appId, subscriberId) {
    if (!this.isReady) {
      await this.init()
    }

    if (!this.db.data.subscribers?.[appId]?.includes(subscriberId)) {
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
