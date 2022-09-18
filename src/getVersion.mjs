// https://github.com/kimxogus/react-native-version-check/blob/master/packages/react-native-version-check/src/providers/appStore.js

import axios from 'axios'
import EnvService from './EnvService.mjs'
import { getMessageFromError, normalizeUrl } from './utils.mjs'

export const getAppStoreVersion = async () => {
  try {
    const { path, appId } = EnvService.appStoreConfig
    const appStoreUrl = normalizeUrl(path)
    const countryCode = ''
    const dateNow = new Date().getTime()
    const url = `${appStoreUrl}/${countryCode}lookup?bundleId=${appId}&date=${dateNow}`

    const { data } = await axios.get(url)

    if (data.resultCount) {
      return data.results[0].version
    }

    throw new Error('No info about this app.')
  } catch (e) {
    const message = getMessageFromError(e)

    console.warn(message)
  }
}

export const getGooglePlayVersion = async () => {
  try {
    const { path, appId } = EnvService.appStoreConfig
    const appStoreUrl = normalizeUrl(path)
    const countryCode = ''
    const dateNow = new Date().getTime()
    const url = `${appStoreUrl}/${countryCode}lookup?bundleId=${appId}&date=${dateNow}`

    const { data } = await axios.get(url)

    if (data.resultCount) {
      return data.results[0].version
    }

    throw new Error('No info about this app.')
  } catch (e) {
    const message = getMessageFromError(e)

    console.warn(message)
  }
}
