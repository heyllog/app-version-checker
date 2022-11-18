import { AxiosInstance, AxiosRequestConfig } from 'axios'

import createAxiosInstance from '../../utils/create-axios-instance'
import { normalizeUrl } from '../../utils/index'
import EnvService from '../env-service'
import AppStoreServiceError from './app-store-service-error'
import logger from '../../lib/logger'

interface AppStoreOptions {
  appId: string
  countryCode?: string
  date?: number
}

interface AppInfo {
  name: string
  version: string
  company: string
  storeUrl: string
  releaseDate: string
  currentVersionReleaseDate: string
}

class AppStoreService {
  private api: AxiosInstance

  private readonly logger = logger.child({ service: 'app-store-service' })

  constructor(config?: AxiosRequestConfig) {
    this.api = createAxiosInstance(config)
  }

  async getAppInfo(options: AppStoreOptions): Promise<AppInfo> {
    this.logger.info(`Get app info with options: ${JSON.stringify(options)}`)

    if (!options?.appId) {
      const errorMessage = 'Provide appId in options object'

      this.logger.error(errorMessage)
      throw new AppStoreServiceError(errorMessage)
    }

    const { data } = await this.api.get(this.getAppStoreUrl(options))

    if (data.resultCount) {
      return {
        name: data.results[0].trackName,
        version: data.results[0].version,
        company: data.results[0].sellerName,
        storeUrl: data.results[0].trackViewUrl,
        releaseDate: data.results[0].releaseDate,
        currentVersionReleaseDate: data.results[0].currentVersionReleaseDate,
      }
    }

    const errorMessage = 'No info about this app'

    this.logger.warn(errorMessage)
    throw new AppStoreServiceError(errorMessage)
  }

  private getAppStoreUrl(options: AppStoreOptions): string {
    const { path } = EnvService.appStoreConfig
    const appStoreUrl = normalizeUrl(path)

    const countryCode = options?.countryCode || ''
    const date = options?.date || new Date().getTime()

    return `${appStoreUrl}/${countryCode}lookup?bundleId=${options.appId}&date=${date}`
  }
}

export default AppStoreService
