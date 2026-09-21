import type {ReviewResponse} from './types'
import type {ParkingReviewData} from '../model/types'

// 서버가 "내가 좋아요 눌렀는지" 정보를 안 내려줘서 isLiked는 일단 false로 시작.
export function toParkingReviewData(review: ReviewResponse, parkingId: number): ParkingReviewData {
    return {
        id: review.id,
        parkingId,
        authorNickname: review.nickname,
        content: review.content,
        likeCount: review.likeCount,
        isLiked: false,
        createdAt: review.createdAt,
    }
}
