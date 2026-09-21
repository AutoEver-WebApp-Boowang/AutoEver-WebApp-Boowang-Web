import {env} from '@/shared/config'
import {getMyProfileApi, withdrawApi} from './userApi'
import {getMyProfileMockApi, withdrawMockApi} from './userMockApi'
import type {UserProfile} from '../model/types'

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
