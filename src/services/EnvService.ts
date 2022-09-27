import { normalizeUrl } from '../utils/index'

class EnvServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvServiceError'
  }
}

class EnvService {
  static get telegramBotToken(): string {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new EnvServiceError('Provide TELEGRAM_BOT_TOKEN')
    }

    return process.env.TELEGRAM_BOT_TOKEN
  }

  static get maxSubscribersCount(): number {
    const maxSubscribersCount = Number(process.env.MAX_SUBSCRIBERS_COUNT)

    if (!process.env.MAX_SUBSCRIBERS_COUNT || Number.isNaN(maxSubscribersCount)) {
      throw new EnvServiceError('Provide correct MAX_SUBSCRIBERS_COUNT')
    }

    return maxSubscribersCount
  }

  static get requestConfig(): { timeout: number; interval: number } {
    const timeout = Number(process.env.REQUEST_TIMEOUT)
    const interval = Number(process.env.REQUESTS_INTERVAL)

    if (Number.isNaN(timeout) || Number.isNaN(interval)) {
      throw new EnvServiceError('Provide correct REQUEST_TIMEOUT and REQUESTS_INTERVAL')
    }

    return { timeout, interval }
  }

  static get appStoreConfig(): { path: string; appId: string } {
    if (!process.env.APP_STORE_PATH || !process.env.APP_STORE_APP_ID) {
      throw new EnvServiceError('Provide APP_STORE_PATH and APP_STORE_APP_ID')
    }

    return {
      path: normalizeUrl(process.env.APP_STORE_PATH.trim()),
      appId: process.env.APP_STORE_APP_ID.trim(),
    }
  }
}

export default EnvService
