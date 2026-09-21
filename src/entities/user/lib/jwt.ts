// 액세스 토큰(JWT)의 payload에서 sub(사용자 id) 클레임을 꺼내는 함수
export function decodeAccessTokenUserId(accessToken: string): number | null {
    try {
        const payloadBase64 = accessToken.split('.')[1]
        const payloadJson = JSON.parse(
            atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')),
        )
        const userId = Number(payloadJson.sub)

        return Number.isNaN(userId) ? null : userId
    } catch {
        return null
    }
}
