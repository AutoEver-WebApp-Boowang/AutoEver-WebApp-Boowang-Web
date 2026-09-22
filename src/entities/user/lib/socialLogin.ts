import {env} from '@/shared/config'

export type SocialLoginProvider = 'kakao' | 'hyundai'

export function redirectToSocialLogin(provider: SocialLoginProvider) {
    window.location.assign(`${env.apiBaseUrl}/oauth2/authorization/${provider}`)
}
