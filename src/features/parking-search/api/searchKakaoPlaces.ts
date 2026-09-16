export type KakaoPlaceSearchResult = {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
}

export function searchKakaoPlaces(keyword: string): Promise<KakaoPlaceSearchResult[]> {
    return new Promise((resolve, reject) => {
        if (!window.kakao?.maps?.services) {
            reject(new Error('카카오 장소 검색을 사용할 수 없습니다.'))
            return
        }

        const placesService = new window.kakao.maps.services.Places()

        placesService.keywordSearch(keyword, (places, status) => {
            if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                resolve([])
                return
            }

            if (status !== window.kakao.maps.services.Status.OK) {
                reject(new Error('카카오 장소 검색에 실패했습니다.'))
                return
            }

            const results = places
                .slice(0, 5)
                .map((place) => ({
                    id: place.id,
                    name: place.place_name,
                    address: place.road_address_name || place.address_name,
                    latitude: Number(place.y),
                    longitude: Number(place.x),
                }))

            resolve(results)
        })
    })
}
