import type {PlaceSummaryResponse} from "@/entities/parking/api/types.ts";
import type {ParkingCardData, ParkingSource} from "@/entities/parking";

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
    if (type === 'PUBLIC') return 'public'
    if (type === 'USER') return 'user'
    throw new Error(`알 수 없는 주차장 타입: ${type}`)


}