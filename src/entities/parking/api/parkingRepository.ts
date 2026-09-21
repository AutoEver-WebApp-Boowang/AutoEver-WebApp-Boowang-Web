// 실행 모드를 확인하고 Mock 또는 실제 APi 선택
import {env} from '@/shared/config'
import {
    getApiFavoriteParkingList,
    getApiParkingListByBounds,
    getApiParkingDetail,
    getApiParkingList,
    searchApiParkingList,
    updateApiParkingFavorite,
    updateApiParkingInfo,
    deleteApiParking,
    postApiParkingReaction,
    deleteApiParkingReaction,
} from './parkingApi'
import {
    getMockFavoriteParkingList,
    getMockParkingListByBounds,
    getMockParkingDetail,
    getMockParkingList,
    searchMockParkingList,
    updateMockParkingFavorite,
    updateMockParkingInfo,
    deleteMockParkingInfo,
    postMockParkingReaction,
    deleteMockParkingReaction,
} from './parkingMockApi'
import type {ParkingCardData, ParkingDetailData, ParkingFavoriteResult} from '../model/types'
import type {PlaceUpdateRequest} from './types'

type ParkingBoundsParams = {
    southWestLatitude: number
    southWestLongitude: number
    northEastLatitude: number
    northEastLongitude: number
}

export function getParkingList(signal?: AbortSignal): Promise<ParkingCardData[]> {
    if (env.apiMode === 'mock') {
        return getMockParkingList(signal)
    }

    return getApiParkingList(signal)
}

export function getFavoriteParkingList(
    accessToken: string,
    tokenType: string,
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    if (env.apiMode === 'mock') {
        return getMockFavoriteParkingList(signal)
    }

    return getApiFavoriteParkingList(accessToken, tokenType, signal)
}

export function getParkingDetail(
    parkingId: number,
    isFavorite: boolean,
    signal?: AbortSignal,
): Promise<ParkingDetailData> {
    if (env.apiMode === 'mock') {
        return getMockParkingDetail(parkingId, signal)
    }

    return getApiParkingDetail(parkingId, isFavorite, signal)
}

export function updateParkingFavorite(
    parkingId: number,
    isCurrentlyFavorite: boolean,
    userId: number,
    accessToken: string,
    tokenType: string,
): Promise<ParkingFavoriteResult> {
    if (env.apiMode === 'mock') {
        return updateMockParkingFavorite(parkingId, isCurrentlyFavorite)
    }

    return updateApiParkingFavorite(parkingId, isCurrentlyFavorite, userId, accessToken, tokenType)
}

export function searchRegisteredParking(
    keyword: string,
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    if (env.apiMode === 'mock') {
        return searchMockParkingList(keyword, signal)
    }

    return searchApiParkingList(keyword, signal)
}

export function getParkingListByBounds(
    params: ParkingBoundsParams,
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    if (env.apiMode === 'mock') {
        return getMockParkingListByBounds(params, signal)
    }

    return getApiParkingListByBounds(params, signal)
}

export function updateParkingInfo(
    parkingId: number,
    payload: PlaceUpdateRequest,
    accessToken: string,
    tokenType: string,
): Promise<void> {
    if (env.apiMode === 'mock') {
        return updateMockParkingInfo(parkingId, payload)
    }

    return updateApiParkingInfo(parkingId, payload, accessToken, tokenType)
}

export function deleteParking(
    parkingId: number,
    accessToken: string,
    tokenType: string,
): Promise<void> {
    if (env.apiMode === 'mock') {
        return deleteMockParkingInfo(parkingId)
    }

    return deleteApiParking(parkingId, accessToken, tokenType)
}

export type ParkingReactionType = 'recommend' | 'notRecommend' | null

export function updateParkingReaction(
    parkingId: number,
    reaction: ParkingReactionType,
    accessToken: string,
    tokenType: string,
): Promise<void> {
    if (env.apiMode === 'mock') {
        return reaction === null
            ? deleteMockParkingReaction()
            : postMockParkingReaction()
    }

    if (reaction === null) {
        return deleteApiParkingReaction(parkingId, accessToken, tokenType)
    }

    const reactionType = reaction === 'recommend' ? '추천' : '비추천'
    return postApiParkingReaction(parkingId, reactionType, accessToken, tokenType)
}
