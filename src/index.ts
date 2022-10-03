import * as dotenv from 'dotenv'
import PollingService from './services/polling-services'

dotenv.config()

const pollingService = new PollingService()
pollingService.startPolling()
