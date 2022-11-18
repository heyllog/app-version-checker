import winston from 'winston'
import { TransformableInfo } from 'logform'
import _ from 'lodash'

export const errorFilter = winston.format((info) => (info.level === 'error' ? info : false))
export const infoFilter = winston.format((info) => (info.level === 'info' || info.level === 'warn' ? info : false))
export const TIMESTAMP_FORMAT = 'DD.MM.YYYY hh:mm:ss.SSS'

export const formatLog = (info: TransformableInfo) => {
  const { message, level, timestamp, ...otherInfo } = info
  let log = `${_.capitalize(level)}: ${message}`

  if (timestamp) {
    log = `[${timestamp}] `.concat(log)
  }

  if (!_.isEmpty(otherInfo) && _.isObject(otherInfo)) {
    log = log.concat(`. Metadata: ${JSON.stringify(otherInfo)}`)
  }

  return log
}
