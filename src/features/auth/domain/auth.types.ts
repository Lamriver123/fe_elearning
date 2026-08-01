import type { UserRole } from '../../../shared/constants/roles'

export type AuthUser = {
  id: string
  userName: string
  fullName: string
  email: string
  phone?: string | null
  isActive: boolean
  dateOfBirth?: string | null
  gender?: string | null
  address?: string | null
  avatar?: string | null
  role: UserRole
  createdAt?: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResponse = {
  message: string
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export type RefreshTokenResponse = {
  accessToken: string
  refreshToken: string
}

export type AuthSession = {
  user: AuthUser
  accessToken: string
  refreshToken: string
  remember: boolean
  savedAt: number
}

export type RegisterCredentials = {
  userName: string
  fullName: string
  password: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  role: UserRole
}

export type VerifyOtpCredentials = {
  email: string
  otp: string
}

export type ResendOtpCredentials = {
  email: string
}
