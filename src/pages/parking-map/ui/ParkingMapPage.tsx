import {useState} from "react";
import {type NavigationMenu, NavigationRail} from "@/widgets/navigation-rail";
import {ParkingListPanel} from "@/widgets/parking-list";
import {FavoriteListPanel} from "@/widgets/favorite-list";
import {MyPagePanel} from "@/widgets/my-page-panel";
import styles from './ParkingMapPage.module.css'
import type {ParkingCardData} from "@/entities/parking";
import {ParkingDetailPanel} from "@/widgets/parking-detail";

export function ParkingMapPage() {
    const [activeMenu, setActiveMenu] = useState<NavigationMenu>('parking')
    // 기본 페이지 주차장 리스트 페이지
    const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null)

    const handleMenuChange = (menu: NavigationMenu) => {
        setActiveMenu(menu)
        setSelectedParkingId(null)
    } // NavigationRail에서 전달받은 타입으로 상태 변경 해당 상태에 따라 표시되는 페널 교체

    const handleParkingSelect = (parking: ParkingCardData) => {
        if (selectedParkingId === parking.id) {
            setSelectedParkingId(null)
            return
        }

        setSelectedParkingId(parking.id)
    }

    const renderSidePanel = (menu: NavigationMenu) => {
        switch (menu) {
            case 'parking' :
                return (<ParkingListPanel
                    selectedParking={selectedParkingId}
                    onParkingSelect={handleParkingSelect}
                />)

            case 'favorites' :
                return <FavoriteListPanel/>

            case 'myPage' :
                return <MyPagePanel/>

            default:
                return null
        }

    }
    return (
        <main className={styles.main}>
            <NavigationRail
                activeMenu={activeMenu}
                onMenuChange={handleMenuChange}
            />

            <aside className={styles.sidePanel}>
                {renderSidePanel(activeMenu)}

                {selectedParkingId !== null && (
                    <div className={styles.detailPanel}>
                        <ParkingDetailPanel parkingId={selectedParkingId} onClose={() => setSelectedParkingId(null)}/>
                    </div>
                )}
            </aside>


            <section
                className={styles.mapSection}
                aria-label={"주차장 지도"}
            >
                지도 영역
            </section>
        </main>
    )


}
