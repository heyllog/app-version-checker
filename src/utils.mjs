import axios from 'axios'
import EnvService from './EnvService.mjs'

const isResponseDataWithMessage = (toBeDetermined) => !!toBeDetermined?.message

export const getMessageFromError = (error, defaultMessage = 'Something went wrong. Please try again.') => {
  if (axios.isAxiosError(error) && error.response?.data && isResponseDataWithMessage(error.response.data)) {
    return error.response.data.message
  }

  if (error?.message) {
    return error.message
  }

  return defaultMessage
}

export const normalizeUrl = (url) => (url.endsWith('/') ? url.slice(0, -1) : url)

export const axiosInstance = axios.create({
  timeout: EnvService.requestConfig.timeout,
})
