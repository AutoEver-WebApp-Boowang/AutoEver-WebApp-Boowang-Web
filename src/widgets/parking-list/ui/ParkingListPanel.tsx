import styles from './ParkingListPanel.module.css'
import {useMemo, useState} from "react";
import type {FormEvent} from "react";
import {mockParkingCards, ParkingCard, type ParkingCardData} from "@/entities/parking";

type SortOption = 'distance' | 'recommended' | 'recent'
type ParkingListPanelProps = {
    selectedParking: number | null
    onParkingSelect: (parking: ParkingCardData) => void
}

export function ParkingListPanel({
    onParkingSelect,
    selectedParking
                                 }:ParkingListPanelProps) {
    const [sortOption, setSortOption] = useState<SortOption>('distance')

    const sortedParkingCards = useMemo(() => {
        return [...mockParkingCards].sort((a, b) => {
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
    }, [sortOption])

    const handleSearchSubmit = (
        event: FormEvent<HTMLFormElement>,
    )=> {
        event.preventDefault()
    }
    return(
        <section className={styles.panel}>
            <header className={styles.listHeader}>
                <form
                    className={styles.searchForm}
                    role={"search"}
                    onSubmit={handleSearchSubmit}
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
                        id={"parking-search"} // htmlFor와 연결 label을 클릭해도 해당 요소로 포커스 이동
                        className={styles.searchInput}
                        type="search"
                        name={'query'}
                        placeholder={'주소, 장소명으로 검색'}
                    />
                    <button type={"submit"}>
                        검색
                    </button>
                </form>
                <h2>주변 주차장 {mockParkingCards.length}곳</h2>
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

            <ul className={styles.parkingList}>
                {sortedParkingCards.map((parking) => (
                    <li key={parking.id}>
                        <ParkingCard parking={parking} isSelected={selectedParking === parking.id} onSelect={onParkingSelect}/>
                    </li>
                ))}
            </ul>
        </section>
    )
}
