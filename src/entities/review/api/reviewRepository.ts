import {env} from '@/shared/config'
import {createApiReview, getApiParkingReviews, updateApiReviewLike} from './reviewApi'
import {createMockReview, getMockParkingReviews, updateMockReviewLike} from './reviewMockApi'
import type {CreateReviewInput, ParkingReviewData, ReviewLikeResult} from '../model/types'

export function createReview(
    input: CreateReviewInput,
    authorNickname: string,
    accessToken: string,
    tokenType: string,
): Promise<void> {
    if (env.apiMode === 'mock') {
        return createMockReview(input, authorNickname)
    }

    return createApiReview(input, accessToken, tokenType)
}

export function getParkingReviews(
    parkingId: number,
    accessToken: string,
    tokenType: string,
    signal?: AbortSignal,
): Promise<ParkingReviewData[]> {
    if (env.apiMode === 'mock') {
        return getMockParkingReviews(parkingId, signal)
    }

    return getApiParkingReviews(parkingId, accessToken, tokenType, signal)
}

export function updateReviewLike(
    reviewId: number,
    isCurrentlyLiked: boolean,
    currentLikeCount: number,
    accessToken: string,
    tokenType: string,
): Promise<ReviewLikeResult> {
    if (env.apiMode === 'mock') {
        return updateMockReviewLike(reviewId, isCurrentlyLiked, currentLikeCount)
    }

    return updateApiReviewLike(reviewId, isCurrentlyLiked, currentLikeCount, accessToken, tokenType)
}
