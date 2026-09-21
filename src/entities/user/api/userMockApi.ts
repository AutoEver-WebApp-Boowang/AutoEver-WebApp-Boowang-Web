import type {UserProfile} from '../model/types'
import type {UserUpdateRequest} from './types'

const mockUserProfile: UserProfile = {
    nickname: '테스트유저',
    phone: '01012345678',
    trustScore: 82,
    trustLevel: {
        code: 'TRUSTED',
        displayName: '신뢰 라이더',
    },
}

export async function getMyProfileMockApi(): Promise<UserProfile> {
    return mockUserProfile
}

export async function updateMyProfileMockApi(
    payload: UserUpdateRequest,
): Promise<UserProfile> {
    if (payload.nickname) mockUserProfile.nickname = payload.nickname
    if (payload.phone) mockUserProfile.phone = payload.phone

    return mockUserProfile
}

export async function withdrawMockApi(): Promise<void> {
    return
}
