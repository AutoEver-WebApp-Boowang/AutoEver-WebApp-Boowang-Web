import {env} from '@/shared/config'
import {loginTestApi, getMeApi, refreshAccessTokenApi, logoutApi} from './authApi'
import {loginMockApi, getMockMeApi, refreshAccessTokenMockApi, logoutMockApi} from './authMockApi'
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

export function logout(): Promise<void> {
    if (env.apiMode === 'mock') {
        return logoutMockApi()
    }
    return logoutApi()
}
