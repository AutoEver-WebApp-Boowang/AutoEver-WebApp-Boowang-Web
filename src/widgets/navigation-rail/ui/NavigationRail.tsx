import styles from './NavigationRail.module.css'

export type NavigationMenu = 'parking' | 'favorites' | 'myPage'

type NavigationRailProps = {
    activeMenu: NavigationMenu
    onMenuChange: (menu: NavigationMenu) => void
}
// 메뉴 타입 정의 및 props 선언 ParkingMapPage에서 handler 선언

export function NavigationRail(
    {
        activeMenu,
        onMenuChange,
    }: NavigationRailProps) {
    return (
        <nav
            className={styles.navigationRail}
            aria-label="주요 메뉴"
        >
            <div className={styles.logoArea}>
                <img
                    className={styles.logo}
                    src="/images/boowang-logo.png"
                    alt="부우왕"
                />
            </div>

            <ul className={styles.menuList}>
                <li className={styles.menuItem}>
                    <button
                        type="button"
                        aria-pressed={activeMenu === 'parking'}
                        onClick={() =>  onMenuChange('parking')} // 선택된 페이지에 대한 타입 전달
                        className={styles.menuButton}
                    >
                        <span className={styles.iconFrame}>
                            <span
                                className={`${styles.menuIcon} ${styles.mapIcon}`}
                                aria-hidden="true"
                            />
                        </span>
                        <span className={styles.menuLabel}>지도 홈</span>
                    </button>
                </li>
                <li className={styles.menuItem}>
                    <button
                        type="button"
                        aria-pressed={activeMenu === 'favorites'}
                        onClick={() => onMenuChange('favorites')}
                        className={styles.menuButton}
                    >
                        <span className={styles.iconFrame}>
                            <span
                                className={`${styles.menuIcon} ${styles.favoriteIcon}`}
                                aria-hidden="true"
                            />
                        </span>
                        <span className={styles.menuLabel}>즐겨찾기</span>
                    </button>
                </li>
                <li className={styles.menuItem}>
                    <button
                        type="button"
                        aria-pressed={activeMenu === 'myPage'}
                        onClick={() => onMenuChange('myPage')}
                        className={styles.menuButton}
                    >
                        <span className={styles.iconFrame}>
                            <span
                                className={`${styles.menuIcon} ${styles.userIcon}`}
                                aria-hidden="true"
                            />
                        </span>
                        <span className={styles.menuLabel}>마이페이지</span>
                    </button>
                </li>
            </ul>
        </nav>
    )
}
