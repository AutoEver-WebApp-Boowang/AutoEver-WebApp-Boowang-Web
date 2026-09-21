import {useCallback, useEffect, useRef, useState} from 'react'
import {CustomOverlayMap, Map, MapMarker, useKakaoLoader} from 'react-kakao-maps-sdk'
import styles from './ParkingMap.module.css'
import type {ParkingCardData} from "@/entities/parking";
import {CurrentLocationButton, type CurrentPosition} from "@/features/current-location";

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
    showSearchBoundsButton: boolean

    currentPosition: CurrentPosition | null
    currentLocationError: string | null
    isLocating: boolean
    onCurrentLocationRequest: () => void
}


export function ParkingMap({
                               parkingList,
                               favoriteParkingIds,
                               selectedParkingId,
                               onParkingSelect,

                               currentPosition,
                               currentLocationError,
                               isLocating,
                               onCurrentLocationRequest,

                               focusPosition,
                               onFocusApplied,
                               searchedPlace,
                               onSearchBounds,
                               isSearchingBounds,
                               showSearchBoundsButton,
                           }: ParkingMapProps) {
    const mapRef = useRef<kakao.maps.Map | null>(null)
    const focusStage = useRef<FocusStage>(null)
    const hasSearchedInitialBounds = useRef(false)
    const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY
    const [loading, error] = useKakaoLoader({
        appkey: appKey,
        libraries: ['services'],
    })

    const [shouldMoveToCurrentPosition, setShouldMoveToCurrentPosition,] = useState(false)

    const searchCurrentBounds = useCallback((
        map: kakao.maps.Map,
        preserveSelection = false,
    ) => {
        hasSearchedInitialBounds.current = true

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

    useEffect(() => {
        if (!shouldMoveToCurrentPosition) return
        if (!currentPosition) return
        if (!mapRef.current || !window.kakao?.maps) return

        mapRef.current.setCenter(
            new window.kakao.maps.LatLng(
                currentPosition.latitude,
                currentPosition.longitude,
            ),
        )

        setShouldMoveToCurrentPosition(false)
    }, [
        currentPosition,
        shouldMoveToCurrentPosition,
    ])

    useEffect(() => {
        if (!currentLocationError) return

        setShouldMoveToCurrentPosition(false)
    }, [currentLocationError])

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

    const handleCurrentLocationClick = () => {
        onCurrentLocationRequest()

        if (!currentPosition) {
            setShouldMoveToCurrentPosition(true)
            return
        }

        if (!mapRef.current || !window.kakao?.maps) {
            return
        }

        mapRef.current.setCenter(
            new window.kakao.maps.LatLng(
                currentPosition.latitude,
                currentPosition.longitude,
            ),
        )
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
                onTileLoaded={(map) => {
                    if (hasSearchedInitialBounds.current) return
                    if (focusStage.current !== null) return

                    searchCurrentBounds(map)
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

                    if (focusStage.current === 'zooming') {
                        if (map.getLevel() !== SEARCH_RESULT_MAP_LEVEL) return

                        focusStage.current = null
                        searchCurrentBounds(map, true)
                        return
                    }

                    if (!hasSearchedInitialBounds.current) {
                        searchCurrentBounds(map)
                    }
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
                    const markerSize = {width: 30, height: 38}

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

                {currentPosition && (
                    <CustomOverlayMap
                        position={{
                            lat: currentPosition.latitude,
                            lng: currentPosition.longitude,
                        }}
                        xAnchor={0.5}
                        yAnchor={0.5}
                    >
                    <span
                        className={styles.currentLocationMarker}
                        aria-label={`현재 위치, 오차 약 ${Math.round(
                            currentPosition.accuracy,
                        )}미터`}
                    />
                    </CustomOverlayMap>
                )}
            </Map>

            <div className={styles.currentLocationControl}>
                <CurrentLocationButton
                    isLocating={isLocating}
                    onClick={handleCurrentLocationClick}
                />

                {currentLocationError && (
                    <p
                        className={styles.locationError}
                        role="status"
                    >
                        {currentLocationError}
                    </p>
                )}
            </div>

            {showSearchBoundsButton && (
                <button
                    type="button"
                    className={styles.searchBoundsButton}
                    onClick={handleSearchCurrentBounds}
                    disabled={isSearchingBounds}
                    aria-busy={isSearchingBounds}
                >
                    <img
                        className={styles.searchBoundsIcon}
                        src="/icons/refresh-map.svg"
                        alt=""
                        aria-hidden="true"
                    />
                    {isSearchingBounds ? '검색 중...' : '현재 위치에서 다시 검색'}
                </button>
            )}
        </div>
    )
}
