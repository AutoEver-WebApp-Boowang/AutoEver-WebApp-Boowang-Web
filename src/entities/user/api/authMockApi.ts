import type {AccessTokenResponse, MeResponse} from './authApi'

export async function loginMockApi(): Promise<AccessTokenResponse> {
    return {
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
    }
}

export async function getMockMeApi(): Promise<MeResponse> {
    return {
        userId: 1,
    }
}

// mock 모드에는 실제 refreshToken 쿠키가 없으니, 항상 "로그인 세션 없음"으로 시뮬레이션
// (그래야 mock 모드에서도 새로고침 시 비로그인 상태로 시작 -> 로그인 버튼 UI를 테스트할 수 있음)
export async function refreshAccessTokenMockApi(): Promise<AccessTokenResponse> {
    throw new Error('로그인된 세션이 없습니다')
}

export async function logoutMockApi(): Promise<void> {
    return
}
