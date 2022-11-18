import winston from 'winston'
import { TransformableInfo } from 'logform'
import _ from 'lodash'

export const errorFilter = winston.format((info) => (info.level === 'error' ? info : false))
export const infoFilter = winston.format((info) => (info.level === 'info' ? info : false))
export const formatLog = (info: TransformableInfo) => `[${info.timestamp}] ${_.capitalize(info.level)}: ${info.message}`
export const TIMESTAMP_FORMAT = 'DD.MM.YYYY hh:mm:ss.SSS'
