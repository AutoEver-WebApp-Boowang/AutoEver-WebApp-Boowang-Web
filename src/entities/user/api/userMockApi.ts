import type {UserProfile} from '../model/types'

export async function getMyProfileMockApi(): Promise<UserProfile> {
    return {
        nickname: '테스트유저',
        phone: '01012345678',
        trustScore: 82,
        trustLevel: {
            code: 'TRUSTED',
            displayName: '신뢰 라이더',
        },
    }
}
