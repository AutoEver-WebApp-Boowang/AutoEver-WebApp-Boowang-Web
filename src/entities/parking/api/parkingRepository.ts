// 실행 모드를 확인하고 Mock 또는 실제 APi 선택
import {env} from '@/shared/config'
import {
    getApiFavoriteParkingList,
    getApiParkingListByBounds,
    getApiParkingDetail,
    getApiParkingList,
    searchApiParkingList,
    updateApiParkingFavorite,
} from './parkingApi'
import {
    getMockFavoriteParkingList,
    getMockParkingListByBounds,
    getMockParkingDetail,
    getMockParkingList,
    searchMockParkingList,
    updateMockParkingFavorite,
} from './parkingMockApi'
import type {ParkingCardData, ParkingDetailData, ParkingFavoriteResult} from '../model/types'

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
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    if (env.apiMode === 'mock') {
        return getMockFavoriteParkingList(signal)
    }

    return getApiFavoriteParkingList(signal)
}

export function getParkingDetail(
    parkingId: number,
    signal?: AbortSignal,
): Promise<ParkingDetailData> {
    if (env.apiMode === 'mock') {
        return getMockParkingDetail(parkingId, signal)
    }

    return getApiParkingDetail(parkingId, signal)
}

export function updateParkingFavorite(
    parkingId: number,
    isCurrentlyFavorite: boolean,
): Promise<ParkingFavoriteResult> {
    if (env.apiMode === 'mock') {
        return updateMockParkingFavorite(parkingId, isCurrentlyFavorite)
    }

    return updateApiParkingFavorite(parkingId, isCurrentlyFavorite)
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
