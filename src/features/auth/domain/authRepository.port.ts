import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterCredentials,
  ResendOtpCredentials,
  VerifyOtpCredentials,
} from './auth.types'

export type AuthRepository = {
  register(credentials: RegisterCredentials): Promise<{ message: string }>
  verifyOtp(credentials: VerifyOtpCredentials): Promise<{ message: string }>
  resendOtp(credentials: ResendOtpCredentials): Promise<{ message: string }>
  login(credentials: LoginCredentials): Promise<LoginResponse>
  refresh(refreshToken: string): Promise<RefreshTokenResponse>
  profile(accessToken: string): Promise<AuthUser>
  logout(accessToken: string): Promise<{ message: string }>
}
