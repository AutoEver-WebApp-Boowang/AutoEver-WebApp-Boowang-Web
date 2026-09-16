import type {ParkingReviewData} from './types'

export const mockParkingReviews: ParkingReviewData[] = [
    {
        id: 1,
        parkingId: 1,
        authorNickname: '서울라이더',
        content: '입구가 넓고 주차 구역 표시가 잘 되어 있어요.',
        likeCount: 5,
        isLiked: false,
        createdAt: '2026-09-14T12:30:00',
    },
    {
        id: 2,
        parkingId: 1,
        authorNickname: '바이크여행자',
        content: '저녁에도 이용하기 편했고 주변이 밝았습니다.',
        likeCount: 3,
        isLiked: false,
        createdAt: '2026-09-13T18:20:00',
    },
    {
        id: 3,
        parkingId: 2,
        authorNickname: '퇴근라이더',
        content: '공간은 넉넉하지만 비가 오면 이용하기 불편해요.',
        likeCount: 2,
        isLiked: false,
        createdAt: '2026-09-12T09:10:00',
    },
]
