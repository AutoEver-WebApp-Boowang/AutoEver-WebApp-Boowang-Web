import {env} from '@/shared/config'
import {loginTestApi, getMeApi, refreshAccessTokenApi} from './authApi'
import {loginMockApi, getMockMeApi, refreshAccessTokenMockApi} from './authMockApi'
import type {AccessTokenResponse, MeResponse} from './authApi'

export function loginTest(): Promise<AccessTokenResponse> {
    if (env.apiMode === 'mock') {
        return loginMockApi()
    }
    return loginTestApi()
}

export function getMe(accessToken: string, tokenType: string): Promise<MeResponse> {
    if (env.apiMode === 'mock') {
        return getMockMeApi()
    }
    return getMeApi(accessToken, tokenType)
}

export function refreshAccessToken(): Promise<AccessTokenResponse> {
    if (env.apiMode === 'mock') {
        return refreshAccessTokenMockApi()
    }
    return refreshAccessTokenApi()
}
