import createAxiosInstance from '../utils/createAxiosInstance.js'
import { normalizeUrl } from '../utils/index.js'
import EnvService from './EnvService.js'

class AppStoreServiceError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AppStoreServiceError'
  }
}

class AppStoreService {
  constructor(config) {
    this.api = createAxiosInstance(config)
  }

  getAppStoreUrl(options) {
    const { path } = EnvService.appStoreConfig
    const appStoreUrl = normalizeUrl(path)

    const countryCode = options?.countryCode || ''
    const date = options?.date || new Date().getTime()

    return `${appStoreUrl}/${countryCode}lookup?bundleId=${options.appId}&date=${date}`
  }

  async getAppInfo(options) {
    if (!options?.appId) {
      throw new AppStoreServiceError('Provide appId')
    }

    const { data } = await this.api.get(this.getAppStoreUrl(options))

    if (data.resultCount) {
      return {
        name: data.results[0].trackName,
        version: data.results[0].version,
        company: data.results[0].sellerName,
        url: data.results[0].trackViewUrl,
        releaseDate: data.results[0].releaseDate,
        currentVersionReleaseDate: data.results[0].currentVersionReleaseDate,
      }
    }

    throw new AppStoreServiceError('No info about this app.')
  }
}

export default AppStoreService
