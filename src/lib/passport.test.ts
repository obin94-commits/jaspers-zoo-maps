import { describe, expect, it } from 'vitest'
import { computePassportStats, toggleZooStatus } from './passport'

const zooIds = ['national-zoo', 'maryland-zoo', 'philadelphia-zoo', 'pittsburgh-zoo']

describe('passport helpers', () => {
  it('computes visited and wishlist progress across the atlas', () => {
    const stats = computePassportStats(zooIds, {
      'national-zoo': 'visited',
      'maryland-zoo': 'wishlist',
    })

    expect(stats).toEqual({ total: 4, visited: 1, wishlist: 1, remaining: 2, percent: 25 })
  })

  it('cycles a zoo from untracked to wishlist to visited to untracked', () => {
    expect(toggleZooStatus(undefined)).toBe('wishlist')
    expect(toggleZooStatus('wishlist')).toBe('visited')
    expect(toggleZooStatus('visited')).toBeUndefined()
  })
})
