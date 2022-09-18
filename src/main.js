import AppStoreService from './services/AppStoreService.js'
import DatabaseService from './services/database/DatabaseService.js'
import EnvService from './services/EnvService.js'
import NotificationService from './services/NotificationService.js'

const getVersion = async (appStoreService, database, notificationService) => {
  const { appId } = EnvService.appStoreConfig
  const appInfo = await appStoreService.getAppInfo({ appId })
  const lastWrittenVersion = await database.getVersion(appId)

  if (lastWrittenVersion !== appInfo.version) {
    await database.setVersion(appId, appInfo.version)
    const subscribers = await database.getSubscribers(appId)

    notificationService.notifyAboutNewVersion(subscribers, appInfo)
  }
}

const main = async () => {
  const appStoreService = new AppStoreService()
  const database = new DatabaseService()
  const notificationService = new NotificationService(database, EnvService.telegramBotToken)

  await getVersion(appStoreService, database, notificationService)

  setInterval(async () => {
    await getVersion(appStoreService, database, notificationService)
  }, EnvService.requestConfig.interval)
}

export default main
