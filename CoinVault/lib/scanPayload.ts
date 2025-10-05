export type ScanPayload = {
  front: string
  back: string
}

const cache = new Map<string, ScanPayload>()

export function putScanPayload(payload: ScanPayload): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  cache.set(id, payload)
  return id
}

export function getScanPayload(id: string): ScanPayload | undefined {
  return cache.get(id)
}


