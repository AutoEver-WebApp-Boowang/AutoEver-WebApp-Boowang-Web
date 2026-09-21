export type TrustLevelResponse = {
    code: string
    displayName: string
}

export type UserProfileResponse = {
    nickname: string
    phone: string
    trustScore: number
    trustLevel: TrustLevelResponse
}
