import EnvService from './EnvService.mjs'
import { axiosInstance, getMessageFromError, normalizeUrl } from './utils.mjs'

const getAppStoreUrl = () => {
  const { path, appId } = EnvService.appStoreConfig
  const appStoreUrl = normalizeUrl(path)
  const countryCode = ''
  const dateNow = new Date().getTime()

  return `${appStoreUrl}/${countryCode}lookup?bundleId=${appId}&date=${dateNow}`
}

// https://github.com/kimxogus/react-native-version-check/blob/master/packages/react-native-version-check/src/providers/appStore.js
export const getAppStoreVersion = async () => {
  try {
    const { data } = await axiosInstance.get(getAppStoreUrl())

    if (data.resultCount) {
      return data.results[0].version
    }

    throw new Error('No info about this app.')
  } catch (e) {
    const message = getMessageFromError(e)

    console.warn(message)
  }
}

/*
  TODO: get version from google play
  https://github.com/kimxogus/react-native-version-check/blob/master/packages/react-native-version-check/src/providers/playStore.js
 */
