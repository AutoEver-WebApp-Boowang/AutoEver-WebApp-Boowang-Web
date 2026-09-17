// 현재 위치 커스텀 훅
import {useCallback, useEffect, useRef, useState} from "react";
import type {CurrentPosition} from "@/features/current-location/model/types.ts";

type LocationStatus =
    | 'idle' | 'loading' | 'watching' | 'error'

const getLocationErrorMessage = (
    error: GeolocationPositionError,
)=> {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return '위치 권한이 거부되었습니다.'
        case error.POSITION_UNAVAILABLE:
            return '현재 위치를 확인할 수 없습니다.'
        case error.TIMEOUT:
            return '위치 조회 시간이 초과되었습니다.'
        default:
            return '현재 위치를 불러오지 못했습니다.'
    }
}

export function useCurrentLocation() {
    const watchIdRef = useRef<number | null>(null)

    const [position, setPosition] = useState<CurrentPosition | null>(null)

    const [status, setStatus] = useState<LocationStatus>('idle')

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const stopWatching = useCallback(() => {
        if (watchIdRef.current === null) return

        navigator.geolocation.clearWatch(
            watchIdRef.current,
        )

        watchIdRef.current = null
        setStatus('idle')
    }, [])

    const startWatching = useCallback(() => {
        if (watchIdRef.current !== null) return

        if (!navigator.geolocation) {
            setStatus('error')
            setErrorMessage(
                '이 브라우저에서는 위치 기능을 지원하지 않습니다.',
            )
            return
        }

        setStatus('loading')
        setErrorMessage(null)

        watchIdRef.current =
            navigator.geolocation.watchPosition(
                (geolocationPosition) => {
                    const {coords} = geolocationPosition

                    setPosition({
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        accuracy: coords.accuracy,
                    })

                    setStatus('watching')
                    setErrorMessage(null)
                },
                (error) => {
                    if (watchIdRef.current !== null) {
                        navigator.geolocation.clearWatch(
                            watchIdRef.current,
                        )
                    }

                    watchIdRef.current = null
                    setStatus('error')
                    setErrorMessage(
                        getLocationErrorMessage(error),
                    )
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10_000,
                    maximumAge: 30_000,
                },
            )
    }, [])

    useEffect(() => {
        return stopWatching
    }, [stopWatching]);

    return {
        position,
        errorMessage,
        isLocating: status === 'loading',
        isWatching: status === 'watching',
        startWatching,
        stopWatching
    }
}