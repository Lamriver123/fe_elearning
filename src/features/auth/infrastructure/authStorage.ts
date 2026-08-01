import type { AuthSession } from '../domain/auth.types'

const SESSION_STORAGE_KEY = 'elearning.auth.session'
const LOCAL_STORAGE_KEY = 'elearning.auth.remembered'

let memorySession: AuthSession | null = null

function safeRead(storage: Storage, key: string): AuthSession | null {
  try {
    const rawValue = storage.getItem(key)
    if (!rawValue) {
      return null
    }

    return JSON.parse(rawValue) as AuthSession
  } catch {
    storage.removeItem(key)
    return null
  }
}

function getStoredSession() {
  const sessionValue = safeRead(window.sessionStorage, SESSION_STORAGE_KEY)
  if (sessionValue) {
    return sessionValue
  }

  return safeRead(window.localStorage, LOCAL_STORAGE_KEY)
}

export function getAuthSession() {
  if (memorySession) {
    return memorySession
  }

  memorySession = getStoredSession()
  return memorySession
}

export function saveAuthSession(session: AuthSession) {
  memorySession = session
  const payload = JSON.stringify(session)

  if (session.remember) {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, payload)
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, payload)
  window.localStorage.removeItem(LOCAL_STORAGE_KEY)
}

export function updateAuthTokens(accessToken: string, refreshToken: string) {
  const currentSession = getAuthSession()
  if (!currentSession) {
    return null
  }

  const nextSession = {
    ...currentSession,
    accessToken,
    refreshToken,
    savedAt: Date.now(),
  }

  saveAuthSession(nextSession)
  return nextSession
}

export function clearAuthSession() {
  memorySession = null
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
  window.localStorage.removeItem(LOCAL_STORAGE_KEY)
}

export function getAccessToken() {
  return getAuthSession()?.accessToken ?? null
}

export function getRefreshToken() {
  return getAuthSession()?.refreshToken ?? null
}
