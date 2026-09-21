import {env} from "@/shared/config";
import type {ApiResponse} from "@/shared/api";

export type AccessTokenResponse = {
    accessToken: string
    tokenType: string
    expiresIn: number
}

export type MeResponse = {
    userId: number
}

export async function loginTestApi(): Promise<AccessTokenResponse> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/test-auth/login`,
        {method: 'POST'}
    )

    if (!response.ok) {
        throw new Error(`임시 로그인 실패: ${response.status}`)
    }

    const result: ApiResponse<AccessTokenResponse> = await response.json()
    return result.data
}

export async function getMeApi(
    accessToken: string,
    tokenType: string,
): Promise<MeResponse> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/test-auth/me`,
        {
            method: 'GET',
            headers: {
                Authorization: `${tokenType} ${accessToken}`,
            }
        }
    )

    if (!response.ok) {
        throw new Error(`유저 정보 조회 실패: ${response.status}`)
    }

    const result: ApiResponse<MeResponse> = await response.json()
    return result.data
}

export async function refreshAccessTokenApi(): Promise<AccessTokenResponse> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/v1/auth/refresh`,
        {
            method: 'POST',
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(`토큰 재발급 실패: ${response.status}`)
    }

    const result: ApiResponse<AccessTokenResponse> = await response.json()
    return result.data
}

export async function logoutApi(): Promise<void> {
    const response = await fetch(
        `${env.apiBaseUrl}/api/v1/auth/logout`,
        {
            method: 'POST',
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(`로그아웃 실패: ${response.status}`)
    }
}
