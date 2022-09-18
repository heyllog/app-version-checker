import axios from 'axios'
import EnvService from '../services/EnvService.js'

const createAxiosInstance = (config) => axios.create({
  timeout: EnvService.requestConfig.timeout,
  ...config,
})

export default createAxiosInstance
