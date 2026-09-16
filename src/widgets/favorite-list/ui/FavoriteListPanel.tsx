import {ParkingCard, type ParkingCardData} from '@/entities/parking'
import styles from './FavoriteListPanel.module.css'

type FavoriteListPanelProps = {
    parkingList: ParkingCardData[]
    selectedParkingId: number | null
    isLoading: boolean
    errorMessage: string | null
    onParkingSelect: (parking: ParkingCardData) => void
}

export function FavoriteListPanel({
    parkingList,
    selectedParkingId,
    isLoading,
    errorMessage,
    onParkingSelect,
}: FavoriteListPanelProps) {
    return (
        <section className={styles.panel}>
            <header className={styles.header}>
                <h2>즐겨찾기</h2>
                <span>{parkingList.length}곳</span>
            </header>

            {isLoading ? (
                <p className={styles.state}>불러오는 중입니다.</p>
            ) : errorMessage ? (
                <p className={styles.state}>{errorMessage}</p>
            ) : parkingList.length === 0 ? (
                <p className={styles.state}>즐겨찾기한 주차장이 없습니다.</p>
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
