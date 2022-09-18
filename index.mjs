import * as dotenv from 'dotenv'
import { getAppStoreVersion } from './src/getVersion.mjs'
import EnvService from './src/EnvService.mjs'

dotenv.config()

getAppStoreVersion().then(console.log)

setInterval(async () => {
  const appStoreVersion = await getAppStoreVersion()

  console.log(appStoreVersion)
}, EnvService.requestConfig.interval)
