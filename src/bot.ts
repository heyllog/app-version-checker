import AppStoreService from './services/StoreServices/AppStoreService'
import DatabaseService from './services/database/DatabaseService'
import EnvService from './services/EnvService'
import NotificationService from './services/NotificationService'

const getVersion = async (appStoreService: AppStoreService, database: DatabaseService, notificationService: NotificationService) => {
  const { appId } = EnvService.appStoreConfig
  const appInfo = await appStoreService.getAppInfo({ appId })
  const lastWrittenVersion = await database.getVersion(appId)

  if (lastWrittenVersion !== appInfo.version) {
    await database.setVersion(appId, appInfo.version)
    const subscribers = await database.getSubscribers(appId)

    notificationService.notifyAboutNewVersion(subscribers, appInfo)
  }
}

const bot = async () => {
  const appStoreService = new AppStoreService()
  const database = new DatabaseService()
  const notificationService = new NotificationService(database, EnvService.telegramBotToken)

  await getVersion(appStoreService, database, notificationService)

  setTimeout(async () => {
    await getVersion(appStoreService, database, notificationService)
    await bot()
  }, EnvService.requestConfig.interval)
}

export default bot
