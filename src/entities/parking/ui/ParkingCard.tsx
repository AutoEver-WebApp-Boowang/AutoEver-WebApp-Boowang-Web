import type {ParkingCardData} from '../model/types'
import {formatDistanceMeters} from '@/shared/lib/geo'
import styles from './ParkingCard.module.css'

type ParkingCardProps = {
    parking: ParkingCardData
    isSelected: boolean
    onSelect: (parking: ParkingCardData) => void
}


const getTimeAgo = (date: string | null) => {
    if (!date) return '정보 없음'

    const verifiedTime = new Date(date).getTime()

    if (Number.isNaN(verifiedTime)) return '정보 없음'

    const elapsedMinutes = Math.floor((Date.now() - verifiedTime) / (1000 * 60))

    if (elapsedMinutes < 1) return '방금 전'
    if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`

    const elapsedHours = Math.floor(elapsedMinutes / 60)

    if (elapsedHours < 24) return `${elapsedHours}시간 전`

    const elapsedDays = Math.floor(elapsedHours / 24)

    return `${elapsedDays}일 전`
}

export function ParkingCard(
    {
        parking,
        onSelect,
        isSelected,
    }: ParkingCardProps) {
    return (
        <button
            type={"button"}
            className={`${styles.Card} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelect(parking)}
        >
            <img
                className={styles.thumbnail}
                src={parking.thumbnailUrl ?? '/images/default-parking.png'}
                alt="주차장 이미지"
            />
            <div className={styles.header}>
                <h3 className={styles.name}>{parking.name}</h3>
                <span className={styles.distanceMeters}>
                    {parking.distanceMeters !== null ? formatDistanceMeters(parking.distanceMeters) : '거리 정보 없음'}
                </span>
            </div>
            <ul aria-label={"주차장 속성"} className={styles.attributes}>
                <li className={parking.source === 'public' ? styles.publicBadge : styles.userBadge}>
                    {parking.source === 'public' ? '공영' : '제보'}
                </li>
                <li>{parking.isFree ? '무료' : '유료'}</li>
                <li>{parking.hasRoof ? '지붕 있음' : '지붕 없음'}</li>
                {/* 거리 바로 아래, 속성 뱃지와 같은 줄에 리뷰 수 노출 */}
                <li className={styles.reviewCount}>리뷰 {parking.reviewCount}</li>
            </ul>
            <ul aria-label={"운영 시간"} className={styles.hours}>
                <li>{parking.operatingHours ?? '운영시간 정보 없음'}</li>
            </ul>
            <div className={styles.footer}>
                <ul className={styles.likes}>
                    <li className={styles.likeCount}>
                        <img src="/icons/thumb-up.svg" alt="" aria-hidden="true"/>
                        {parking.likeCount}
                    </li>
                    <li className={styles.dislikeCount}>
                        <img src="/icons/thumb-down.svg" alt="" aria-hidden="true"/>
                        {parking.dislikeCount}
                    </li>
                </ul>
                <span className={styles.lastVerifiedAt}>
                    최근 확인 {getTimeAgo(parking.lastVerifiedAt)}
                </span>
            </div>
        </button>
    )
}
