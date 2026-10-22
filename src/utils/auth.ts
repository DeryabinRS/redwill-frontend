const AUTH_TOKEN_STORAGE_KEY = 'auth_token'

/**
 * Токен хранится в localStorage (не в cookie), чтобы не конфликтовать с HttpOnly-кукой
 * auth_token, которую ставит бэкенд. Сам по себе токен не уходит с запросами — он
 * подставляется в заголовок Authorization в baseQuery.
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } catch {
    // ignore (например, приватный режим)
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function removeAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken())
}

/**
 * Централизованная обработка 401: удаляем токен и перенаправляем на логин.
 */
export function handleAuthError(): void {
  removeAuthToken()
  window.location.href = '/login'
}

