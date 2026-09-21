import {useEffect} from 'react'
import {setAuthChecking, setCredentials} from '@/entities/user'
import {decodeAccessTokenUserId} from '@/entities/user/lib/jwt'
import {refreshAccessToken} from '@/entities/user/api/authRepository'
import {getMyProfile} from '@/entities/user/api/userRepository'
import {useAppDispatch} from '@/app/providers/store/hooks.ts'

// 앱이 처음 켜질 때(새로고침 포함), httpOnly 쿠키에 담긴 refreshToken으로
// 조용히 로그인 상태를 복구하는 훅. 실패하면 그냥 비로그인 상태로 둠.
export function useSessionBootstrap() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        // 소셜 로그인 콜백(useSocialLoginCallback)이 자체적으로 refresh를 호출하므로
        // 그 경우엔 여기서 중복 호출하지 않음
        const params = new URLSearchParams(window.location.search)
        if (params.get('socialLogin') === 'success') return

        dispatch(setAuthChecking(true))

        refreshAccessToken()
            .then(async (tokens) => {
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
            })
            .catch(() => {
                dispatch(setAuthChecking(false))
            })
    }, [dispatch])
}
