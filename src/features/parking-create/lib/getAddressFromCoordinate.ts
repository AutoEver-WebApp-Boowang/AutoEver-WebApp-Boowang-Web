type Coordinate = {
    latitude: number
    longitude: number
}

export function getAddressFromCoordinate({
                                             latitude,
                                             longitude,
                                         }: Coordinate): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!window.kakao?.maps?.services) {
            reject(
                new Error('카카오 주소 서비스를 사용할 수 없습니다.'),
            )
            return
        }

        const geocoder =
            new window.kakao.maps.services.Geocoder()

        geocoder.coord2Address(
            longitude,
            latitude,
            (result, status) => {
                if (
                    status !==
                    window.kakao.maps.services.Status.OK
                ) {
                    reject(
                        new Error('주소를 찾을 수 없습니다.'),
                    )
                    return
                }

                const addressResult = result[0]

                const address =
                    addressResult.road_address?.address_name ??
                    addressResult.address?.address_name

                if (!address) {
                    reject(
                        new Error('주소를 확인할 수 없는 위치입니다.'),
                    )
                    return
                }

                resolve(address)
            },
        )
    })
}