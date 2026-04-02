export const AUTH_TOKEN_COOKIE_NAME = 'auth_token'

export function setAuthToken(token: string, maxAgeSeconds = 60 * 60 * 24 * 7): void {
  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}

export function getAuthToken(): string | null {
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const tokenCookie = cookies.find((cookie) => cookie.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`))

  if (!tokenCookie) {
    return null
  }

  return decodeURIComponent(tokenCookie.split('=').slice(1).join('='))
}

export function removeAuthToken(): void {
  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken())
}
