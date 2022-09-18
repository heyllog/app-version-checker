const fs = require('fs')
const { join } = require('path')

const dotenv = require('dotenv')

const envPath = join(__dirname, '../.env')
const sampleEnvPath = join(__dirname, '../.env.sample')

// Check that .env and .env.sample files exists
if (!fs.existsSync(envPath)) {
  console.log('\x1b[31m', `No .env file`)
  process.exit(1)
}

if (!fs.existsSync(sampleEnvPath)) {
  console.log('\x1b[31m', `No .env.sample file`)
  process.exit(1)
}

// Read .env and .env.sample files
const yourEnvBuffer = fs.readFileSync(envPath)
const sampleEnvBuffer = fs.readFileSync(sampleEnvPath)
// Parse .env files to object
const yourEnvConfig = dotenv.parse(yourEnvBuffer)
const sampleEnvConfig = dotenv.parse(sampleEnvBuffer)

// Check that every field from sample file is exists and filled
const missingKeys = Object.keys(sampleEnvConfig).filter(value => !yourEnvConfig?.[value])

// If any missing keys => exit with error
if (missingKeys.length) {
  console.log('\x1b[31m', `Missing keys in .env file: ${missingKeys.join(', ')}`)
  process.exit(1)
}
