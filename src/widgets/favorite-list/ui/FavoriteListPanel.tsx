import {ParkingCard, type ParkingCardData} from '@/entities/parking'
import styles from './FavoriteListPanel.module.css'

type FavoriteListPanelProps = {
    parkingList: ParkingCardData[]
    selectedParkingId: number | null
    isLoading: boolean
    errorMessage: string | null
    onParkingSelect: (parking: ParkingCardData) => void
    onExplore: () => void
}

export function FavoriteListPanel({
    parkingList,
    selectedParkingId,
    isLoading,
    errorMessage,
    onParkingSelect,
    onExplore,
}: FavoriteListPanelProps) {
    return (
        <section className={styles.panel}>
            <header className={styles.header}>
                <h2>즐겨찾기</h2>
            </header>

            {!isLoading && !errorMessage && parkingList.length > 0 && (
                <div className={styles.countRow}>
                    <p>저장한 곳 {parkingList.length}</p>
                </div>
            )}

            {isLoading ? (
                <p className={styles.state}>불러오는 중입니다.</p>
            ) : errorMessage ? (
                <p className={styles.state}>{errorMessage}</p>
            ) : parkingList.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconFrame}>
                        <img
                            src="/icons/favorite-empty.svg"
                            alt=""
                            aria-hidden="true"
                        />
                    </div>
                    <strong>아직 즐겨찾기한 곳이 없어요</strong>
                    <p>주차장 카드의 별을 누르면 여기에 모아둘 수 있어요</p>
                    <button type="button" onClick={onExplore}>
                        지도에서 주차장 찾기
                    </button>
                </div>
            ) : (
                <ul className={styles.list}>
                    {parkingList.map((parking) => (
                        <li key={parking.id}>
                            <ParkingCard
                                parking={parking}
                                isSelected={selectedParkingId === parking.id}
                                onSelect={onParkingSelect}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
