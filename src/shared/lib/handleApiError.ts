import { ApiError } from './httpClient'

export function handleApiError(error: unknown, fallbackMessage = 'Đã xảy ra lỗi. Vui lòng thử lại sau.'): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallbackMessage
}
