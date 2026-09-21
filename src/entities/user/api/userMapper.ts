import type {UserProfileResponse} from './types'
import type {UserProfile} from '../model/types'

export function toUserProfile(response: UserProfileResponse): UserProfile {
    return {
        nickname: response.nickname,
        phone: response.phone,
        trustScore: response.trustScore,
        trustLevel: response.trustLevel,
    }
}
