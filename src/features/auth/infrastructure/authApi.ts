import { httpClient } from '../../../shared/lib/httpClient'
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterCredentials,
  VerifyOtpCredentials,
  ResendOtpCredentials,
} from '../domain/auth.types'

export const authApi = {
  register(credentials: RegisterCredentials) {
    return httpClient.post<{ message: string }>('/auth/register', credentials)
  },

  verifyOtp(credentials: VerifyOtpCredentials) {
    return httpClient.post<{ message: string }>('/auth/verify-otp', credentials)
  },

  resendOtp(credentials: ResendOtpCredentials) {
    return httpClient.post<{ message: string }>('/auth/resend-otp', credentials)
  },

  login(credentials: LoginCredentials) {
    return httpClient.post<LoginResponse>('/auth/login', credentials)
  },

  refresh(refreshToken: string) {
    return httpClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken })
  },

  profile(accessToken: string) {
    // Kể cả có interceptor, token cũng có thể truyền qua Config ghi đè nếu cần thiết
    // Tuy nhiên do Interceptor tự lấy token từ authStorage rồi, ở đây ta chỉ cần gọi GET
    // Dù sao để truyền vào an toàn cho quá trình init (restoreSession), ta vẫn override header
    return httpClient.get<AuthUser>('/auth/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  },

  logout(accessToken: string) {
    return httpClient.post<{ message: string }>('/auth/logout', null, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  },
}
