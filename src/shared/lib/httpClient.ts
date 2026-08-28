import axios, { AxiosError } from 'axios'
import { API_URL } from '../config/env'

export type ApiErrorPayload = {
  message?: string | string[]
  error?: string
  statusCode?: number
}

export class ApiError extends Error {
  statusCode?: number
  payload?: ApiErrorPayload

  constructor(message: string, statusCode?: number, payload?: ApiErrorPayload) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.payload = payload
  }
}

let resolveAccessToken: () => string | null = () => null

export function configureAccessTokenResolver(resolver: () => string | null) {
  resolveAccessToken = resolver
}

export const httpClient = axios.create({
  baseURL: API_URL,
})

httpClient.interceptors.request.use(
  (config) => {
    // Tự động đính kèm Token (nếu có) vào Header
    const token = resolveAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Axios tự động set header Content-Type dựa vào data type
    // Không cần thủ công set application/json hay multipart/form-data
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

httpClient.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp (do API thường trả JSON)
    return response.data
  },
  (error: AxiosError<ApiErrorPayload>) => {
    // Xử lý lỗi để ném ra ApiError giống thiết kế cũ
    const payload = error.response?.data
    let message = 'Có lỗi xảy ra. Vui lòng thử lại.'
    
    if (payload?.message) {
      message = Array.isArray(payload.message) ? payload.message.join(', ') : payload.message
    } else if (payload?.error) {
      message = payload.error
    } else if (error.message) {
      message = error.message
    }
    
    return Promise.reject(
      new ApiError(message, error.response?.status, payload)
    )
  }
)
