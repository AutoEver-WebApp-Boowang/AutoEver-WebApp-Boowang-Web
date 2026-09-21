import {useState} from 'react'
import styles from './ParkingReactionButtons.module.css'

type Reaction = 'recommend' | 'notRecommend' | null

type ParkingReactionButtonsProps = {
    initialRecommendCount: number
    initialNotRecommendCount?: number
    isAuthenticated: boolean
    onRequireLogin: () => void
}

export function ParkingReactionButtons({
    initialRecommendCount,
    initialNotRecommendCount = 0,
    isAuthenticated,
    onRequireLogin,
}: ParkingReactionButtonsProps) {
    const [reaction, setReaction] = useState<Reaction>(null)
    const [recommendCount, setRecommendCount] = useState(initialRecommendCount)
    const [notRecommendCount, setNotRecommendCount] = useState(initialNotRecommendCount)

    const handleRecommend = () => {
        if (!isAuthenticated) {
            onRequireLogin()
            return
        }

        if (reaction === 'recommend') {
            setReaction(null)
            setRecommendCount((count) => Math.max(count - 1, 0))
            return
        }

        if (reaction === 'notRecommend') {
            setNotRecommendCount((count) => Math.max(count - 1, 0))
        }

        setReaction('recommend')
        setRecommendCount((count) => count + 1)
    }

    const handleNotRecommend = () => {
        if (!isAuthenticated) {
            onRequireLogin()
            return
        }

        if (reaction === 'notRecommend') {
            setReaction(null)
            setNotRecommendCount((count) => Math.max(count - 1, 0))
            return
        }

        if (reaction === 'recommend') {
            setRecommendCount((count) => Math.max(count - 1, 0))
        }

        setReaction('notRecommend')
        setNotRecommendCount((count) => count + 1)
    }

    return (
        <section className={styles.reactions} aria-label="주차장 추천 평가">
            <button
                type="button"
                className={reaction === 'recommend' ? styles.selected : undefined}
                aria-pressed={reaction === 'recommend'}
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
