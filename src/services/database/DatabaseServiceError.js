class DatabaseServiceError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DatabaseServiceError'
  }
}

export default DatabaseServiceError
