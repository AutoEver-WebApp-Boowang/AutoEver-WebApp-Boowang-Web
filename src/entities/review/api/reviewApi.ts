import {env} from '@/shared/config'
import type {ApiResponse} from '@/shared/api'
import type {CreateReviewInput, ParkingReviewPage, ReviewLikeResult} from '../model/types'
import type {ReviewListResponse, ReviewLikeResponse} from './types'
import {toParkingReviewData} from './reviewMapper'

// 서버가 {id, createdAt}만 내려주고 작성된 리뷰 전체를 안 돌려줘서,
// 등록 성공 후 화면 갱신은 이 값을 쓰는 대신 목록을 다시 조회하는 방식으로 처리한다.
export async function createApiReview(
    {parkingId, content}: CreateReviewInput,
    accessToken: string,
    tokenType: string,
): Promise<void> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}/reviews`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${tokenType} ${accessToken}`,
            },
            body: JSON.stringify({content}),
        },
    )

    if (!response.ok) {
        throw new Error(`리뷰 등록 실패: ${response.status}`)
    }
}

export async function getApiParkingReviews(
    parkingId: number,
    page: number,
    size: number,
    accessToken: string | null,
    tokenType: string | null,
    signal?: AbortSignal,
): Promise<ParkingReviewPage> {
    // 리뷰 목록 조회는 비로그인 사용자도 볼 수 있어서 토큰이 없을 수 있다.
    // 이 경우 Authorization 헤더 자체를 생략한다.
    const headers: HeadersInit = accessToken && tokenType
        ? {Authorization: `${tokenType} ${accessToken}`}
        : {}

    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}/reviews?page=${page}&size=${size}`,
        {
            signal,
            headers,
        },
    )

    if (!response.ok) {
        throw new Error(`리뷰 목록 조회 실패: ${response.status}`)
    }

    const result: ApiResponse<ReviewListResponse> = await response.json()

    return {
        reviews: result.data.reviews.map((review) => toParkingReviewData(review, parkingId)),
        totalCount: result.data.totalCount,
    }
}

export async function updateApiReviewLike(
    reviewId: number,
    isCurrentlyLiked: boolean,
    currentLikeCount: number,
    accessToken: string,
    tokenType: string,
): Promise<ReviewLikeResult> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/reviews/${reviewId}/likes`,
        {
            method: isCurrentlyLiked ? 'DELETE' : 'POST',
            headers: {
                Authorization: `${tokenType} ${accessToken}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error(`리뷰 좋아요 처리 실패: ${response.status}`)
    }

    if (isCurrentlyLiked) {
        // DELETE 응답엔 likeCount가 안 내려와서 직접 계산
        return {
            isLiked: false,
            likeCount: Math.max(currentLikeCount - 1, 0),
        }
    }

    const result: ApiResponse<ReviewLikeResponse> = await response.json()

    return {
        isLiked: true,
        likeCount: result.data.likeCount,
    }
}
