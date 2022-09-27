import * as dotenv from 'dotenv'

import PollingService from './services/PollingService'

dotenv.config()

const pollingService = new PollingService()
pollingService.startPolling()
