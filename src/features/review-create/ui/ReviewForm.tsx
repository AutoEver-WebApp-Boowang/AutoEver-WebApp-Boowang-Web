import {useState, type FormEvent} from 'react'
import styles from './ReviewForm.module.css'

type ReviewFormProps = {
    onSubmit: (content: string) => Promise<void>
    onClose: () => void
}

const MAX_REVIEW_LENGTH = 500

export function ReviewForm({onSubmit, onClose}: ReviewFormProps) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const trimmedContent = content.trim()

        if (!trimmedContent || isSubmitting) return

        try {
            setIsSubmitting(true)
            await onSubmit(trimmedContent)
            setContent('')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-form-title"
        >
            <header className={styles.header}>
                <h3 id="review-form-title">리뷰 작성</h3>
                <button
                    type="button"
                    className={styles.closeButton}
                    aria-label="리뷰 작성창 닫기"
                    onClick={onClose}
                >
                    ×
                </button>
            </header>

            <label className={styles.textareaLabel} htmlFor="review-content">
                이용 경험
            </label>
            <textarea
                id="review-content"
                value={content}
                maxLength={MAX_REVIEW_LENGTH}
                placeholder="주차장의 이용 경험을 알려주세요."
                onChange={(event) => setContent(event.target.value)}
            />

            <div className={styles.footer}>
                <span>
                    {content.length}/{MAX_REVIEW_LENGTH}
                </span>

                <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                >
                    {isSubmitting ? '등록 중...' : '리뷰 등록'}
                </button>
            </div>
        </form>
    )
}
