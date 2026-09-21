import {mockParkingReviews} from '../model/mock'
import type {CreateReviewInput, ParkingReviewData, ParkingReviewPage, ReviewLikeResult} from '../model/types'

export async function createMockReview(
    {parkingId, content}: CreateReviewInput,
    authorNickname: string,
): Promise<void> {
    const newReview: ParkingReviewData = {
        id: Date.now(),
        parkingId,
        authorNickname,
        content,
        likeCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
    }

    mockParkingReviews.unshift(newReview)
}

export async function getMockParkingReviews(
    parkingId: number,
    page: number,
    size: number,
    signal?: AbortSignal,
): Promise<ParkingReviewPage> {
    if (signal?.aborted) {
        throw new DOMException('요청이 취소되었습니다.', 'AbortError')
    }

    const allReviews = mockParkingReviews.filter(
        (review) => review.parkingId === parkingId,
    )

    return {
        reviews: allReviews.slice(page * size, page * size + size),
        totalCount: allReviews.length,
    }
}

export async function updateMockReviewLike(
    reviewId: number,
    isCurrentlyLiked: boolean,
    currentLikeCount: number,
): Promise<ReviewLikeResult> {
    const review = mockParkingReviews.find(
        (item) => item.id === reviewId,
    )

    if (!review) {
        throw new Error('리뷰를 찾을 수 없습니다.')
    }

    review.isLiked = !isCurrentlyLiked
    review.likeCount = review.isLiked
        ? currentLikeCount + 1
        : Math.max(currentLikeCount - 1, 0)

    return {
        isLiked: review.isLiked,
        likeCount: review.likeCount,
    }
}
