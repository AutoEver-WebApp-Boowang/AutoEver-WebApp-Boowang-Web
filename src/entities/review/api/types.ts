export type ReviewResponse = {
    id: number
    content: string
    likeCount: number
    createdAt: string
    nickname: string
    like: boolean
}

export type ReviewListResponse = {
    reviews: ReviewResponse[]
    totalCount: number
}

export type ReviewCreateResponse = {
    id: number
    createdAt: string
}

export type ReviewLikeResponse = {
    reviewId: number
    likeCount: number
}
