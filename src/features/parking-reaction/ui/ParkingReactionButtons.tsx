import {useState} from 'react'
import styles from './ParkingReactionButtons.module.css'

type Reaction = 'recommend' | 'notRecommend' | null

type ParkingReactionButtonsProps = {
    initialRecommendCount: number
    initialNotRecommendCount?: number
}

export function ParkingReactionButtons({
    initialRecommendCount,
    initialNotRecommendCount = 0,
}: ParkingReactionButtonsProps) {
    const [reaction, setReaction] = useState<Reaction>(null)
    const [recommendCount, setRecommendCount] = useState(initialRecommendCount)
    const [notRecommendCount, setNotRecommendCount] = useState(initialNotRecommendCount)

    const handleRecommend = () => {
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
                <span aria-hidden="true">👍</span>
                추천 {recommendCount}
            </button>

            <button
                type="button"
                className={reaction === 'notRecommend' ? styles.selected : undefined}
                aria-pressed={reaction === 'notRecommend'}
                onClick={handleNotRecommend}
            >
                <span aria-hidden="true">👎</span>
                비추천 {notRecommendCount}
            </button>
        </section>
    )
}
