import {useState} from 'react'
import type {ParkingReviewData, ReviewLikeResult} from '../model/types'
import styles from './ReviewCard.module.css'

type ReviewCardProps = {
    review: ParkingReviewData
    onLike: (
        reviewId: number,
        isCurrentlyLiked: boolean,
    ) => Promise<ReviewLikeResult>
}

const formatReviewDate = (createdAt: string) => {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(createdAt))
}

export function ReviewCard({review, onLike}: ReviewCardProps) {
    const [isLiked, setIsLiked] = useState(review.isLiked)
    const [likeCount, setLikeCount] = useState(review.likeCount)
    const [isLikeSubmitting, setIsLikeSubmitting] = useState(false)

    const handleLikeClick = async () => {
        if (isLikeSubmitting) return

        try {
            setIsLikeSubmitting(true)

            const result = await onLike(review.id, isLiked)

            setIsLiked(result.isLiked)
            setLikeCount(result.likeCount)
        } catch {
            // 로그인이 필요해서 취소된 경우 등 - 상태 변경 없이 무시
        } finally {
            setIsLikeSubmitting(false)
        }
    }

    return (
        <article className={styles.card}>
            <header className={styles.header}>
                <strong>{review.authorNickname}</strong>
                <time dateTime={review.createdAt}>
                    {formatReviewDate(review.createdAt)}
                </time>
            </header>

            <p className={styles.content}>
                {review.content}
            </p>

            <footer className={styles.footer}>
                <button
                    type="button"
                    className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                    aria-pressed={isLiked}
                    disabled={isLikeSubmitting}
                    onClick={handleLikeClick}
                >
                    <img
                        className={styles.likeIcon}
                        src={isLiked
                            ? '/icons/review-like-selected.svg'
                            : '/icons/review-like.svg'}
                        alt=""
                        aria-hidden="true"
                    />
                    {isLikeSubmitting ? '처리 중...' : `좋아요 ${likeCount}`}
                </button>
            </footer>
        </article>
    )
}
