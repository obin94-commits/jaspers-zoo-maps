import { useEffect, useMemo, useState } from 'react'
import type { PassportRecord, ZooStatus } from '../lib/passport'
import { computePassportStats } from '../lib/passport'

const STORAGE_KEY = 'jaspers-zoo-maps-passport-v1'

function readPassport(): PassportRecord {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as PassportRecord) : {}
  } catch {
    return {}
  }
}

export function usePassport(zooIds: string[]) {
  const [passport, setPassport] = useState<PassportRecord>(() => readPassport())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passport))
  }, [passport])

  const stats = useMemo(() => computePassportStats(zooIds, passport), [zooIds, passport])

  function setStatus(zooId: string, status: ZooStatus | undefined) {
    setPassport((current) => {
      const next = { ...current }
      if (status) next[zooId] = status
      else delete next[zooId]
      return next
    })
  }

  return { passport, stats, setStatus }
}
