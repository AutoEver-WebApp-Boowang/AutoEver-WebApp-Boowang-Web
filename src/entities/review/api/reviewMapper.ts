import type {ReviewResponse} from './types'
import type {ParkingReviewData} from '../model/types'

export function toParkingReviewData(review: ReviewResponse, parkingId: number): ParkingReviewData {
    return {
        id: review.id,
        parkingId,
        authorNickname: review.nickname,
        content: review.content,
        likeCount: review.likeCount,
        isLiked: review.like,
        createdAt: review.createdAt,
    }
}
