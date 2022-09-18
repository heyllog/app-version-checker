import axios from 'axios'

const isResponseDataWithMessage = (toBeDetermined) => !!toBeDetermined?.message

const getMessageFromError = (error, defaultMessage = 'Something went wrong. Please try again.') => {
  if (axios.isAxiosError(error) && error.response?.data && isResponseDataWithMessage(error.response.data)) {
    return error.response.data.message
  }

  if (error?.message) {
    return error.message
  }

  return defaultMessage
}

export default getMessageFromError
