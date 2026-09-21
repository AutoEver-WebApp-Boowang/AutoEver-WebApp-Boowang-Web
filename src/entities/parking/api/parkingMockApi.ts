// 기존 목데이터를 비동기 함수 형태로 반환한다
import {mockParkingCards} from '../model/mock'
import {mockParkingDetails} from '../model/mockDetail'
import type {ParkingCardData, ParkingDetailData, ParkingFavoriteResult} from '../model/types'
import type {PlaceUpdateRequest} from './types'

const mockFavoriteParkingIds = new Set<number>()

type ParkingBoundsParams = {
    southWestLatitude: number
    southWestLongitude: number
    northEastLatitude: number
    northEastLongitude: number
}

export async function getMockParkingList(signal?: AbortSignal): Promise<ParkingCardData[]> {
    await new Promise((resolve) => {
        window.setTimeout(resolve, 300)
    })

    if (signal?.aborted) {
        throw new DOMException('요청이 취소되었습니다.', 'AbortError')
    }

    return mockParkingCards
}

export async function getMockFavoriteParkingList(
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    if (signal?.aborted) {
        throw new DOMException('요청이 취소되었습니다.', 'AbortError')
    }

    return mockParkingCards.filter((parking) => (
        mockFavoriteParkingIds.has(parking.id)
    ))
}

export async function searchMockParkingList(
    keyword: string,
    signal?: AbortSignal,
): Promise<ParkingCardData[]> {
    if (signal?.aborted) {
        throw new DOMException('요청이 취소되었습니다.', 'AbortError')
    }

    const normalizedKeyword = keyword.trim().toLowerCase()

    if (!normalizedKeyword) return []

    return mockParkingCards
        .filter((parking) => {
            const name = parking.name.toLowerCase()
            const address = parking.address.toLowerCase()

            return name.includes(normalizedKeyword) || address.includes(normalizedKeyword)
        })
        .slice(0, 5)
}

export async function getMockParkingListByBounds({
    southWestLatitude,
    southWestLongitude,
    northEastLatitude,
    northEastLongitude,
}: ParkingBoundsParams, signal?: AbortSignal): Promise<ParkingCardData[]> {
    if (signal?.aborted) {
        throw new DOMException('요청이 취소되었습니다.', 'AbortError')
    }

    return mockParkingCards
        .filter((parking) => {
            const isInsideLatitude =
                parking.latitude >= southWestLatitude &&
                parking.latitude <= northEastLatitude

            const isInsideLongitude =
                parking.longitude >= southWestLongitude &&
                parking.longitude <= northEastLongitude

            return isInsideLatitude && isInsideLongitude
        })
}

export async function getMockParkingDetail(
    parkingId: number,
    signal?: AbortSignal,
): Promise<ParkingDetailData> {
    await new Promise((resolve) => {
        window.setTimeout(resolve, 300)
    })

    if (signal?.aborted) {
        throw new DOMException('요청이 취소되었습니다.', 'AbortError')
    }

    const parkingDetail = mockParkingDetails.find(
        (detail) => detail.id === parkingId,
    )

    if (!parkingDetail) {
        throw new Error('주차장 상세 정보를 찾을 수 없습니다.')
    }

    return {
        ...parkingDetail,
        isFavorite: mockFavoriteParkingIds.has(parkingId),
    }
}

export async function updateMockParkingFavorite(
    parkingId: number,
    isCurrentlyFavorite: boolean,
): Promise<ParkingFavoriteResult> {
    if (isCurrentlyFavorite) {
        mockFavoriteParkingIds.delete(parkingId)
    } else {
        mockFavoriteParkingIds.add(parkingId)
    }

    return {
        isFavorite: !isCurrentlyFavorite,
    }
}

export async function updateMockParkingInfo(
    parkingId: number,
    payload: PlaceUpdateRequest,
): Promise<void> {
    const parkingDetail = mockParkingDetails.find((detail) => detail.id === parkingId)

    if (!parkingDetail) {
        throw new Error('주차장 상세 정보를 찾을 수 없습니다.')
    }

    parkingDetail.feeDescription = payload.feeDescription
    parkingDetail.capacity = payload.capacity
    parkingDetail.hasRoof = payload.hasRoof
}

export async function deleteMockParkingInfo(parkingId: number): Promise<void> {
    const detailIndex = mockParkingDetails.findIndex((detail) => detail.id === parkingId)

    if (detailIndex !== -1) {
        mockParkingDetails.splice(detailIndex, 1)
    }
}

export async function postMockParkingReaction(): Promise<void> {
    return
}

export async function deleteMockParkingReaction(): Promise<void> {
    return
}
