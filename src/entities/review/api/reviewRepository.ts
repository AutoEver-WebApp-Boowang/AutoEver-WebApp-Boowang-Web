import {env} from '@/shared/config'
import {createApiReview, getApiParkingReviews, updateApiReviewLike} from './reviewApi'
import {createMockReview, getMockParkingReviews, updateMockReviewLike} from './reviewMockApi'
import type {CreateReviewInput, ParkingReviewData, ReviewLikeResult} from '../model/types'

export function createReview(
    input: CreateReviewInput,
): Promise<ParkingReviewData> {
    if (env.apiMode === 'mock') {
        return createMockReview(input)
    }

    return createApiReview(input)
}

export function getParkingReviews(
    parkingId: number,
    signal?: AbortSignal,
): Promise<ParkingReviewData[]> {
    if (env.apiMode === 'mock') {
        return getMockParkingReviews(parkingId, signal)
    }

    return getApiParkingReviews(parkingId, signal)
}

export function updateReviewLike(
    reviewId: number,
    isCurrentlyLiked: boolean,
): Promise<ReviewLikeResult> {
    if (env.apiMode === 'mock') {
        return updateMockReviewLike(reviewId)
    }

    return updateApiReviewLike(reviewId, isCurrentlyLiked)
}
