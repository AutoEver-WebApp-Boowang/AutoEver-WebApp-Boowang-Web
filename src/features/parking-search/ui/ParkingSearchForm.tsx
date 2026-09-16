import {useEffect, useRef, useState, type FormEvent} from 'react'
import type {ParkingCardData} from '@/entities/parking'
import type {KakaoPlaceSearchResult} from '../api/searchKakaoPlaces'
import styles from './ParkingSearchForm.module.css'

const SEARCH_DEBOUNCE_DELAY = 400

type ParkingSearchFormProps = {
    onSearch: (keyword: string) => void
    searchResults: ParkingCardData[]
    onResultSelect: (parking: ParkingCardData) => void
    kakaoSearchResults: KakaoPlaceSearchResult[]
    onKakaoResultSelect: (place: KakaoPlaceSearchResult) => void
    isKakaoSearching: boolean
    kakaoSearchError: string | null
    isRegisteredSearching: boolean
    registeredSearchError: string | null
}

export function ParkingSearchForm({
    onSearch,
    searchResults,
    onResultSelect,
    kakaoSearchResults,
    onKakaoResultSelect,
    isKakaoSearching,
    kakaoSearchError,
    isRegisteredSearching,
    registeredSearchError,
}: ParkingSearchFormProps) {
    const [keyword, setKeyword] = useState('')
    const [isResultOpen, setIsResultOpen] = useState(false)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const skipNextSearchRef = useRef(false)

    useEffect(() => {
        if (skipNextSearchRef.current) {
            skipNextSearchRef.current = false
            return
        }

        const trimmedKeyword = keyword.trim()

        if (!trimmedKeyword) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            onSearch(trimmedKeyword)
            setIsResultOpen(true)
        }, SEARCH_DEBOUNCE_DELAY)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [keyword, onSearch])

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
    }

    return (
        <div className={styles.searchContainer}>
            <form
                className={styles.searchForm}
                role="search"
                onSubmit={handleSubmit}
            >
                <label htmlFor="parking-search">
                    주차장 검색
                </label>

                <img
                    className={styles.searchIcon}
                    src="/icons/search.svg"
                    alt=""
                    aria-hidden="true"
                />

                <input
                    id="parking-search"
                    className={styles.searchInput}
                    type="search"
                    name="query"
                    value={keyword}
                    placeholder="주소, 장소명으로 검색"
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onChange={(event) => {
                        const nextKeyword = event.target.value

                        setKeyword(nextKeyword)
                        setIsResultOpen(nextKeyword.trim().length > 0)
                    }}
                />

                <button type="submit">
                    검색
                </button>
            </form>

            {isInputFocused && isResultOpen && (
                <section className={styles.searchResults}>
                    <div className={styles.resultGroup}>
                        <h2>어디로 갈래?</h2>

                        {isKakaoSearching ? (
                            <p>장소를 검색하는 중입니다.</p>
                        ) : kakaoSearchError ? (
                            <p>{kakaoSearchError}</p>
                        ) : kakaoSearchResults.length > 0 ? (
                            <ul>
                                {kakaoSearchResults.map((place) => (
                                    <li key={place.id}>
                                        <button
                                            type="button"
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => {
                                                onKakaoResultSelect(place)
                                                skipNextSearchRef.current = true
                                                setKeyword(place.name)
                                                setIsResultOpen(false)
                                            }}
                                        >
                                            <strong>{place.name}</strong>
                                            <span>{place.address}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>검색 결과가 없습니다.</p>
                        )}
                    </div>

                    <div className={styles.resultGroup}>
                        <h2>등록된 주차장</h2>

                        {isRegisteredSearching ? (
                            <p>등록된 주차장을 검색하는 중입니다.</p>
                        ) : registeredSearchError ? (
                            <p>{registeredSearchError}</p>
                        ) : searchResults.length > 0 ? (
                            <ul>
                                {searchResults.map((parking) => (
                                    <li key={parking.id}>
                                        <button
                                            type="button"
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => {
                                                onResultSelect(parking)
                                                skipNextSearchRef.current = true
                                                setKeyword(parking.name)
                                                setIsResultOpen(false)
                                            }}
                                        >
                                            <strong>{parking.name}</strong>
                                            <span>{parking.address}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>검색 결과가 없습니다.</p>
                        )}
                    </div>
                </section>
            )}
        </div>
    )
}
