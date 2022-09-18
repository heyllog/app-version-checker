import { Low, JSONFile } from 'lowdb'

class DatabaseServiceError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DatabaseServiceError'
  }
}

class DatabaseService {
  constructor(path) {
    this.db = new Low(new JSONFile(path))
  }

  isValidVersion(version) {
    const versionRegex = /^\d+\.\d+\.\d+$/

    return versionRegex.test(version)
  }

  async getVersion(appId) {
    await this.db.read()

    return this.db.data?.[appId]?.version
  }

  async setVersion(appId, version) {
    if (this.isValidVersion(version)) {
      this.db.data = {
        ...this.db.data,
        [appId]: version,
      }

      await this.db.write()
    } else {
      throw new DatabaseServiceError('Invalid version')
    }
  }
}

export default DatabaseService
