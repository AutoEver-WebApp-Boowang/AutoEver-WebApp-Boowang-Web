export type ParkingSource = 'public' | 'user'

export type ParkingCardData = {
    id: number
    name: string
    address: string

    latitude: number
    longitude: number
    distanceMeters: number | null

    thumbnailUrl: string | null
    source: ParkingSource

    isFree: boolean
    operatingHours: string | null

    hasRoof: boolean

    likeCount: number
    dislikeCount: number
    lastVerifiedAt: string | null
}

export type ParkingReactionType = 'recommend' | 'notRecommend' | null

export type ParkingDetailData = {
    id: number
    name: string
    address: string
    type: '공영' | '제보'

    isFree: boolean
    hasRoof: boolean

    operatingHours: string | null
    capacity: number | null
    feeDescription: string | null
    description: string | null
    imageUrls: string[]

    lastConfirmedAt: string | null
    recommendCount: number
    notRecommendCount: number
    reviewCount: number
    updatedAt: string
    isFavorite: boolean
    myReaction: ParkingReactionType
}

export type ParkingFavoriteResult = {
    isFavorite: boolean
}

export type ParkingRegisterInput = {
    name: string
    address: string
    latitude: number
    longitude: number
    type: '공영' | '제보'
    isFree: boolean
    hasRoof: boolean
    operatingHours: string
    capacity: number | null
    description: string | null
}
