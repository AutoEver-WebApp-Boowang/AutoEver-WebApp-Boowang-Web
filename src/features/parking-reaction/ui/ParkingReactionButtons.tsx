import {useState} from 'react'
import {useMutation} from '@tanstack/react-query'
import {updateParkingReaction, type ParkingReactionType} from '@/entities/parking'
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

    const handleRecommend = async () => {
        if (!isAuthenticated) {
            onRequireLogin()
            return
        }

        const nextReaction = reaction === 'recommend' ? null : 'recommend'

        try {
            await reactionMutation.mutateAsync(nextReaction)

            if (nextReaction === null) {
                setReaction(null)
                setRecommendCount((count) => Math.max(count - 1, 0))
                return
            }

            if (reaction === 'notRecommend') {
                setNotRecommendCount((count) => Math.max(count - 1, 0))
            }

            setReaction('recommend')
            setRecommendCount((count) => count + 1)
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
                setReaction(null)
                setNotRecommendCount((count) => Math.max(count - 1, 0))
                return
            }

            if (reaction === 'recommend') {
                setRecommendCount((count) => Math.max(count - 1, 0))
            }

            setReaction('notRecommend')
            setNotRecommendCount((count) => count + 1)
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
