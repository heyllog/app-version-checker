import axios, { AxiosRequestConfig } from 'axios'
import EnvService from '../services/env-service'

const createAxiosInstance = (config?: AxiosRequestConfig) =>
  axios.create({
    timeout: EnvService.requestConfig.timeout,
    ...config,
  })

export default createAxiosInstance
