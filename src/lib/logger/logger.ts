import * as dotenv from 'dotenv'
import _ from 'lodash'

import winston from 'winston'
import TelegramLogger from 'winston-telegram'
import DailyRotateFile from 'winston-daily-rotate-file'
import { TransformableInfo } from 'logform'

import EnvService from '../../services/env-service'
import { errorFilter, formatLog, infoFilter, TIMESTAMP_FORMAT } from './utils'

const { combine, printf, timestamp } = winston.format
dotenv.config()

const defaultTransportConfig = {
  dirname: 'logs',
  datePattern: 'DD-MM-YYYY',
  zippedArchive: true,
  maxFiles: '10',
  maxSize: '1m',
}

const infoTransport = new DailyRotateFile({
  ...defaultTransportConfig,
  level: 'info',
  filename: 'info-%DATE%.log',
  format: combine(timestamp({ format: TIMESTAMP_FORMAT }), printf(formatLog), infoFilter()),
})

const errorTransport = new DailyRotateFile({
  ...defaultTransportConfig,
  level: 'error',
  filename: 'error-%DATE%.log',
  format: combine(timestamp({ format: TIMESTAMP_FORMAT }), printf(formatLog), errorFilter()),
})

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp({ format: TIMESTAMP_FORMAT }), printf(formatLog)),
  transports: [
    new winston.transports.Console(),
    infoTransport,
    errorTransport,
    new TelegramLogger({
      level: 'error',
      token: EnvService.telegramBotToken,
      chatId: EnvService.telegramAdmin,
      formatMessage: (info: TransformableInfo) => `${_.capitalize(info.level)}: ${info.message}`,
    }),
  ],
})

export default logger
