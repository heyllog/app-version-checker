const isValidVersion = (version) => {
  const versionRegex = /^\d+\.\d+\.\d+$/

  return versionRegex.test(version)
}

export default isValidVersion
