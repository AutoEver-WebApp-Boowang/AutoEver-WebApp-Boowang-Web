import {useEffect, useRef, useState} from 'react'
import {type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {
    deleteParking,
    getParkingDetail,
    updateParkingFavorite,
    updateParkingInfo,
    type ParkingDetailData,
} from '@/entities/parking'
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
import {useAppSelector} from "@/app/providers/store/hooks.ts";

type ParkingDetailPanelProps = {
    parkingId: number
    favoriteParkingIds: Set<number>
    onClose: () => void
    onRequireLogin: () => void
}

type DetailTab = 'home' | 'reviews'

const SLIDE_WIDTH = 320
const SLIDE_GAP = 12
const SLIDE_VIEWPORT_WIDTH = 348
const REVIEW_PAGE_SIZE = 10

const formatDate = (date: string | null) => {
    if (!date) return '확인 정보 없음'

    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date))
}

export function ParkingDetailPanel({parkingId, favoriteParkingIds, onClose, onRequireLogin}: ParkingDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<DetailTab>('home')
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [dragOffset, setDragOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editFeeDescription, setEditFeeDescription] = useState('')
    const [editCapacity, setEditCapacity] = useState('')
    const [editHasRoof, setEditHasRoof] = useState(false)
    const dragStartX = useRef(0)
    const hasDragged = useRef(false)
    const tabScrollRef = useRef<HTMLDivElement>(null)
    const reviewLoadMoreRef = useRef<HTMLDivElement>(null)
    const queryClient = useQueryClient()


    const accessToken = useAppSelector((state) => state.auth.accessToken)
    const tokenType = useAppSelector((state) => state.auth.tokenType)
    const userId = useAppSelector((state) => state.auth.user?.id)
    const userNickname = useAppSelector((state) => state.auth.user?.nickname)
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

    const parkingDetailQuery = useQuery({
        queryKey: ['parking', 'detail', parkingId, accessToken],
        queryFn: ({signal}) => getParkingDetail(
            parkingId,
            favoriteParkingIds.has(parkingId),
            accessToken,
            tokenType,
            signal,
        ),
        retry: false,
    })

    const parkingReviewsQuery = useInfiniteQuery({
        queryKey: ['parking', 'reviews', parkingId],
        queryFn: ({pageParam, signal}) => getParkingReviews(
            parkingId,
            pageParam,
            REVIEW_PAGE_SIZE,
            accessToken!,
            tokenType!,
            signal,
        ),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.reduce((sum, page) => sum + page.reviews.length, 0)
            return loadedCount < lastPage.totalCount ? allPages.length : undefined
        },
        enabled: activeTab === 'reviews' && isAuthenticated,
        retry: false,
    })

    // 리뷰 탭 스크롤 영역 맨 아래에 도달하면 다음 페이지를 불러온다 (무한 스크롤)
    useEffect(() => {
        if (activeTab !== 'reviews') return

        const sentinel = reviewLoadMoreRef.current
        const scrollRoot = tabScrollRef.current

        if (!sentinel || !scrollRoot) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && parkingReviewsQuery.hasNextPage && !parkingReviewsQuery.isFetchingNextPage) {
                    void parkingReviewsQuery.fetchNextPage()
                }
            },
            {root: scrollRoot, threshold: 0.1},
        )

        observer.observe(sentinel)

        return () => observer.disconnect()
    }, [activeTab, parkingReviewsQuery.hasNextPage, parkingReviewsQuery.isFetchingNextPage, parkingReviewsQuery.fetchNextPage])

    const reviewLikeMutation = useMutation({
        mutationFn: ({reviewId, isCurrentlyLiked}: {
            reviewId: number
            isCurrentlyLiked: boolean
        }) => {
            const currentLikeCount = parkingReviewsQuery.data?.pages
                .flatMap((page) => page.reviews)
                .find((review) => review.id === reviewId)
                ?.likeCount ?? 0

            return updateReviewLike(reviewId, isCurrentlyLiked, currentLikeCount, accessToken!, tokenType!)
        },
        onSuccess: (result, {reviewId}) => {
            queryClient.setQueryData<InfiniteData<{reviews: ParkingReviewData[]; totalCount: number}>>(
                ['parking', 'reviews', parkingId],
                (currentData) => currentData
                    ? {
                        ...currentData,
                        pages: currentData.pages.map((page) => ({
                            ...page,
                            reviews: page.reviews.map((review) => (
                                review.id === reviewId
                                    ? {
                                        ...review,
                                        isLiked: result.isLiked,
                                        likeCount: result.likeCount,
                                    }
                                    : review
                            )),
                        })),
                    }
                    : currentData,
            )
        },
    })

    const createReviewMutation = useMutation({
        mutationFn: (content: string) => createReview(
            {parkingId, content},
            userNickname ?? '',
            accessToken!,
            tokenType!,
        ),
        onSuccess: () => {
            // 서버가 생성된 리뷰 전체를 안 돌려줘서, 목록/상세를 다시 조회해서 최신 상태로 갱신한다
            void queryClient.invalidateQueries({
                queryKey: ['parking', 'reviews', parkingId],
            })
            void queryClient.invalidateQueries({
                queryKey: ['parking', 'detail', parkingId],
            })
        },
    })

    const favoriteMutation = useMutation({
        mutationFn: () => updateParkingFavorite(
            parkingId,
            parkingDetailQuery.data?.isFavorite ?? false,
            userId!,
            accessToken!,
            tokenType!,
        ),
        onSuccess: (result) => {
            queryClient.setQueryData<ParkingDetailData>(
                ['parking', 'detail', parkingId, accessToken],
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

    const updateInfoMutation = useMutation({
        mutationFn: () => updateParkingInfo(
            parkingId,
            {
                feeDescription: editFeeDescription,
                capacity: Number(editCapacity),
                hasRoof: editHasRoof,
            },
            accessToken!,
            tokenType!,
        ),
        onSuccess: () => {
            queryClient.setQueryData<ParkingDetailData>(
                ['parking', 'detail', parkingId, accessToken],
                (currentDetail) => currentDetail
                    ? {
                        ...currentDetail,
                        feeDescription: editFeeDescription,
                        capacity: Number(editCapacity),
                        hasRoof: editHasRoof,
                    }
                    : currentDetail,
            )
            setIsEditMode(false)
        },
        onError: (error) => {
            window.alert(error instanceof Error ? error.message : '수정에 실패했습니다')
        },
    })

    const deleteParkingMutation = useMutation({
        mutationFn: () => deleteParking(parkingId, accessToken!, tokenType!),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['parking']})
            onClose()
        },
        onError: (error) => {
            window.alert(error instanceof Error ? error.message : '삭제에 실패했습니다')
        },
    })

    const parkingDetail = parkingDetailQuery.data
    const parkingReviews = parkingReviewsQuery.data?.pages.flatMap((page) => page.reviews) ?? []
    const errorMessage = parkingDetailQuery.error instanceof Error
        ? parkingDetailQuery.error.message
        : null
    const reviewsError = parkingReviewsQuery.error instanceof Error
        ? parkingReviewsQuery.error.message
        : null

    const handleReviewLike = (
        reviewId: number,
        isCurrentlyLiked: boolean,
    ) => {
        if (!isAuthenticated) {
            onRequireLogin()
            return Promise.reject(new Error('로그인이 필요합니다'))
        }

        return reviewLikeMutation.mutateAsync({reviewId, isCurrentlyLiked})
    }

    const handleStartEdit = () => {
        if (!parkingDetail) return

        setEditFeeDescription(parkingDetail.feeDescription ?? '')
        setEditCapacity(parkingDetail.capacity !== null ? String(parkingDetail.capacity) : '')
        setEditHasRoof(parkingDetail.hasRoof)
        setIsEditMode(true)
        setIsMenuOpen(false)
    }

    const handleDeleteParking = () => {
        setIsMenuOpen(false)

        const isConfirmed = window.confirm('이 주차장 정보를 삭제할까요? 삭제하면 되돌릴 수 없어요.')

        if (!isConfirmed) return

        deleteParkingMutation.mutate()
    }

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
                    <div className={styles.menuWrapper}>
                        {isAuthenticated && (
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => setIsMenuOpen((currentIsOpen) => !currentIsOpen)}
                                aria-label="장소 정보 관리 메뉴"
                                aria-haspopup="menu"
                                aria-expanded={isMenuOpen}
                            >
                                ⋯
                            </button>
                        )}

                        {isMenuOpen && (
                            <>
                                <div
                                    className={styles.menuBackdrop}
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className={styles.menuDropdown} role="menu">
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className={styles.menuItem}
                                        onClick={handleStartEdit}
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                        onClick={handleDeleteParking}
                                        disabled={deleteParkingMutation.isPending}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.trailingActions}>
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => {
                                if (!isAuthenticated) {
                                    onRequireLogin()
                                    return
                                }
                                favoriteMutation.mutate()
                            }}
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

            <div className={styles.tabScroll} ref={tabScrollRef}>
            {activeTab === 'home' ? (
                <div className={styles.homeContent} role="tabpanel">
                    <dl className={styles.information}>
                        <div className={styles.informationItem}>
                            <dt>주소</dt>
                            <dd>{parkingDetail.address}</dd>
                        </div>
                        {parkingDetail.detailAddress && (
                            <div className={styles.informationItem}>
                                <dt>상세 주소</dt>
                                <dd>{parkingDetail.detailAddress}</dd>
                            </div>
                        )}
                        <div className={styles.informationItem}>
                            <dt>이용 요금</dt>
                            {isEditMode ? (
                                <dd>
                                    <input
                                        className={styles.editInput}
                                        type="text"
                                        value={editFeeDescription}
                                        onChange={(event) => setEditFeeDescription(event.target.value)}
                                        placeholder="예: 시간당 1,000원"
                                    />
                                </dd>
                            ) : (
                                <dd>{parkingDetail.isFree ? '무료' : parkingDetail.feeDescription ?? '요금 정보 없음'}</dd>
                            )}
                        </div>
                        <div className={styles.informationItem}>
                            <dt>주차 가능 대수</dt>
                            {isEditMode ? (
                                <dd>
                                    <input
                                        className={styles.editInput}
                                        type="number"
                                        min={0}
                                        value={editCapacity}
                                        onChange={(event) => setEditCapacity(event.target.value)}
                                        placeholder="예: 15"
                                    />
                                </dd>
                            ) : (
                                <dd>{parkingDetail.capacity !== null ? `${parkingDetail.capacity}대` : '정보 없음'}</dd>
                            )}
                        </div>
                        <div className={styles.informationItem}>
                            <dt>시설 조건</dt>
                            {isEditMode ? (
                                <dd>
                                    <label className={styles.editCheckboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={editHasRoof}
                                            onChange={(event) => setEditHasRoof(event.target.checked)}
                                        />
                                        지붕 있음
                                    </label>
                                </dd>
                            ) : (
                                <dd>{parkingDetail.hasRoof ? '지붕 있음' : '지붕 없음'}</dd>
                            )}
                        </div>
                        <div className={styles.informationItem}>
                            <dt>최근 확인</dt>
                            <dd>{formatDate(parkingDetail.lastConfirmedAt)}</dd>
                        </div>
                    </dl>

                    {isEditMode && (
                        <div className={styles.editActions}>
                            <button
                                type="button"
                                className={styles.editCancelButton}
                                onClick={() => setIsEditMode(false)}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className={styles.editSaveButton}
                                onClick={() => updateInfoMutation.mutate()}
                                disabled={updateInfoMutation.isPending}
                            >
                                저장
                            </button>
                        </div>
                    )}

                    <ParkingReactionButtons
                        parkingId={parkingId}
                        initialReaction={parkingDetail.myReaction}
                        initialRecommendCount={parkingDetail.recommendCount}
                        initialNotRecommendCount={parkingDetail.notRecommendCount}
                        isAuthenticated={isAuthenticated}
                        accessToken={accessToken}
                        tokenType={tokenType}
                        onRequireLogin={onRequireLogin}
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
                            onClick={() => {
                                if (!isAuthenticated) {
                                    onRequireLogin()
                                    return
                                }
                                setIsReviewFormOpen(true)
                            }}
                        >
                            <img
                                className={styles.reviewWriteIcon}
                                src="/icons/review-write.svg"
                                alt=""
                                aria-hidden="true"
                            />
                            리뷰 쓰기
                        </button>
                    </div>

                    {!isAuthenticated ? (
                        <p className={styles.emptyReviews}>
                            리뷰는 로그인 후 확인할 수 있어요.
                        </p>
                    ) : parkingReviewsQuery.isLoading ? (
                        <div className={styles.reviewLoading} role="status" aria-live="polite">
                            <span className={styles.reviewLoadingSpinner} aria-hidden="true"/>
                            <span>리뷰를 불러오는 중입니다.</span>
                        </div>
                    ) : reviewsError ? (
                        <p className={styles.emptyReviews}>
                            {reviewsError}
                        </p>
                    ) : parkingReviews.length > 0 ? (
                        <>
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
                            <div ref={reviewLoadMoreRef} className={styles.reviewLoadMoreSentinel} aria-hidden="true"/>
                            {parkingReviewsQuery.isFetchingNextPage && (
                                <div className={styles.reviewLoading} role="status" aria-live="polite">
                                    <span className={styles.reviewLoadingSpinner} aria-hidden="true"/>
                                    <span>리뷰를 더 불러오는 중입니다.</span>
                                </div>
                            )}
                        </>
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
            </div>
        </article>
    )
}
