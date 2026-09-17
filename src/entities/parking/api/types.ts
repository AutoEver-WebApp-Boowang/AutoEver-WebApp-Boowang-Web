export type PlaceSummaryResponse = {
    id: number
    name: string
    address: string
    latitude: number
    longitude: number
    isFree: boolean
    hasRoof: boolean
    operatingHours: string
    thumbnailUrl: string
    type: string
    lastConfirmedAt: string
    recommendCount: number
    notRecommendCount: number
}