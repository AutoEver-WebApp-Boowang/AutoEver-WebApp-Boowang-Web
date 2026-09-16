export type ParkingReviewData = {
    id: number
    parkingId: number
    authorNickname: string
    content: string
    likeCount: number
    isLiked: boolean
    createdAt: string
}

export type ReviewLikeResult = {
    isLiked: boolean
    likeCount: number
}

export type CreateReviewInput = {
    parkingId: number
    content: string
}
