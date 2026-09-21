// 실제 백엔드 API호출
import {env} from '@/shared/config'
import type {ParkingCardData, ParkingDetailData, ParkingFavoriteResult} from '../model/types'
import type {PlaceDetailResponse, PlaceSummaryResponse, PlaceUpdateRequest} from "@/entities/parking/api/types.ts";
import {toParkingCardData, toParkingDetailData} from "@/entities/parking/api/parkingMapper.ts";
import type {ApiResponse} from "@/shared/api";

type ParkingListResponse = {
    places: PlaceSummaryResponse[]
}

type ParkingBoundsParams = {
    southWestLatitude: number
    southWestLongitude: number
    northEastLatitude: number
    northEastLongitude: number
}

export async function getApiParkingList(
    signal?: AbortSignal
): Promise<ParkingCardData[]> {
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

// 즐겨찾기 주차장 조회
export async function getApiFavoriteParkingList(
    accessToken: string,
    tokenType: string,
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/v1/users/me/favorites`,
        {
            signal,
            headers: {
                Authorization: `${tokenType} ${accessToken}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error(`즐겨찾기 목록 조회 실패: ${response.status}`)
    }

    const result: ApiResponse<PlaceSummaryResponse[]> = await response.json()

    return result.data.map(toParkingCardData)
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
        swLat: String(southWestLatitude),
        swLng: String(southWestLongitude),
        neLat: String(northEastLatitude),
        neLng: String(northEastLongitude),
    })

    const response = await fetch(
        `${env.apiBaseUrl}/api/places?${searchParams}`,
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

// 상세 페이지
export async function getApiParkingDetail(
    parkingId: number,
    isFavorite: boolean,
    accessToken: string | null,
    tokenType: string | null,
    signal?: AbortSignal,
): Promise<ParkingDetailData> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}`,
        {
            signal,
            headers: accessToken && tokenType
                ? {Authorization: `${tokenType} ${accessToken}`}
                : undefined,
        },
    )

    if (!response.ok) {
        throw new Error(
            `주차장 상세 정보 조회 실패: ${response.status}`,
        )
    }

    const result: PlaceDetailResponse = await response.json()

    return toParkingDetailData(result, isFavorite)
}


export async function updateApiParkingFavorite(
    parkingId: number,
    isCurrentlyFavorite: boolean,
    userId: number,
    accessToken: string,
    tokenType: string,
): Promise<ParkingFavoriteResult> {
    const searchParams = new URLSearchParams({userId: String(userId)})

    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}/favorites?${searchParams}`,
        {
            method: isCurrentlyFavorite ? 'DELETE' : 'POST',
            headers: {
                Authorization: `${tokenType} ${accessToken}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error(`즐겨찾기 처리 실패: ${response.status}`)
    }

    return {isFavorite: !isCurrentlyFavorite}
}

// 장소 정보 수정 (등록자만 가능 - 등록자 아니면 백엔드가 403 반환)
export async function updateApiParkingInfo(
    parkingId: number,
    payload: PlaceUpdateRequest,
    accessToken: string,
    tokenType: string,
): Promise<void> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${tokenType} ${accessToken}`,
            },
            body: JSON.stringify(payload),
        },
    )

    if (response.status === 403) {
        throw new Error('수정 권한이 없습니다')
    }

    if (!response.ok) {
        throw new Error(`주차장 정보 수정 실패: ${response.status}`)
    }
}

// 장소 삭제 (등록자만 가능 - 등록자 아니면 백엔드가 403 반환)
export async function deleteApiParking(
    parkingId: number,
    accessToken: string,
    tokenType: string,
): Promise<void> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `${tokenType} ${accessToken}`,
            },
        },
    )

    if (response.status === 403) {
        throw new Error('삭제 권한이 없습니다')
    }

    if (!response.ok) {
        throw new Error(`주차장 삭제 실패: ${response.status}`)
    }
}

// 주차장 추천/비추천 등록 (같은 유저가 이미 다른 반응을 남겼어도 그대로 덮어씀)
export async function postApiParkingReaction(
    parkingId: number,
    reactionType: '추천' | '비추천',
    accessToken: string,
    tokenType: string,
): Promise<void> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}/reactions`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${tokenType} ${accessToken}`,
            },
            body: JSON.stringify({reactionType}),
        },
    )

    if (!response.ok) {
        throw new Error(`추천/비추천 처리 실패: ${response.status}`)
    }
}

// 주차장 추천/비추천 취소
export async function deleteApiParkingReaction(
    parkingId: number,
    accessToken: string,
    tokenType: string,
): Promise<void> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/places/${parkingId}/reactions`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `${tokenType} ${accessToken}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error(`추천/비추천 취소 실패: ${response.status}`)
    }
}
