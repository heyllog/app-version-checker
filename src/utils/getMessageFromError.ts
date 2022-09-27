import axios from 'axios'
import { isError, isObject } from 'lodash'

interface ResponseDataWithMessage {
  message: string
}

export const isResponseDataWithMessage = (toBeDetermined: unknown): toBeDetermined is ResponseDataWithMessage =>
  isObject(toBeDetermined) && !!(toBeDetermined as ResponseDataWithMessage).message

const getMessageFromError = (error: unknown, defaultMessage = 'Something went wrong. Please try again.') => {
  if (axios.isAxiosError(error) && error.response?.data && isResponseDataWithMessage(error.response.data)) {
    return error.response.data.message
  }

  if (isError(error) && error?.message) {
    return error.message
  }

  return defaultMessage
}

export default getMessageFromError
