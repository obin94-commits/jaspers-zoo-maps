export type ZooStatus = 'wishlist' | 'visited'

export type PassportRecord = Record<string, ZooStatus | undefined>

export interface PassportStats {
  total: number
  visited: number
  wishlist: number
  remaining: number
  percent: number
}

export function computePassportStats(zooIds: string[], passport: PassportRecord): PassportStats {
  const visited = zooIds.filter((id) => passport[id] === 'visited').length
  const wishlist = zooIds.filter((id) => passport[id] === 'wishlist').length

  return {
    total: zooIds.length,
    visited,
    wishlist,
    remaining: Math.max(0, zooIds.length - visited - wishlist),
    percent: zooIds.length === 0 ? 0 : Math.round((visited / zooIds.length) * 100),
  }
}

export function toggleZooStatus(status: ZooStatus | undefined): ZooStatus | undefined {
  if (!status) return 'wishlist'
  if (status === 'wishlist') return 'visited'
  return undefined
}
