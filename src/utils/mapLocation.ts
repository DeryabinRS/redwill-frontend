export function parseLocationCoordinates(location?: string | null) {
  if (!location) return null

  const [latValue, lngValue] = location.split(',').map((part) => Number(part.trim()))
  if (Number.isNaN(latValue) || Number.isNaN(lngValue)) {
    return null
  }

  return { lat: latValue, lng: lngValue }
}
