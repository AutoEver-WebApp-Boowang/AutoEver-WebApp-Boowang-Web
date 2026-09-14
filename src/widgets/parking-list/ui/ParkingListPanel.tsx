import styles from './ParkingListPanel.module.css'
import type {FormEvent} from "react";

export function ParkingListPanel() {

    const handleSearchSubmit = (
        event: FormEvent<HTMLFormElement>,
    )=> {
        event.preventDefault()
    }
    return(
        <section className={styles.panel}>
            <form
                className={styles.searchForm}
                role={"search"}
                onSubmit={handleSearchSubmit}
            >
                <label htmlFor="parking-search">
                    주차장 검색
                </label>

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


            <header className={styles.listHeader}>
                <h2>이런 곳들이 있어요</h2>
                <label htmlFor="parking-sort">
                    정렬
                </label>

                <select
                    name="sort"
                    id="parking-sort"
                    className={styles.sortSelect}
                    defaultValue={'distance'}
                >
                    <option value="distance">거리순</option>
                    <option value="recommended">추천순</option>
                    <option value="recent">최근 리뷰</option>
                </select>
            </header>

            <ul className={styles.parkingList}>
                <li>주차장 카드 영역</li>
            </ul>
        </section>
    )
}
