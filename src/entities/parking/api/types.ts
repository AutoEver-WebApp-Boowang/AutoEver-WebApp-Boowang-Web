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

export type PlaceDetailResponse = {
    id: number
    name: string
    address: string
    latitude: number
    longitude: number
    isFree: boolean
    hasRoof: boolean
    operatingHours: string
    capacity: number
    feeDescription: string
    description: string
    type: string
    lastConfirmedAt: string
    recommendCount: number
    notRecommendCount: number
    reviewCount: number
    updatedAt: string
    photos: string[]
}

export type PlaceUpdateRequest = {
    feeDescription: string
    capacity: number
    hasRoof: boolean
}
