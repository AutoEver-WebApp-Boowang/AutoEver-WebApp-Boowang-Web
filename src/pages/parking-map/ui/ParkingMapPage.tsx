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
        queryFn: ({signal}) => getFavoriteParkingList(signal),
        retry: false,
    })

    const parkingList = parkingListQuery.data ?? []
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

    const handleParkingSelect = (parking: ParkingCardData) => {
        if (selectedParkingId === parking.id) {
            setSelectedParkingId(null)
            return
        }

        setSelectedParkingId(parking.id)
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
                        parkingList={parkingList}
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
                        parkingList={favoriteParkingQuery.data ?? []}
                        selectedParkingId={selectedParkingId}
                        isLoading={favoriteParkingQuery.isFetching}
                        errorMessage={favoriteParkingQuery.error instanceof Error
                            ? favoriteParkingQuery.error.message
                            : null}
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
                            onClose={() => setSelectedParkingId(null)}
                        />
                    </div>
                )}
            </aside>

            <section
                className={styles.mapSection}
                aria-label="주차장 지도"
            >
                <ParkingMap
                    parkingList={parkingList}
                    favoriteParkingIds={favoriteParkingIds}
                    selectedParkingId={selectedParkingId}
                    onParkingSelect={handleParkingSelect}

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
                />
            </section>
        </main>
    )
}
