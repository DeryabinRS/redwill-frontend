export type ClusterCoordinates = { lat: number; lng: number }

export type ClusterGroup<T> = {
  id: string
  coords: ClusterCoordinates
  markers: T[]
}

export function getClusterStep(zoom: number): number {
  if (zoom >= 12) return 0
  if (zoom >= 10) return 0.02
  if (zoom >= 8) return 0.07
  if (zoom >= 6) return 0.18
  return 0.45
}

/**
 * Кластеризация маркеров: транзитивно объединяет точки, находящиеся в пределах
 * tolerance (зависящей от zoom). Детерминированно и не зависит от порядка элементов.
 */
export function groupMarkers<T extends { coords: ClusterCoordinates }>(
  markers: T[],
  zoom: number,
): ClusterGroup<T>[] {
  const step = getClusterStep(zoom)
  const tolerance = step === 0 ? 1e-6 : step

  const n = markers.length
  if (n === 0) return []

  // Union-Find: транзитивно объединяем маркеры, находящиеся в пределах tolerance.
  // Это детерминированно (не зависит от порядка) и гарантирует, что если A близко к B,
  // а B близко к C — A, B и C попадут в один кластер.
  const parent = Array.from({ length: n }, (_, index) => index)

  const find = (x: number): number => {
    let root = x
    while (parent[root] !== root) root = parent[root]
    // Сжатие пути
    while (parent[x] !== x) {
      const next = parent[x]
      parent[x] = root
      x = next
    }
    return root
  }

  const union = (a: number, b: number) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) parent[rootA] = rootB
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (
        Math.abs(markers[i].coords.lat - markers[j].coords.lat) <= tolerance &&
        Math.abs(markers[i].coords.lng - markers[j].coords.lng) <= tolerance
      ) {
        union(i, j)
      }
    }
  }

  // Группируем маркеры по корню
  const groups = new Map<number, T[]>()
  for (let i = 0; i < n; i++) {
    const root = find(i)
    const group = groups.get(root)
    if (group) group.push(markers[i])
    else groups.set(root, [markers[i]])
  }

  return [...groups.values()].map((clusterMarkers, index) => ({
    id: `cluster-${index}`,
    coords: {
      lat: clusterMarkers.reduce((sum, item) => sum + item.coords.lat, 0) / clusterMarkers.length,
      lng: clusterMarkers.reduce((sum, item) => sum + item.coords.lng, 0) / clusterMarkers.length,
    },
    markers: clusterMarkers,
  }))
}
