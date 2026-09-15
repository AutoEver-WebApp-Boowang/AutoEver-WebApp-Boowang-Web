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
    feeDescription: string | null
    operatingHours: string | null
    capacity: number | null

    hasRoof: boolean

    likeCount: number
    dislikeCount: number
    lastVerifiedAt: string | null
}

export type ParkingDetailData = {
    id: number
    name: string
    address: string
    type: '공영' | '제보'

    isFree: boolean
    hasRoof: boolean
    hasLock: boolean

    operatingHours: string | null
    capacity: number | null
    feeDescription: string | null
    description: string | null
    infoSource: string
    imageUrls: string[]

    lastConfirmedAt: string | null
    recommendCount: number
    reviewCount: number
    updatedAt: string
}
