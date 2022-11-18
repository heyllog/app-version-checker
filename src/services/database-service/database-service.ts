import _ from 'lodash'
import { JSONFile, Low } from 'lowdb'

import DatabaseServiceError from './database-service-error'
import { AppInfo, Database } from './types'
import logger from '../../lib/logger'

class DatabaseService {
  private db: Low<Database>
  private isReady = false

  private readonly logger = logger.child({ service: 'database-service' })

  constructor() {
    this.db = new Low(new JSONFile('./db/db.json'))
  }

  /* Read data from database */
  async init() {
    this.logger.info('Init database')
    await this.db.read()

    if (!this.db.data) {
      this.logger.info('JSON file is empty, fill with empty fields')
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
    this.logger.info(`Get app info for ${appId}`)
    this.checkServiceReadyToUse(this.db.data)

    return this.db.data.appInfo[appId]
  }

  /* Set app info to database by id */
  async setAppInfo(appId: string, appInfo: AppInfo): Promise<void> {
    this.logger.info(`Set app info for ${appId}. New info: ${JSON.stringify(appInfo)}`)
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
    this.logger.info(`Get subscribers for ${appId}`)
    this.checkServiceReadyToUse(this.db.data)

    return this.db.data?.subscribers?.[appId] || []
  }

  /* Add telegram id to database */
  async addSubscriber(appId: string, subscriberId: number): Promise<void> {
    this.logger.info(`Add subscriber(${subscriberId}) for ${appId}`)
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
    this.logger.info(`Remove subscriber(${subscriberId}) for ${appId}`)
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
    this.logger.info(`Get subscriptions for ${subscriberId}`)
    this.checkServiceReadyToUse(this.db.data)

    const bundleIds = Object.keys(this.db.data.subscribers).filter((bundleId) =>
      this.db.data?.subscribers?.[bundleId].includes(subscriberId),
    )

    return bundleIds.map((id) => ({
      name: this.db.data?.appInfo[id]?.name || id,
      bundleId: id,
    }))
  }

  /* Check that service is ready to use */
  private checkServiceReadyToUse(input: Database | null): asserts input is Database {
    if (!this.isReady) {
      const errorMessage = 'Run init() before use DatabaseService'

      this.logger.error(errorMessage)
      throw new DatabaseServiceError(errorMessage)
    }

    if (!input || !input.appInfo || !input.subscribers) {
      const errorMessage = 'Database is corrupted'

      this.logger.error(errorMessage)
      throw new DatabaseServiceError(errorMessage)
    }
  }
}

export default DatabaseService
