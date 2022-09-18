import { normalizeUrl } from '../utils/index.js'

class EnvService {
  static get requestConfig() {
    return {
      timeout: Number(process.env.REQUEST_TIMEOUT),
      interval: Number(process.env.REQUESTS_INTERVAL),
    }
  }

  static get appStoreConfig() {
    return {
      path: normalizeUrl(process.env.APP_STORE_PATH.trim()),
      appId: process.env.APP_STORE_APP_ID.trim(),
    }
  }

  static get googlePlayConfig() {
    return {
      path: normalizeUrl(process.env.GOOGLE_PLAY_PATH.trim()),
      appId: process.env.GOOGLE_PLAY_APP_ID.trim(),
    }
  }
}

export default EnvService
