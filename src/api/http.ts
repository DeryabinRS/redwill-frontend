import axios from 'axios'
import { API_URL } from '../config/constants'

export const http = axios.create({
  baseURL: API_URL || '/api',
  timeout: 15000,
  withCredentials: true,
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Centralized error handling placeholder
    return Promise.reject(error)
  },
)


