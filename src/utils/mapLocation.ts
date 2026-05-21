export type MapCoordinates = { lat: number; lng: number }

function isValidCoordinatePair(lat: number, lng: number): boolean {
  return (
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

function resolveLatLngPair(first: number, second: number): MapCoordinates | null {
  const asLatLng = { lat: first, lng: second }
  const asLngLat = { lat: second, lng: first }
  const latLngValid = isValidCoordinatePair(asLatLng.lat, asLatLng.lng)
  const lngLatValid = isValidCoordinatePair(asLngLat.lat, asLngLat.lng)

  if (latLngValid && !lngLatValid) return asLatLng
  if (lngLatValid && !latLngValid) return asLngLat
  if (latLngValid && lngLatValid) return asLatLng

  return null
}

export function parseLocationCoordinates(location?: string | null): MapCoordinates | null {
  if (!location) return null

  const [latValue, lngValue] = location.split(',').map((part) => Number(part.trim()))
  return resolveLatLngPair(latValue, lngValue)
}

/** Парсит координаты из строки поиска: "55.75, 37.62" или "55.75 37.62" */
export function parseSearchCoordinates(query: string): MapCoordinates | null {
  const trimmed = query.trim()
  if (!trimmed) return null

  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((part) => part.trim())
    if (parts.length !== 2) return null
    return resolveLatLngPair(Number(parts[0]), Number(parts[1]))
  }

  const parts = trimmed.split(/[\s;]+/).filter(Boolean)
  if (parts.length !== 2) return null

  return resolveLatLngPair(Number(parts[0]), Number(parts[1]))
}
