import {createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type {AuthUser} from './types'

type AuthState = {
    user: AuthUser | null
    isAuthenticated: boolean
    isAuthChecking: boolean
    accessToken: string | null
    tokenType: string | null
    expiresIn: number | null
    // 소셜 로그인 콜백 이후 토큰 재발급(refresh)이 실패했을 때(예: 서드파티 쿠키 차단) true.
    // 사용자에게 재시도 UI를 보여주는 용도.
    socialLoginFailed: boolean
}

type SetCredentialsPayload = {
    user: AuthUser
    accessToken: string
    tokenType: string
    expiresIn: number
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isAuthChecking: false,
    accessToken: null,
    tokenType: null,
    expiresIn: null,
    socialLoginFailed: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthChecking: (state, action: PayloadAction<boolean>) => {
            state.isAuthChecking = action.payload
        },
        setSocialLoginFailed: (state, action: PayloadAction<boolean>) => {
            state.socialLoginFailed = action.payload
        },
        setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
            state.user = action.payload.user
            state.accessToken = action.payload.accessToken
            state.tokenType = action.payload.tokenType
            state.expiresIn = action.payload.expiresIn
            state.isAuthenticated = true
            state.isAuthChecking = false
            state.socialLoginFailed = false
        },
        clearAuth: (state) => {
            state.user = null
            state.accessToken = null
            state.tokenType = null
            state.expiresIn = null
            state.isAuthenticated = false
            state.isAuthChecking = false
        },
    },
})

export const {clearAuth, setAuthChecking, setCredentials, setSocialLoginFailed} = authSlice.actions
export const authReducer = authSlice.reducer
