import styles from './ParkingListPanel.module.css'
import {useEffect, useMemo, useRef, useState} from "react";
import {ParkingCard, type ParkingCardData} from "@/entities/parking";
import {ParkingSearchForm, type KakaoPlaceSearchResult} from '@/features/parking-search'

type SortOption = 'distance' | 'recommended' | 'recent'
type ParkingListPanelProps = {
    parkingList: ParkingCardData[]
    isLoading: boolean
    errorMessage: string | null
    selectedParking: number | null
    onParkingSelect: (parking: ParkingCardData) => void
    onSearch: (keyword: string) => void
    searchResults: ParkingCardData[]
    onSearchResultSelect: (parking: ParkingCardData) => void
    kakaoSearchResults: KakaoPlaceSearchResult[]
    onKakaoResultSelect: (place: KakaoPlaceSearchResult) => void
    isKakaoSearching: boolean
    kakaoSearchError: string | null
    isRegisteredSearching: boolean
    registeredSearchError: string | null
}

export function ParkingListPanel({
                                     parkingList,
                                     isLoading,
                                     errorMessage,
                                     onParkingSelect,
                                     selectedParking,
                                     onSearch,
                                     searchResults,
                                     onSearchResultSelect,
                                     kakaoSearchResults,
                                     onKakaoResultSelect,
                                     isKakaoSearching,
                                     kakaoSearchError,
                                     isRegisteredSearching,
                                     registeredSearchError,

                                 }: ParkingListPanelProps) {
    const [sortOption, setSortOption] = useState<SortOption>('distance')
    const parkingItemRefs = useRef<Map<number, HTMLLIElement>>(new Map())

    const sortedParkingCards = useMemo(() => {
        return [...parkingList].sort((a, b) => {
            switch (sortOption) {
                case 'recommended':
                    return (b.likeCount - b.dislikeCount) - (a.likeCount - a.dislikeCount)
                case 'recent':
                    return (b.lastVerifiedAt ? Date.parse(b.lastVerifiedAt) : 0)
                        - (a.lastVerifiedAt ? Date.parse(a.lastVerifiedAt) : 0)
                case 'distance':
                default:
                    return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity)
            }
        })
    }, [parkingList, sortOption])

    useEffect(() => {
        if (selectedParking === null) return

        const selectedItem = parkingItemRefs.current.get(selectedParking)

        selectedItem?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    }, [selectedParking])

    return (
        <section className={styles.panel}>
            <header className={styles.listHeader}>
                <ParkingSearchForm
                    onSearch={onSearch}
                    searchResults={searchResults}
                    onResultSelect={onSearchResultSelect}
                    kakaoSearchResults={kakaoSearchResults}
                    onKakaoResultSelect={onKakaoResultSelect}
                    isKakaoSearching={isKakaoSearching}
                    kakaoSearchError={kakaoSearchError}
                    isRegisteredSearching={isRegisteredSearching}
                    registeredSearchError={registeredSearchError}
                />
                <h2>주변 주차장 {parkingList.length}곳</h2>
                <label htmlFor="parking-sort">
                    정렬
                </label>

                <div className={styles.sortControl}>
                    <select
                        name="sort"
                        id="parking-sort"
                        className={styles.sortSelect}
                        value={sortOption}
                        onChange={(event) => setSortOption(event.target.value as SortOption)}
                    >
                        <option value="distance">거리순</option>
                        <option value="recommended">추천순</option>
                        <option value="recent">최근 리뷰</option>
                    </select>
                    <span className={styles.sortArrow} aria-hidden="true">▾</span>
                </div>
            </header>

            {isLoading ? (
                <div className={styles.loadingState} role="status" aria-live="polite">
                    <span className={styles.loadingSpinner} aria-hidden="true"/>
                    <span>주차장 목록을 불러오는 중입니다.</span>
                </div>
            ) : errorMessage ? (
                <p className={styles.errorMessage}>{errorMessage}</p>
            ) : parkingList.length === 0 ? (
                <div className={styles.emptyState}>
                    <strong>이 지역에는 등록된 주차장이 없어요</strong>
                    <span>지도를 이동한 후 현재 위치에서 다시 검색해 보세요.</span>
                </div>
            ) : (
                <ul className={styles.parkingList}>
                    {sortedParkingCards.map((parking) => (
                        <li
                            key={parking.id}
                            ref={(element) => {
                                if (element) {
                                    parkingItemRefs.current.set(parking.id, element)
                                    return
                                }

                                parkingItemRefs.current.delete(parking.id)
                            }}
                        >
                            <ParkingCard parking={parking} isSelected={selectedParking === parking.id}
                                         onSelect={onParkingSelect}/>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
