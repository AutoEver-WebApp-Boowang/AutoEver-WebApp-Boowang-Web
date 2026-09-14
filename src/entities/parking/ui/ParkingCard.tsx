import type { ParkingCardData } from '../model/types'
import styles from './ParkingCard.module.css'

type ParkingCardProps = {
    parking: ParkingCardData
}

export function ParkingCard(
    { parking, }: ParkingCardProps) {
    return (
        <article className={styles.Card}>
            <img
                className={styles.thumbnail}
                src={parking.thumbnailUrl ?? '/images/default-parking.png'}
                alt="주차장 이미지"
            />
            <div className={styles.header}>
                <h3 className={styles.name}>{parking.name}</h3>
                <span className={styles.distanceMeters}>
                    {parking.distanceMeters !== null ? `${parking.distanceMeters}m` : '거리 정보 없음'}
                </span>
            </div>
            <ul aria-label={"주차장 속성"} className={styles.attributes}>
                <li className={parking.source === 'public' ? styles.publicBadge : styles.userBadge}>
                    {parking.source === 'public' ? '공영' : '제보'}
                </li>
                <li>{parking.isFree ? '무료' : '유료'}</li>
                <li>{parking.hasRoof ? '지붕 있음' : '지붕 없음'}</li>
            </ul>
            <ul aria-label={"운영 시간"} className={styles.hours}>
                <li>{parking.operatingHours ?? '운영시간 모름'}</li>
            </ul>
            <div className={styles.footer}>
                <ul className={styles.likes}>
                    <li className={styles.likeCount}>개추{parking.likeCount}</li>
                    <li className={styles.dislikeCount}>비추{parking.dislikeCount}</li>
                </ul>
                <span className={styles.lastVerifiedAt}>
                    {parking.lastVerifiedAt ?? '최근 확인 정보 없음'}
                </span>
            </div>
        </article>
    )
}
