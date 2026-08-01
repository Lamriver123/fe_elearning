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
    return httpClient.post('/auth/register', credentials) as Promise<{ message: string }>
  },

  verifyOtp(credentials: VerifyOtpCredentials) {
    return httpClient.post('/auth/verify-otp', credentials) as Promise<{ message: string }>
  },

  resendOtp(credentials: ResendOtpCredentials) {
    return httpClient.post('/auth/resend-otp', credentials) as Promise<{ message: string }>
  },

  login(credentials: LoginCredentials) {
    return httpClient.post('/auth/login', credentials) as Promise<LoginResponse>
  },

  refresh(refreshToken: string) {
    return httpClient.post('/auth/refresh', { refreshToken }) as Promise<RefreshTokenResponse>
  },

  profile(accessToken: string) {
    // Kể cả có interceptor, token cũng có thể truyền qua Config ghi đè nếu cần thiết
    // Tuy nhiên do Interceptor tự lấy token từ authStorage rồi, ở đây ta chỉ cần gọi GET
    // Dù sao để truyền vào an toàn cho quá trình init (restoreSession), ta vẫn override header
    return httpClient.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }) as Promise<AuthUser>
  },

  logout(accessToken: string) {
    return httpClient.post('/auth/logout', null, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }) as Promise<{ message: string }>
  },
}
