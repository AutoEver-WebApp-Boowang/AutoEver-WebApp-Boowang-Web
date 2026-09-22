import {useEffect} from 'react'
import {setCredentials, setSocialLoginFailed} from '@/entities/user'
import {decodeAccessTokenUserId} from '@/entities/user/lib/jwt'
import {refreshAccessToken} from '@/entities/user/api/authRepository'
import {getMyProfile} from '@/entities/user/api/userRepository'
import {useAppDispatch} from '@/app/providers/store/hooks.ts'

// 카카오/현대차 로그인 성공 후 백엔드가 ?socialLogin=success 로 리다이렉트해주면,
// 그걸 신호로 POST /api/v1/auth/refresh를 호출해서(쿠키의 refreshToken 사용)
// 액세스 토큰을 발급받아 메모리(Redux)에 저장하는 훅.
export function useSocialLoginCallback() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const isSocialLoginSuccess = params.get('socialLogin') === 'success'

        if (!isSocialLoginSuccess) return

        refreshAccessToken().then(async (tokens) => {
            const userId = decodeAccessTokenUserId(tokens.accessToken)
            const profile = await getMyProfile(tokens.accessToken, tokens.tokenType)

            dispatch(setCredentials({
                user: {
                    id: userId ?? 0,
                    nickname: profile.nickname,
                },
                accessToken: tokens.accessToken,
                tokenType: tokens.tokenType,
                expiresIn: tokens.expiresIn,
            }))
        }).catch(() => {
            // 서드파티 쿠키 차단 등으로 refreshToken 쿠키를 못 읽어오면 여기서 조용히 실패했었음.
            // 재시도 UI(SocialLoginRetryBanner)를 띄우기 위한 플래그만 세워둔다.
            dispatch(setSocialLoginFailed(true))
        })

        // URL에 소셜 로그인 처리 쿼리가 남아있지 않도록 정리
        window.history.replaceState(null, '', window.location.pathname)
    }, [dispatch])
}
