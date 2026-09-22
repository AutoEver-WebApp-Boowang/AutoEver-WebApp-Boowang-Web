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
    reviewCount: number
}

export type PlaceDetailResponse = {
    id: number
    name: string
    address: string
    detailAddress: string | null
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
    myReaction: string | null
}

export type PlaceUpdateRequest = {
    feeDescription: string
    capacity: number
    hasRoof: boolean
}

export type PlaceReactionRequest = {
    reactionType: '추천' | '비추천'
}

export type PlaceRegisterRequest = {
    name: string
    address: string
    detailAddress?: string
    latitude: number
    longitude: number
    type: string
    isFree: boolean
    feeDescription?: string
    hasRoof: boolean
    operatingHours: string
    capacity?: number
    description?: string
}
