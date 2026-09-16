import {useRef, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {getParkingDetail, updateParkingFavorite, type ParkingDetailData} from '@/entities/parking'
import {
    createReview,
    getParkingReviews,
    ReviewCard,
    updateReviewLike,
    type ParkingReviewData,
} from '@/entities/review'
import {ParkingReactionButtons} from '@/features/parking-reaction'
import {ReviewForm} from '@/features/review-create'
import {ParkingImageModal} from './ParkingImageModal'
import styles from './ParkingDetailPanel.module.css'

type ParkingDetailPanelProps = {
    parkingId: number
    onClose: () => void
}

type DetailTab = 'home' | 'reviews'

const SLIDE_WIDTH = 320
const SLIDE_GAP = 12
const SLIDE_VIEWPORT_WIDTH = 348

const formatDate = (date: string | null) => {
    if (!date) return '확인 정보 없음'

    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date))
}

export function ParkingDetailPanel({parkingId, onClose}: ParkingDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<DetailTab>('home')
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [dragOffset, setDragOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
    const dragStartX = useRef(0)
    const hasDragged = useRef(false)
    const queryClient = useQueryClient()

    const parkingDetailQuery = useQuery({
        queryKey: ['parking', 'detail', parkingId],
        queryFn: ({signal}) => getParkingDetail(parkingId, signal),
        retry: false,
    })

    const parkingReviewsQuery = useQuery({
        queryKey: ['parking', 'reviews', parkingId],
        queryFn: ({signal}) => getParkingReviews(parkingId, signal),
        enabled: activeTab === 'reviews',
        retry: false,
    })

    const reviewLikeMutation = useMutation({
        mutationFn: ({reviewId, isCurrentlyLiked}: {
            reviewId: number
            isCurrentlyLiked: boolean
        }) => updateReviewLike(reviewId, isCurrentlyLiked),
        onSuccess: (result, {reviewId}) => {
            queryClient.setQueryData<ParkingReviewData[]>(
                ['parking', 'reviews', parkingId],
                (currentReviews = []) => currentReviews.map((review) => (
                    review.id === reviewId
                        ? {
                            ...review,
                            isLiked: result.isLiked,
                            likeCount: result.likeCount,
                        }
                        : review
                )),
            )
        },
    })

    const createReviewMutation = useMutation({
        mutationFn: (content: string) => createReview({
            parkingId,
            content,
        }),
        onSuccess: (newReview) => {
            queryClient.setQueryData<ParkingReviewData[]>(
                ['parking', 'reviews', parkingId],
                (currentReviews = []) => [newReview, ...currentReviews],
            )

            queryClient.setQueryData<ParkingDetailData>(
                ['parking', 'detail', parkingId],
                (currentDetail) => currentDetail
                    ? {
                        ...currentDetail,
                        reviewCount: currentDetail.reviewCount + 1,
                    }
                    : currentDetail,
            )
        },
    })

    const favoriteMutation = useMutation({
        mutationFn: () => updateParkingFavorite(
            parkingId,
            parkingDetailQuery.data?.isFavorite ?? false,
        ),
        onSuccess: (result) => {
            queryClient.setQueryData<ParkingDetailData>(
                ['parking', 'detail', parkingId],
                (currentDetail) => currentDetail
                    ? {
                        ...currentDetail,
                        isFavorite: result.isFavorite,
                    }
                    : currentDetail,
            )

            void queryClient.invalidateQueries({
                queryKey: ['parking', 'favorites'],
            })
        },
    })

    const parkingDetail = parkingDetailQuery.data
    const parkingReviews = parkingReviewsQuery.data ?? []
    const errorMessage = parkingDetailQuery.error instanceof Error
        ? parkingDetailQuery.error.message
        : null
    const reviewsError = parkingReviewsQuery.error instanceof Error
        ? parkingReviewsQuery.error.message
        : null

    const handleReviewLike = (
        reviewId: number,
        isCurrentlyLiked: boolean,
    ) => reviewLikeMutation.mutateAsync({reviewId, isCurrentlyLiked})

    if (parkingDetailQuery.isPending) {
        return (
            <aside className={styles.panel}>
                <div className={styles.loadingState} role="status" aria-live="polite">
                    <span className={styles.loadingSpinner} aria-hidden="true"/>
                    <span>상세 정보를 불러오는 중입니다.</span>
                </div>
            </aside>
        )
    }

    if (errorMessage) {
        return <aside className={styles.panel}>{errorMessage}</aside>
    }

    if (!parkingDetail) {
        return <aside className={styles.panel}>상세 정보를 찾을 수 없습니다</aside>
    }

    const images = parkingDetail.imageUrls.length > 0
        ? parkingDetail.imageUrls
        : ['/images/default-parking.png']
    const slideTrackWidth = images.length * SLIDE_WIDTH + (images.length - 1) * SLIDE_GAP
    const maximumSlidePosition = Math.max(slideTrackWidth - SLIDE_VIEWPORT_WIDTH, 0)
    const slidePosition = Math.min(
        currentImageIndex * (SLIDE_WIDTH + SLIDE_GAP),
        maximumSlidePosition
    )

    const handlePreviousImage = () => {
        setCurrentImageIndex((currentIndex) => Math.max(currentIndex - 1, 0))
    }

    const handleNextImage = () => {
        setCurrentImageIndex((currentIndex) => Math.min(currentIndex + 1, images.length - 1))
    }

    const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
        dragStartX.current = event.clientX
        hasDragged.current = false
        setIsDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
    }

    const handleDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return

        const nextOffset = event.clientX - dragStartX.current

        if (Math.abs(nextOffset) > 5) hasDragged.current = true

        const isDraggingPastStart = currentImageIndex === 0 && nextOffset > 0
        const isDraggingPastEnd = currentImageIndex === images.length - 1 && nextOffset < 0

        setDragOffset(
            isDraggingPastStart || isDraggingPastEnd
                ? nextOffset * 0.25
                : nextOffset
        )
    }

    const handleDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        const dragThreshold = 50

        if (dragOffset <= -dragThreshold) handleNextImage()
        if (dragOffset >= dragThreshold) handlePreviousImage()

        setIsDragging(false)
        setDragOffset(0)
        event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const handleImageClick = () => {
        if (hasDragged.current) {
            hasDragged.current = false
            return
        }

        setIsImageModalOpen(true)
    }

    return (
        <article className={styles.panel}>
            <header className={styles.summary}>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => favoriteMutation.mutate()}
                        disabled={favoriteMutation.isPending}
                        aria-label={parkingDetail.isFavorite ? '즐겨찾기에서 삭제' : '즐겨찾기에 추가'}
                        aria-pressed={parkingDetail.isFavorite}
                    >
                        {parkingDetail.isFavorite ? '★' : '☆'}
                    </button>
                    <button type="button" className={styles.iconButton} onClick={onClose} aria-label="상세 정보 닫기">
                        ×
                    </button>
                </div>

                <h2 className={styles.title}>{parkingDetail.name}</h2>

                <div className={styles.typeMeta}>
                    <span className={parkingDetail.type === '공영' ? styles.publicBadge : styles.userBadge}>
                        {parkingDetail.type}
                    </span>
                    <span>리뷰 {parkingDetail.reviewCount}</span>
                </div>

                <p className={styles.operatingHours}>
                    <span>운영시간</span>
                    {parkingDetail.operatingHours ?? '정보 없음'}
                </p>
            </header>

            <section className={styles.gallery} aria-label="주차장 사진">
                <div
                    className={`${styles.slideViewport} ${isDragging ? styles.dragging : ''}`}
                    onPointerDown={handleDragStart}
                    onPointerMove={handleDragMove}
                    onPointerUp={handleDragEnd}
                    onPointerCancel={handleDragEnd}
                    onClick={handleImageClick}
                >
                    <div
                        className={styles.slideTrack}
                        style={{
                            transform: `translateX(calc(-${slidePosition}px + ${dragOffset}px))`,
                        }}
                    >
                        {images.map((imageUrl, imageIndex) => (
                            <button
                                key={`${imageUrl}-${imageIndex}`}
                                type="button"
                                className={styles.slideItem}
                                tabIndex={imageIndex === currentImageIndex ? 0 : -1}
                                aria-label={`${parkingDetail.name} 사진 ${imageIndex + 1} 원본 보기`}
                            >
                                <img
                                    className={styles.image}
                                    src={imageUrl}
                                    alt=""
                                    draggable={false}
                                />
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    className={`${styles.slideButton} ${styles.previous}`}
                    onClick={handlePreviousImage}
                    disabled={currentImageIndex === 0}
                    aria-label="이전 사진"
                >
                    ‹
                </button>
                <button
                    type="button"
                    className={`${styles.slideButton} ${styles.next}`}
                    onClick={handleNextImage}
                    disabled={currentImageIndex === images.length - 1}
                    aria-label="다음 사진"
                >
                    ›
                </button>
                <span className={styles.slideCount}>
                    {currentImageIndex + 1} / {images.length}
                </span>
            </section>

            {isImageModalOpen && (
                <ParkingImageModal
                    parkingName={parkingDetail.name}
                    images={images}
                    currentImageIndex={currentImageIndex}
                    onPrevious={handlePreviousImage}
                    onNext={handleNextImage}
                    onClose={() => setIsImageModalOpen(false)}
                />
            )}

            <div className={styles.tabs} role="tablist" aria-label="상세 정보 메뉴">
                <button
                    type="button"
                    role="tab"
                    className={activeTab === 'home' ? styles.activeTab : undefined}
                    aria-selected={activeTab === 'home'}
                    onClick={() => setActiveTab('home')}
                >
                    홈
                </button>
                <button
                    type="button"
                    role="tab"
                    className={activeTab === 'reviews' ? styles.activeTab : undefined}
                    aria-selected={activeTab === 'reviews'}
                    onClick={() => setActiveTab('reviews')}
                >
                    리뷰
                </button>
            </div>

            {activeTab === 'home' ? (
                <div className={styles.homeContent} role="tabpanel">
                    <dl className={styles.information}>
                        <div className={styles.informationItem}>
                            <dt>주소</dt>
                            <dd>{parkingDetail.address}</dd>
                        </div>
                        <div className={styles.informationItem}>
                            <dt>이용 요금</dt>
                            <dd>{parkingDetail.isFree ? '무료' : parkingDetail.feeDescription ?? '요금 정보 없음'}</dd>
                        </div>
                        <div className={styles.informationItem}>
                            <dt>주차 가능 대수</dt>
                            <dd>{parkingDetail.capacity !== null ? `${parkingDetail.capacity}대` : '정보 없음'}</dd>
                        </div>
                        <div className={styles.informationItem}>
                            <dt>시설 조건</dt>
                            <dd>{parkingDetail.hasRoof ? '지붕 있음' : '지붕 없음'}</dd>
                        </div>
                        <div className={styles.informationItem}>
                            <dt>최근 확인</dt>
                            <dd>{formatDate(parkingDetail.lastConfirmedAt)}</dd>
                        </div>
                    </dl>

                    <ParkingReactionButtons
                        initialRecommendCount={parkingDetail.recommendCount}
                    />

                    <section className={styles.description} aria-labelledby="parking-description-title">
                        <h3 id="parking-description-title">설명</h3>
                        <p>{parkingDetail.description ?? '등록된 주의사항이 없습니다.'}</p>
                    </section>
                </div>
            ) : (
                <div className={styles.reviewsContent} role="tabpanel" aria-label="리뷰">
                    <div className={styles.reviewActions}>
                        <button
                            type="button"
                            className={styles.reviewWriteButton}
                            onClick={() => setIsReviewFormOpen(true)}
                        >
                            리뷰 작성
                        </button>
                    </div>

                    {parkingReviewsQuery.isFetching ? (
                        <div className={styles.reviewLoading} role="status" aria-live="polite">
                            <span className={styles.reviewLoadingSpinner} aria-hidden="true"/>
                            <span>리뷰를 불러오는 중입니다.</span>
                        </div>
                    ) : reviewsError ? (
                        <p className={styles.emptyReviews}>
                            {reviewsError}
                        </p>
                    ) : parkingReviews.length > 0 ? (
                        <ul className={styles.reviewList}>
                            {parkingReviews.map((review) => (
                                <li key={review.id}>
                                    <ReviewCard
                                        review={review}
                                        onLike={handleReviewLike}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.emptyReviews}>
                            아직 등록된 리뷰가 없습니다.
                        </p>
                    )}

                    {isReviewFormOpen && (
                        <div
                            className={styles.reviewFormLayer}
                            onMouseDown={(event) => {
                                if (event.target === event.currentTarget) {
                                    setIsReviewFormOpen(false)
                                }
                            }}
                        >
                            <ReviewForm
                                onSubmit={async (content) => {
                                    await createReviewMutation.mutateAsync(content)
                                    setIsReviewFormOpen(false)
                                }}
                                onClose={() => setIsReviewFormOpen(false)}
                            />
                        </div>
                    )}
                </div>
            )}
        </article>
    )
}
