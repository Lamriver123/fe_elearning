import type {
  LoginCredentials,
  RegisterCredentials,
  ResendOtpCredentials,
  VerifyOtpCredentials,
} from '../domain/auth.types'
import { authApi } from '../infrastructure/authApi'

export function registerAccount(credentials: RegisterCredentials) {
  return authApi.register(credentials)
}

export function loginAccount(credentials: LoginCredentials) {
  return authApi.login(credentials)
}

export function refreshAccountSession(refreshToken: string) {
  return authApi.refresh(refreshToken)
}

export function getAccountProfile(accessToken: string) {
  return authApi.profile(accessToken)
}

export function logoutAccount(accessToken: string) {
  return authApi.logout(accessToken)
}

export function verifyAccountOtp(credentials: VerifyOtpCredentials) {
  return authApi.verifyOtp(credentials)
}

export function resendAccountOtp(credentials: ResendOtpCredentials) {
  return authApi.resendOtp(credentials)
}
