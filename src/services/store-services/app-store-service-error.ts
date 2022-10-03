class AppStoreServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppStoreServiceError'
  }
}

export default AppStoreServiceError
