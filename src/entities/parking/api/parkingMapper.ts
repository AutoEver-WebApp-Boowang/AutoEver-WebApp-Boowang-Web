import type {PlaceDetailResponse, PlaceSummaryResponse} from "@/entities/parking/api/types.ts";
import type {ParkingCardData, ParkingDetailData, ParkingReactionType, ParkingSource} from "@/entities/parking";

export function toParkingCardData(place: PlaceSummaryResponse): ParkingCardData {
    return {
        id: place.id,
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        distanceMeters: null,
        thumbnailUrl: place.thumbnailUrl,
        source: toParkingSource(place.type),
        isFree: place.isFree,
        hasRoof: place.hasRoof,
        operatingHours: place.operatingHours,
        likeCount: place.recommendCount,
        dislikeCount: place.notRecommendCount,
        lastVerifiedAt: place.lastConfirmedAt,
    }
}

function toParkingSource(type: string): ParkingSource {
    if (type === '공영') return 'public'
    if (type === '제보') return 'user'
    throw new Error(`알 수 없는 주차장 타입: ${type}`)
}

function toParkingDetailType(type: string): '공영' | '제보' {
    if (type === 'PUBLIC') return '공영'
    if (type === 'USER') return '제보'

    console.warn(`알 수 없는 주차장 타입: ${type}, '제보'로 처리합니다`)
    return '제보'
}

function toParkingReactionType(myReaction: string | null): ParkingReactionType {
    if (myReaction === '추천') return 'recommend'
    if (myReaction === '비추천') return 'notRecommend'
    return null
}

export function toParkingDetailData(
    place: PlaceDetailResponse,
    isFavorite: boolean,
): ParkingDetailData {
    return {
        id: place.id,
        name: place.name,
        address: place.address,
        type: toParkingDetailType(place.type),
        isFree: place.isFree,
        hasRoof: place.hasRoof,
        operatingHours: place.operatingHours,
        capacity: place.capacity,
        feeDescription: place.feeDescription,
        description: place.description,
        imageUrls: place.photos,
        lastConfirmedAt: place.lastConfirmedAt,
        recommendCount: place.recommendCount,
        notRecommendCount: place.notRecommendCount,
        reviewCount: place.reviewCount,
        updatedAt: place.updatedAt,
        isFavorite,
        myReaction: toParkingReactionType(place.myReaction),
    }
}