import {env} from '@/shared/config'
import {getMyProfileApi} from './userApi'
import {getMyProfileMockApi} from './userMockApi'
import type {UserProfile} from '../model/types'

export function getMyProfile(accessToken: string, tokenType: string): Promise<UserProfile> {
    if (env.apiMode === 'mock') {
        return getMyProfileMockApi()
    }
    return getMyProfileApi(accessToken, tokenType)
}
