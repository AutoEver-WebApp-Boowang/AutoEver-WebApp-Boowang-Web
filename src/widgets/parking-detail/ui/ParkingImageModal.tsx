import {useEffect} from 'react'
import {createPortal} from 'react-dom'
import styles from './ParkingImageModal.module.css'

type ParkingImageModalProps = {
    parkingName: string
    images: string[]
    currentImageIndex: number
    onPrevious: () => void
    onNext: () => void
    onClose: () => void
}

export function ParkingImageModal({
                                      parkingName,
                                      images,
                                      currentImageIndex,
                                      onPrevious,
                                      onNext,
                                      onClose,
                                  }: ParkingImageModalProps) {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }

        window.addEventListener('keydown', handleEscape)

        return () => window.removeEventListener('keydown', handleEscape)
    }, [onClose])

    return createPortal(
        <div className={styles.backdrop} onClick={onClose}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label={`${parkingName} 사진 원본`}
                onClick={(event) => event.stopPropagation()}
            >
                <img
                    key={currentImageIndex}
                    className={styles.originalImage}
                    src={images[currentImageIndex]}
                    alt={`${parkingName} 사진 ${currentImageIndex + 1}`}
                />
                <button
                    type="button"
                    className={`${styles.slideButton} ${styles.previous}`}
                    onClick={onPrevious}
                    disabled={currentImageIndex === 0}
                    aria-label="이전 원본 사진"
                >
                    ‹
                </button>
                <button
                    type="button"
                    className={`${styles.slideButton} ${styles.next}`}
                    onClick={onNext}
                    disabled={currentImageIndex === images.length - 1}
                    aria-label="다음 원본 사진"
                >
                    ›
                </button>
                <span className={styles.imageCount}>
                    {currentImageIndex + 1} / {images.length}
                </span>
                <button type="button" className={styles.closeButton} onClick={onClose} aria-label="사진 원본 닫기">
                    ×
                </button>
            </div>
        </div>,
        document.body
    )
}
