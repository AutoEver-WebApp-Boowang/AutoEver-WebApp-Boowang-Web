export type AuthUser = {
    id: number
    nickname: string | null
}

export type TrustLevel = {
    code: string
    displayName: string
}

export type UserProfile = {
    nickname: string
    phone: string
    trustScore: number
    trustLevel: TrustLevel
}
