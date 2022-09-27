class DatabaseServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseServiceError'
  }
}

export default DatabaseServiceError
