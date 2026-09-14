import type { Place } from './types'

export async function getPlaces(signal?: AbortSignal): Promise<Place[]> {
  const response = await fetch('/api/places', { signal })

  if (!response.ok) {
    throw new Error(`API 요청 실패 (${response.status} ${response.statusText})`)
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    throw new Error('API 응답이 배열 형식이 아닙니다.')
  }

  return data as Place[]
}
