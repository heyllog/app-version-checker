import axios, { AxiosRequestConfig } from 'axios'
import EnvService from '../services/EnvService'

const createAxiosInstance = (config?: AxiosRequestConfig) =>
  axios.create({
    timeout: EnvService.requestConfig.timeout,
    ...config,
  })

export default createAxiosInstance
