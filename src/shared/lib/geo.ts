type Coordinates = {
    latitude: number
    longitude: number
}

const EARTH_RADIUS_METERS = 6_371_000

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
}

export function calculateDistanceMeters(
    from: Coordinates,
    to: Coordinates,
): number {
    const deltaLat = toRadians(to.latitude - from.latitude)
    const deltaLng = toRadians(to.longitude - from.longitude)

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(toRadians(from.latitude)) *
        Math.cos(toRadians(to.latitude)) *
        Math.sin(deltaLng / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(EARTH_RADIUS_METERS * c)
}

export function formatDistanceMeters(distanceMeters: number): string {
    if (distanceMeters < 1000) return `${distanceMeters}m`

    const km = distanceMeters / 1000
    return `${km.toFixed(1)}km`
}
