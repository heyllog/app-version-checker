import createAxiosInstance from 'utils/createAxiosInstance'
import { normalizeUrl } from 'utils/index'
import EnvService from '../EnvService'
import { AxiosInstance, AxiosRequestConfig } from 'axios'
import AppStoreServiceError from 'services/StoreServices/AppStoreServiceError'

interface AppStoreOptions {
  appId: string
  countryCode?: string
  date?: number
}

class AppStoreService {
  private api: AxiosInstance

  constructor(config?: AxiosRequestConfig) {
    this.api = createAxiosInstance(config)
  }

  getAppStoreUrl(options: AppStoreOptions) {
    const { path } = EnvService.appStoreConfig
    const appStoreUrl = normalizeUrl(path)

    const countryCode = options?.countryCode || ''
    const date = options?.date || new Date().getTime()

    return `${appStoreUrl}/${countryCode}lookup?bundleId=${options.appId}&date=${date}`
  }

  async getAppInfo(options: AppStoreOptions) {
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
