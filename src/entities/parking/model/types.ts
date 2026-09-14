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