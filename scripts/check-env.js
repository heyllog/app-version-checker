import fs from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'
import chalk from 'chalk'

const envPath = join('.env')
const sampleEnvPath = join('.env.sample')

// Check that .env and .env.sample files exists
if (!fs.existsSync(envPath)) {
  console.log(chalk.red('No .env file'))
  process.exit(1)
}

if (!fs.existsSync(sampleEnvPath)) {
  console.log(chalk.red('No .env.sample file'))
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
  console.log(chalk.red(`Missing keys in .env file: ${missingKeys.join(', ')}`))
  process.exit(1)
}
