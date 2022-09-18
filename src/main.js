import AppStoreService from './services/AppStoreService.js'
import DatabaseService from './services/database/DatabaseService.js'
import EnvService from './services/EnvService.js'
import NotificationService from './services/NotificationService.js'

const main = async () => {
  const { appId } = EnvService.appStoreConfig
  const appStoreService = new AppStoreService()

  const database = new DatabaseService()
  const notificationService = new NotificationService(database, EnvService.telegramBotToken)

  const appInfo = await appStoreService.getAppInfo({ appId })

  const lastWrittenVersion = await database.getVersion(appId)

  if (lastWrittenVersion !== appInfo.version) {
    await database.setVersion(appId, appInfo.version)
    const subscribers = await database.getSubscribers(appId)

    console.log(subscribers)

    notificationService.notifyAboutNewVersion(subscribers, appInfo)
  }
}

export default main
