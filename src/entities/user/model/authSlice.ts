import {createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type {AuthUser} from './types'

type AuthState = {
    user: AuthUser | null
    isAuthenticated: boolean
    isAuthChecking: boolean
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isAuthChecking: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthChecking: (state, action: PayloadAction<boolean>) => {
            state.isAuthChecking = action.payload
        },
        setCredentials: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload
            state.isAuthenticated = true
            state.isAuthChecking = false
        },
        clearAuth: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.isAuthChecking = false
        },
    },
})

export const {clearAuth, setAuthChecking, setCredentials} = authSlice.actions
export const authReducer = authSlice.reducer
