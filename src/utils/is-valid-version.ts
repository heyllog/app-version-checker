const isValidVersion = (version: string): boolean => {
  const versionRegex = /^\d+\.\d+\.\d+$/

  return versionRegex.test(version)
}

export default isValidVersion
