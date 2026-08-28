import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthSession, LoginCredentials } from '../domain/auth.types'
import { getAccountProfile, loginAccount, logoutAccount, refreshAccountSession } from './authUseCases'
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  updateAuthTokens,
} from '../infrastructure/authStorage'
import { AuthContext, type AuthContextValue } from './auth-context'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession())
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    const currentSession = getAuthSession()
    if (!currentSession) {
      setSession(null)
      return null
    }

    const tokens = await refreshAccountSession(currentSession.refreshToken)
    const refreshedSession = updateAuthTokens(tokens.accessToken, tokens.refreshToken)

    if (!refreshedSession) {
      return null
    }

    setSession(refreshedSession)
    return refreshedSession
  }, [])

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      const storedSession = getAuthSession()
      if (!storedSession) {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      try {
        const profile = await getAccountProfile(storedSession.accessToken)
        const verifiedSession = { ...storedSession, user: profile }
        saveAuthSession(verifiedSession)

        if (isMounted) {
          setSession(verifiedSession)
        }
      } catch {
        try {
          const refreshedSession = await refreshSession()
          if (refreshedSession) {
            const profile = await getAccountProfile(refreshedSession.accessToken)
            const verifiedSession = { ...refreshedSession, user: profile }
            saveAuthSession(verifiedSession)

            if (isMounted) {
              setSession(verifiedSession)
            }
          }
        } catch {
          clearAuthSession()

          if (isMounted) {
            setSession(null)
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [refreshSession])

  const login = useCallback(async (credentials: LoginCredentials, remember: boolean) => {
    const response = await loginAccount(credentials)
    const nextSession: AuthSession = {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      remember,
      savedAt: Date.now(),
    }

    saveAuthSession(nextSession)
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(async () => {
    const currentSession = getAuthSession()
    clearAuthSession()
    setSession(null)

    if (!currentSession?.accessToken) {
      return
    }

    try {
      await logoutAccount(currentSession.accessToken)
    } catch {
      // Local logout should still complete if the token is already invalid.
    }
  }, [])

  const updateUser = useCallback((user: AuthSession['user']) => {
    setSession(prev => {
      if (!prev) return null
      const nextSession = { ...prev, user }
      saveAuthSession(nextSession)
      return nextSession
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isLoading,
      login,
      logout,
      refreshSession,
      updateUser,
    }),
    [isLoading, login, logout, refreshSession, session, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
