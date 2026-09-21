import {useCallback, useMemo, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {type NavigationMenu, NavigationRail} from '@/widgets/navigation-rail'
import {ParkingListPanel} from '@/widgets/parking-list'
import {FavoriteListPanel} from '@/widgets/favorite-list'
import {MyPagePanel} from '@/widgets/my-page-panel'
import {
    getFavoriteParkingList,
    getParkingListByBounds,
    searchRegisteredParking,
    type ParkingCardData,
} from '@/entities/parking'
import {ParkingDetailPanel} from '@/widgets/parking-detail'
import {ParkingMap, type MapBounds} from '@/widgets/parking-map'
import {searchKakaoPlaces, type KakaoPlaceSearchResult} from '@/features/parking-search'
import styles from './ParkingMapPage.module.css'
import {useCurrentLocation} from "@/features/current-location";
import {useAppSelector} from "@/app/providers/store/hooks.ts";
import {calculateDistanceMeters} from "@/shared/lib/geo.ts";

type MapPosition = {
    lat: number
    lng: number
}

type BoundsSearchState = {
    bounds: MapBounds
    requestId: number
}

export function ParkingMapPage() {
    const [activeMenu, setActiveMenu] = useState<NavigationMenu>('parking')
    const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null)
    const [mapFocusPosition, setMapFocusPosition] = useState<MapPosition | null>(null)
    const [selectedKakaoPlace, setSelectedKakaoPlace] = useState<KakaoPlaceSearchResult | null>(null)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [boundsSearch, setBoundsSearch] = useState<BoundsSearchState | null>(null)

    const accessToken = useAppSelector((state) => state.auth.accessToken)
    const tokenType = useAppSelector((state) => state.auth.tokenType)
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const {
        position: currentPosition,
        errorMessage: currentLocationError,
        isLocating,
        startWatching,
    } = useCurrentLocation()

    const parkingListQuery = useQuery({
        queryKey: [
            'parking',
            'list',
            boundsSearch?.bounds ?? null,
            boundsSearch?.requestId ?? 0,
        ],
        queryFn: ({signal}) => {
            if (!boundsSearch) return Promise.resolve([])

            return getParkingListByBounds(boundsSearch.bounds, signal)
        },
        enabled: boundsSearch !== null,
        retry: false,
    })

    const kakaoSearchQuery = useQuery({
        queryKey: ['parking', 'search', 'kakao', searchKeyword],
        queryFn: () => searchKakaoPlaces(searchKeyword),
        enabled: searchKeyword.length > 0,
        retry: false,
        staleTime: 60_000,
    })

    const registeredSearchQuery = useQuery({
        queryKey: ['parking', 'search', 'registered', searchKeyword],
        queryFn: ({signal}) => searchRegisteredParking(searchKeyword, signal),
        enabled: searchKeyword.length > 0,
        retry: false,
        staleTime: 60_000,
    })

    const favoriteParkingQuery = useQuery({
        queryKey: ['parking', 'favorites'],
        queryFn: ({signal}) => getFavoriteParkingList(accessToken!, tokenType!, signal),
        enabled: accessToken !== null,
        retry: false,
    })

    const parkingList = parkingListQuery.data ?? []
    const mapMarkerList = useMemo(() => {
        // 즐겨찾기 탭에서는 범위 검색 결과 없이 즐겨찾기된 마커만 보여줌
        if (activeMenu === 'favorites') {
            return favoriteParkingQuery.data ?? []
        }

        const merged = new Map<number, ParkingCardData>()

        for (const parking of parkingList) {
            merged.set(parking.id, parking)
        }
        for (const parking of favoriteParkingQuery.data ?? []) {
            merged.set(parking.id, parking)
        }

        return Array.from(merged.values())
    }, [activeMenu, parkingList, favoriteParkingQuery.data])
    const favoriteParkingIds = useMemo(
        () => new Set(
            (favoriteParkingQuery.data ?? []).map((parking) => parking.id),
        ),
        [favoriteParkingQuery.data],
    )
    const errorMessage = parkingListQuery.error instanceof Error
        ? parkingListQuery.error.message
        : null

    const handleMenuChange = (menu: NavigationMenu) => {
        setActiveMenu(menu)
        setSelectedParkingId(null)
    }

    const handleRequireLogin = () => {
        handleMenuChange('myPage')
    }

    const handleParkingSelect = (parking: ParkingCardData) => {
        if (selectedParkingId === parking.id) {
            setSelectedParkingId(null)
            return
        }

        setSelectedParkingId(parking.id)
    }

    // 지도 마커 클릭 전용: 마이페이지(로그인 화면)에 있다가 마커를 눌렀을 때만
    // 지도 리스트 탭으로 돌아오도록 처리. 즐겨찾기 탭에서는 그대로 유지.
    const handleMapMarkerSelect = (parking: ParkingCardData) => {
        if (activeMenu === 'myPage') {
            setActiveMenu('parking')
        }
        handleParkingSelect(parking)
    }

    const handleParkingSearch = useCallback((keyword: string) => {
        setSearchKeyword(keyword)
    }, [])

    const handleSearchResultSelect = (parking: ParkingCardData) => {
        setSelectedParkingId(parking.id)
        setSelectedKakaoPlace(null)
        setMapFocusPosition({
            lat: parking.latitude,
            lng: parking.longitude,
        })
    }

    const handleKakaoResultSelect = (place: KakaoPlaceSearchResult) => {
        setSelectedParkingId(null)
        setSelectedKakaoPlace(place)
        setMapFocusPosition({
            lat: place.latitude,
            lng: place.longitude,
        })
    }

    const handleSearchBounds = useCallback((
        bounds: MapBounds,
        preserveSelection = false,
    ) => {
        setActiveMenu((currentMenu) => currentMenu === 'myPage' ? 'parking' : currentMenu)

        if (!preserveSelection) {
            setSelectedParkingId(null)
            setSelectedKakaoPlace(null)
        }

        setBoundsSearch((currentSearch) => ({
            bounds,
            requestId: (currentSearch?.requestId ?? 0) + 1,
        }))
    }, [])

    const handleMapFocusApplied = useCallback(() => {
        setMapFocusPosition(null)
    }, [])

    const renderSidePanel = (menu: NavigationMenu) => {
        switch (menu) {
            case 'parking':
                return (
                    <ParkingListPanel
                        parkingList={parkingListWithDistance}
                        isLoading={boundsSearch === null || parkingListQuery.isFetching}
                        errorMessage={errorMessage}
                        selectedParking={selectedParkingId}
                        onParkingSelect={handleParkingSelect}
                        onSearch={handleParkingSearch}
                        searchResults={registeredSearchQuery.data ?? []}
                        onSearchResultSelect={handleSearchResultSelect}
                        kakaoSearchResults={kakaoSearchQuery.data ?? []}
                        onKakaoResultSelect={handleKakaoResultSelect}
                        isKakaoSearching={kakaoSearchQuery.isFetching}
                        kakaoSearchError={kakaoSearchQuery.error instanceof Error
                            ? kakaoSearchQuery.error.message
                            : null}
                        isRegisteredSearching={registeredSearchQuery.isFetching}
                        registeredSearchError={registeredSearchQuery.error instanceof Error
                            ? registeredSearchQuery.error.message
                            : null}
                    />
                )

            case 'favorites':
                return (
                    <FavoriteListPanel
                        parkingList={favoriteListWithDistance}
                        selectedParkingId={selectedParkingId}
                        isLoading={favoriteParkingQuery.isFetching}
                        errorMessage={favoriteParkingQuery.error instanceof Error
                            ? favoriteParkingQuery.error.message
                            : null}
                        isAuthenticated={isAuthenticated}
                        onParkingSelect={handleParkingSelect}
                        onExplore={() => handleMenuChange('parking')}
                    />
                )

            case 'myPage':
                return <MyPagePanel/>

            default:
                return null
        }
    }

    const distanceOrigin = selectedKakaoPlace ?? currentPosition

    const parkingListWithDistance = useMemo(() => {
        if (!distanceOrigin) return parkingList

        return parkingList.map((parking) => ({
            ...parking,
            distanceMeters: calculateDistanceMeters(distanceOrigin, parking),
        }))
    }, [parkingList, distanceOrigin])

    const favoriteListWithDistance = useMemo(() => {
        const favorites = favoriteParkingQuery.data ?? []
        if (!distanceOrigin) return favorites

        return favorites.map((parking) => ({
            ...parking,
            distanceMeters: calculateDistanceMeters(distanceOrigin, parking),
        }))
    }, [favoriteParkingQuery.data, distanceOrigin])

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
                        <ParkingDetailPanel
                            key={selectedParkingId}
                            parkingId={selectedParkingId}
                            favoriteParkingIds={favoriteParkingIds}
                            onClose={() => setSelectedParkingId(null)}
                            onRequireLogin={handleRequireLogin}
                        />
                    </div>
                )}
            </aside>

            <section
                className={styles.mapSection}
                aria-label="주차장 지도"
            >
                <ParkingMap
                    parkingList={mapMarkerList}
                    favoriteParkingIds={favoriteParkingIds}
                    selectedParkingId={selectedParkingId}
                    onParkingSelect={handleMapMarkerSelect}

                    currentPosition={currentPosition}
                    currentLocationError={currentLocationError}
                    isLocating={isLocating}
                    onCurrentLocationRequest={startWatching}

                    focusPosition={mapFocusPosition}
                    onFocusApplied={handleMapFocusApplied}
                    searchedPlace={selectedKakaoPlace
                        ? {
                            name: selectedKakaoPlace.name,
                            lat: selectedKakaoPlace.latitude,
                            lng: selectedKakaoPlace.longitude,
                        }
                        : null}
                    onSearchBounds={handleSearchBounds}
                    isSearchingBounds={parkingListQuery.isFetching}
                    showSearchBoundsButton={activeMenu !== 'favorites'}
                />
            </section>
        </main>
    )
}
