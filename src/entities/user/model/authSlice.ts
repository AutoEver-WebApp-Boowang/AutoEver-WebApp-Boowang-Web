import {createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type {AuthUser} from './types'

type AuthState = {
    user: AuthUser | null
    isAuthenticated: boolean
    isAuthChecking: boolean
    accessToken: string | null
    tokenType: string | null
    expiresIn: number | null
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
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthChecking: (state, action: PayloadAction<boolean>) => {
            state.isAuthChecking = action.payload
        },
        setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
            state.user = action.payload.user
            state.accessToken = action.payload.accessToken
            state.tokenType = action.payload.tokenType
            state.expiresIn = action.payload.expiresIn
            state.isAuthenticated = true
            state.isAuthChecking = false

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

export const {clearAuth, setAuthChecking, setCredentials} = authSlice.actions
export const authReducer = authSlice.reducer
