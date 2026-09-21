import {useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {updateParkingReaction, type ParkingCardData, type ParkingDetailData, type ParkingReactionType} from '@/entities/parking'
import styles from './ParkingReactionButtons.module.css'

type ParkingReactionButtonsProps = {
    parkingId: number
    initialReaction: ParkingReactionType
    initialRecommendCount: number
    initialNotRecommendCount?: number
    isAuthenticated: boolean
    accessToken: string | null
    tokenType: string | null
    onRequireLogin: () => void
}

// 지도/목록에 쓰이는 ParkingCardData 배열 캐시(주변 목록, 즐겨찾기, 등록된 장소 검색)인지 확인
function isParkingListQueryKey(queryKey: readonly unknown[]) {
    return queryKey[0] === 'parking' && (
        queryKey[1] === 'list' ||
        queryKey[1] === 'favorites' ||
        (queryKey[1] === 'search' && queryKey[2] === 'registered')
    )
}

export function ParkingReactionButtons({
    parkingId,
    initialReaction,
    initialRecommendCount,
    initialNotRecommendCount = 0,
    isAuthenticated,
    accessToken,
    tokenType,
    onRequireLogin,
}: ParkingReactionButtonsProps) {
    const queryClient = useQueryClient()

    const [reaction, setReaction] = useState<ParkingReactionType>(initialReaction)
    const [recommendCount, setRecommendCount] = useState(initialRecommendCount)
    const [notRecommendCount, setNotRecommendCount] = useState(initialNotRecommendCount)

    const reactionMutation = useMutation({
        mutationFn: (nextReaction: ParkingReactionType) => updateParkingReaction(
            parkingId,
            nextReaction,
            accessToken!,
            tokenType!,
        ),
    })

    // 상세 패널 로컬 상태만 바꾸면 지도 마커/목록 카드의 추천·비추천 수가 갱신되지 않아서
    // 관련 쿼리 캐시도 같이 갱신해준다
    const syncCaches = (
        nextReaction: ParkingReactionType,
        nextRecommendCount: number,
        nextNotRecommendCount: number,
    ) => {
        queryClient.setQueriesData<ParkingDetailData>(
            {queryKey: ['parking', 'detail', parkingId]},
            (currentDetail) => currentDetail
                ? {
                    ...currentDetail,
                    myReaction: nextReaction,
                    recommendCount: nextRecommendCount,
                    notRecommendCount: nextNotRecommendCount,
                }
                : currentDetail,
        )

        queryClient.setQueriesData<ParkingCardData[]>(
            {predicate: (query) => isParkingListQueryKey(query.queryKey)},
            (currentList) => currentList?.map((parking) => (
                parking.id === parkingId
                    ? {...parking, likeCount: nextRecommendCount, dislikeCount: nextNotRecommendCount}
                    : parking
            )),
        )
    }

    const handleRecommend = async () => {
        if (!isAuthenticated) {
            onRequireLogin()
            return
        }

        const nextReaction = reaction === 'recommend' ? null : 'recommend'

        try {
            await reactionMutation.mutateAsync(nextReaction)

            if (nextReaction === null) {
                const nextRecommendCount = Math.max(recommendCount - 1, 0)
                setReaction(null)
                setRecommendCount(nextRecommendCount)
                syncCaches(null, nextRecommendCount, notRecommendCount)
                return
            }

            const nextNotRecommendCount = reaction === 'notRecommend'
                ? Math.max(notRecommendCount - 1, 0)
                : notRecommendCount
            const nextRecommendCount = recommendCount + 1

            if (reaction === 'notRecommend') {
                setNotRecommendCount(nextNotRecommendCount)
            }

            setReaction('recommend')
            setRecommendCount(nextRecommendCount)
            syncCaches('recommend', nextRecommendCount, nextNotRecommendCount)
        } catch {
            window.alert('처리 중 문제가 발생했어요. 다시 시도해주세요.')
        }
    }

    const handleNotRecommend = async () => {
        if (!isAuthenticated) {
            onRequireLogin()
            return
        }

        const nextReaction = reaction === 'notRecommend' ? null : 'notRecommend'

        try {
            await reactionMutation.mutateAsync(nextReaction)

            if (nextReaction === null) {
                const nextNotRecommendCount = Math.max(notRecommendCount - 1, 0)
                setReaction(null)
                setNotRecommendCount(nextNotRecommendCount)
                syncCaches(null, recommendCount, nextNotRecommendCount)
                return
            }

            const nextRecommendCount = reaction === 'recommend'
                ? Math.max(recommendCount - 1, 0)
                : recommendCount
            const nextNotRecommendCount = notRecommendCount + 1

            if (reaction === 'recommend') {
                setRecommendCount(nextRecommendCount)
            }

            setReaction('notRecommend')
            setNotRecommendCount(nextNotRecommendCount)
            syncCaches('notRecommend', nextRecommendCount, nextNotRecommendCount)
        } catch {
            window.alert('처리 중 문제가 발생했어요. 다시 시도해주세요.')
        }
    }

    return (
        <section className={styles.reactions} aria-label="주차장 추천 평가">
            <button
                type="button"
                className={reaction === 'recommend' ? styles.selected : undefined}
                aria-pressed={reaction === 'recommend'}
                disabled={reactionMutation.isPending}
                onClick={handleRecommend}
            >
                <img
                    className={styles.reactionIcon}
                    src="/icons/thumb-up.svg"
                    alt=""
                    aria-hidden="true"
                />
                추천 {recommendCount}
            </button>

            <button
                type="button"
                className={reaction === 'notRecommend' ? styles.selected : undefined}
                aria-pressed={reaction === 'notRecommend'}
                disabled={reactionMutation.isPending}
                onClick={handleNotRecommend}
            >
                <img
                    className={styles.reactionIcon}
                    src="/icons/thumb-down.svg"
                    alt=""
                    aria-hidden="true"
                />
                비추천 {notRecommendCount}
            </button>
        </section>
    )
}
