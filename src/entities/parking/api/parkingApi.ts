// 실제 백엔드 API호출
import {env} from '@/shared/config'
import type {ParkingCardData, ParkingDetailData, ParkingFavoriteResult} from '../model/types'
import type {PlaceSummaryResponse} from "@/entities/parking/api/types.ts";
import {toParkingCardData} from "@/entities/parking/api/parkingMapper.ts";

type ParkingListResponse = {
    places: PlaceSummaryResponse[]
}

type ParkingDetailResponse =
    | ParkingDetailData
    | {
    data: ParkingDetailData
}

type ParkingBoundsParams = {
    southWestLatitude: number
    southWestLongitude: number
    northEastLatitude: number
    northEastLongitude: number
}

export async function getApiParkingList(signal?: AbortSignal): Promise<ParkingCardData[]> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places`,
        {signal},
    )

    if (!response.ok) {
        throw new Error(
            `주차장 목록 조회 실패: ${response.status}`,
        )
    }

    const result: ParkingListResponse = await response.json()

    return result.places.map(toParkingCardData)
}

export async function getApiFavoriteParkingList(
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/favorites`,
        {
            signal,
            credentials: 'include',
        },
    )

    if (!response.ok) {
        throw new Error(`즐겨찾기 목록 조회 실패: ${response.status}`)
    }

    const result: ParkingListResponse = await response.json()

    return result.places.map(toParkingCardData)
}

export async function searchApiParkingList(
    keyword: string,
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/search?keyword=${encodeURIComponent(keyword)}`,
        {signal},
    )

    if (!response.ok) {
        throw new Error(
            `등록된 주차장 검색 실패: ${response.status}`,
        )
    }

    const result: ParkingListResponse = await response.json()

    return result.places.map(toParkingCardData).slice(0, 5)
}

export async function getApiParkingListByBounds(
    {
        southWestLatitude,
        southWestLongitude,
        northEastLatitude,
        northEastLongitude,
    }: ParkingBoundsParams,
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    const searchParams = new URLSearchParams({
        southWestLatitude: String(southWestLatitude),
        southWestLongitude: String(southWestLongitude),
        northEastLatitude: String(northEastLatitude),
        northEastLongitude: String(northEastLongitude),
    })

    const response = await fetch(
        `${env.apiBaseUrl}/api/places/bounds?${searchParams}`,
        {signal},
    )

    if (!response.ok) {
        throw new Error(
            `주변 주차장 조회 실패: ${response.status}`,
        )
    }

    const result: ParkingListResponse = await response.json()

    return result.places.map(toParkingCardData)
}

export async function getApiParkingDetail(
    parkingId: number,
    signal?: AbortSignal,
): Promise<ParkingDetailData> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}`,
        {signal},
    )

    if (!response.ok) {
        throw new Error(
            `주차장 상세 정보 조회 실패: ${response.status}`,
        )
    }

    const result: ParkingDetailResponse = await response.json()

    return 'data' in result ? result.data : result
}

export async function updateApiParkingFavorite(
    parkingId: number,
    isCurrentlyFavorite: boolean,
): Promise<ParkingFavoriteResult> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/favorites/${parkingId}`,
        {
            method: isCurrentlyFavorite ? 'DELETE' : 'POST',
            credentials: 'include',
        },
    )

    if (!response.ok) {
        throw new Error(`즐겨찾기 처리 실패: ${response.status}`)
    }

    return response.json()
}
