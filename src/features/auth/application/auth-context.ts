import { createContext } from 'react'
import type { AuthSession, LoginCredentials } from '../domain/auth.types'

export type AuthContextValue = {
  session: AuthSession | null
  user: AuthSession['user'] | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials, remember: boolean) => Promise<AuthSession>
  logout: () => Promise<void>
  refreshSession: () => Promise<AuthSession | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
