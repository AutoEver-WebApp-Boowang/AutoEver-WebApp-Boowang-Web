import {env} from '@/shared/config'
import type {ApiResponse} from '@/shared/api'
import type {UserProfileResponse} from './types'
import type {UserProfile} from '../model/types'
import {toUserProfile} from './userMapper'

export async function getMyProfileApi(
    accessToken: string,
    tokenType: string,
): Promise<UserProfile> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/v1/users/me`,
        {
            method: 'GET',
            headers: {
                Authorization: `${tokenType} ${accessToken}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error(`내 프로필 조회 실패: ${response.status}`)
    }

    const result: ApiResponse<UserProfileResponse> = await response.json()
    return toUserProfile(result.data)
}

export async function withdrawApi(
    accessToken: string,
    tokenType: string,
): Promise<void> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/v1/users/me`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `${tokenType} ${accessToken}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error(`회원 탈퇴 실패: ${response.status}`)
    }
}
