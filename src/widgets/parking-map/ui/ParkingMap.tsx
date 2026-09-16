import {useCallback, useEffect, useRef} from 'react'
import {Map, MapMarker, useKakaoLoader} from 'react-kakao-maps-sdk'
import styles from './ParkingMap.module.css'
import type {ParkingCardData} from "@/entities/parking";

const DEFAULT_CENTER = {
    lat: 37.5665,
    lng: 126.9780,
}

const SEARCH_RESULT_MAP_LEVEL = 4

type FocusStage = 'moving' | 'zooming' | null

export type MapBounds = {
    southWestLatitude: number
    southWestLongitude: number
    northEastLatitude: number
    northEastLongitude: number
}

type ParkingMapProps = {
    parkingList: ParkingCardData[]
    favoriteParkingIds: Set<number>
    selectedParkingId: number | null
    onParkingSelect: (parking: ParkingCardData) => void
    focusPosition: {
        lat: number
        lng: number
    } | null
    onFocusApplied: () => void
    searchedPlace: {
        name: string
        lat: number
        lng: number
    } | null
    onSearchBounds: (
        bounds: MapBounds,
        preserveSelection?: boolean,
    ) => void
    isSearchingBounds: boolean
}


export function ParkingMap({
                               parkingList,
                               favoriteParkingIds,
                               selectedParkingId,
                               onParkingSelect,
                               focusPosition,
                               onFocusApplied,
                               searchedPlace,
                               onSearchBounds,
                               isSearchingBounds,
                           }: ParkingMapProps) {
    const mapRef = useRef<kakao.maps.Map | null>(null)
    const focusStage = useRef<FocusStage>(null)
    const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY
    const [loading, error] = useKakaoLoader({
        appkey: appKey,
        libraries: ['services'],
    })

    const searchCurrentBounds = useCallback((
        map: kakao.maps.Map,
        preserveSelection = false,
    ) => {
        const bounds = map.getBounds()
        const southWest = bounds.getSouthWest()
        const northEast = bounds.getNorthEast()

        onSearchBounds({
            southWestLatitude: southWest.getLat(),
            southWestLongitude: southWest.getLng(),
            northEastLatitude: northEast.getLat(),
            northEastLongitude: northEast.getLng(),
        }, preserveSelection)
    }, [onSearchBounds])

    useEffect(() => {
        if (!mapRef.current || !focusPosition || !window.kakao?.maps) return

        const map = mapRef.current
        const currentCenter = map.getCenter()
        const isSameCenter =
            Math.abs(currentCenter.getLat() - focusPosition.lat) < 0.000001 &&
            Math.abs(currentCenter.getLng() - focusPosition.lng) < 0.000001

        if (isSameCenter) {
            if (map.getLevel() === SEARCH_RESULT_MAP_LEVEL) {
                searchCurrentBounds(map, true)
            } else {
                focusStage.current = 'zooming'
                map.setLevel(SEARCH_RESULT_MAP_LEVEL)
            }
        } else {
            focusStage.current = 'moving'
            map.setCenter(
                new window.kakao.maps.LatLng(
                    focusPosition.lat,
                    focusPosition.lng,
                ),
            )
        }

        onFocusApplied()
    }, [focusPosition, onFocusApplied, searchCurrentBounds])

    if (!appKey) {
        return <div className={styles.message}>카카오맵 API 키가 없습니다.</div>
    }

    if (loading) {
        return <div className={styles.message}>지도를 불러오는 중입니다.</div>
    }

    if (error) {
        return (
            <div className={styles.message}>
                지도를 불러오지 못했습니다. {error.message}
            </div>
        )
    }

    const handleSearchCurrentBounds = () => {
        if (!mapRef.current) return

        searchCurrentBounds(mapRef.current)
    }

    return (
        <div className={styles.container}>
            <Map
                center={DEFAULT_CENTER}
                level={4}
                className={styles.map}
                onCreate={(map) => {
                    mapRef.current = map
                }}
                onIdle={(map) => {
                    if (focusStage.current === 'moving') {
                        if (map.getLevel() === SEARCH_RESULT_MAP_LEVEL) {
                            focusStage.current = null
                            searchCurrentBounds(map, true)
                            return
                        }

                        focusStage.current = 'zooming'
                        map.setLevel(SEARCH_RESULT_MAP_LEVEL)
                        return
                    }

                    if (focusStage.current !== 'zooming') return
                    if (map.getLevel() !== SEARCH_RESULT_MAP_LEVEL) return

                    focusStage.current = null
                    searchCurrentBounds(map, true)
                }}
            >
                {parkingList.map((parking) => {
                    const isSelected = selectedParkingId === parking.id
                    const isFavorite = favoriteParkingIds.has(parking.id)
                    const markerImageSource = isFavorite
                        ? isSelected
                            ? '/icons/parking-marker-favorite-selected.svg'
                            : '/icons/parking-marker-favorite.svg'
                        : isSelected
                            ? '/icons/parking-marker-selected.svg'
                            : '/icons/parking-marker-default.svg'
                    const markerSize = isFavorite
                        ? {width: 46, height: 50}
                        : {width: 40, height: 48}

                    return (
                        <MapMarker
                            key={parking.id}
                            position={{
                                lat: parking.latitude,
                                lng: parking.longitude,
                            }}
                            image={{
                                src: markerImageSource,
                                size: markerSize,
                                options: {
                                    offset: {
                                        x: markerSize.width / 2,
                                        y: markerSize.height,
                                    },
                                },
                            }}
                            onClick={() => onParkingSelect(parking)}
                        />
                    )
                })}

                {searchedPlace && (
                    <MapMarker
                        position={{
                            lat: searchedPlace.lat,
                            lng: searchedPlace.lng,
                        }}
                        image={{
                            src: '/icons/search-place-flag.svg',
                            size: {
                                width: 42,
                                height: 54,
                            },
                            options: {
                                offset: {
                                    x: 13,
                                    y: 51,
                                },
                            },
                        }}
                        title={searchedPlace.name}
                    />
                )}
            </Map>

            <button
                type="button"
                className={styles.searchBoundsButton}
                onClick={handleSearchCurrentBounds}
                disabled={isSearchingBounds}
                aria-busy={isSearchingBounds}
            >
                {isSearchingBounds ? '검색 중...' : '현재 위치에서 다시 검색'}
            </button>
        </div>
    )
}
