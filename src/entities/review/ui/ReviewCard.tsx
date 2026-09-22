import {useEffect, useState} from 'react'
import type {ParkingReviewData, ReviewLikeResult} from '../model/types'
import {parseServerDate} from '@/shared/lib/date'
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
    }).format(parseServerDate(createdAt))
}

export function ReviewCard({review, onLike}: ReviewCardProps) {
    const [isLiked, setIsLiked] = useState(review.isLiked)
    const [likeCount, setLikeCount] = useState(review.likeCount)
    const [isLikeSubmitting, setIsLikeSubmitting] = useState(false)

    // review.isLiked/likeCount는 로그인 상태에 따라 값이 달라지는데(로그아웃 시 캐시가
    // 비워지고 다시 받아온 값), 컴포넌트가 계속 마운트된 채로 남아있으면 useState 초기값은
    // 그대로라 화면이 안 바뀐다. props가 바뀌면 로컬 상태도 같이 맞춰준다.
    useEffect(() => {
        setIsLiked(review.isLiked)
        setLikeCount(review.likeCount)
    }, [review.isLiked, review.likeCount])

    const handleLikeClick = async () => {
        if (isLikeSubmitting) return
        const previousIsLiked = isLiked
        const previousLikeCount = likeCount
        try {
            setIsLikeSubmitting(true)

            setIsLiked(!isLiked)
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

            const result = await onLike(review.id, isLiked)

            setIsLiked(result.isLiked)
            setLikeCount(result.likeCount)
        } catch {
            // 로그인이 필요해서 취소된 경우 등 - 상태 변경 없이 무시
            setIsLiked(previousIsLiked)
            setLikeCount(previousLikeCount)
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
                    좋아요 {likeCount}
                </button>
            </footer>
        </article>
    )
}
