import AppStoreService from './services/AppStoreService.js'
import DatabaseService from './services/DatabaseService.js'
import EnvService from './services/EnvService.js'

const main = async () => {
  const { appId } = EnvService.appStoreConfig
  const appStoreService = new AppStoreService()
  const database = new DatabaseService('db.json')

  const { version } = await appStoreService.getAppInfo({ appId })

  await database.setVersion(appId, version)
}

export default main
