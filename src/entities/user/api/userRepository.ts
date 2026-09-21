import {env} from '@/shared/config'
import {getMyProfileApi, updateMyProfileApi, withdrawApi} from './userApi'
import {getMyProfileMockApi, updateMyProfileMockApi, withdrawMockApi} from './userMockApi'
import type {UserProfile} from '../model/types'
import type {UserUpdateRequest} from './types'

export function getMyProfile(accessToken: string, tokenType: string): Promise<UserProfile> {
    if (env.apiMode === 'mock') {
        return getMyProfileMockApi()
    }
    return getMyProfileApi(accessToken, tokenType)
}

export function withdraw(accessToken: string, tokenType: string): Promise<void> {
    if (env.apiMode === 'mock') {
        return withdrawMockApi()
    }
    return withdrawApi(accessToken, tokenType)
}

export function updateMyProfile(
    payload: UserUpdateRequest,
    accessToken: string,
    tokenType: string,
): Promise<UserProfile> {
    if (env.apiMode === 'mock') {
        return updateMyProfileMockApi(payload)
    }
    return updateMyProfileApi(payload, accessToken, tokenType)
}
