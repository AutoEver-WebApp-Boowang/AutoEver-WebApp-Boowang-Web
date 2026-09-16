import {env} from '@/shared/config'
import type {CreateReviewInput, ParkingReviewData, ReviewLikeResult} from '../model/types'

type ReviewListResponse =
    | ParkingReviewData[]
    | {
    data: ParkingReviewData[]
}

type CreateReviewResponse =
    | ParkingReviewData
    | {
    data: ParkingReviewData
}

export async function createApiReview({
    parkingId,
    content,
}: CreateReviewInput): Promise<ParkingReviewData> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}/reviews`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({content}),
        },
    )

    if (!response.ok) {
        throw new Error(`리뷰 등록 실패: ${response.status}`)
    }

    const result: CreateReviewResponse = await response.json()

    return 'data' in result ? result.data : result
}

export async function getApiParkingReviews(
    parkingId: number,
    signal?: AbortSignal,
): Promise<ParkingReviewData[]> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}/reviews`,
        {signal},
    )

    if (!response.ok) {
        throw new Error(
            `리뷰 목록 조회 실패: ${response.status}`,
        )
    }

    const result: ReviewListResponse = await response.json()

    return Array.isArray(result) ? result : result.data
}

export async function updateApiReviewLike(
    reviewId: number,
    isCurrentlyLiked: boolean,
): Promise<ReviewLikeResult> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/reviews/${reviewId}/likes`,
        {
            method: isCurrentlyLiked ? 'DELETE' : 'POST',
        },
    )

    if (!response.ok) {
        throw new Error(
            `리뷰 좋아요 처리 실패: ${response.status}`,
        )
    }

    return response.json()
}
