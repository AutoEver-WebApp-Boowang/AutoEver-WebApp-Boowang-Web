import {useMutation} from '@tanstack/react-query'
import {setCredentials} from '@/entities/user'
import {decodeAccessTokenUserId} from '@/entities/user/lib/jwt'
import {refreshAccessToken} from '@/entities/user/api/authRepository'
import {getMyProfile} from '@/entities/user/api/userRepository'
import {useAppDispatch} from '@/app/providers/store/hooks.ts'

// useSocialLoginCallback에서 refreshAccessToken이 실패했을 때(예: 서드파티 쿠키 차단)
// 사용자가 재시도 버튼을 눌러 같은 절차를 다시 시도할 수 있게 하는 훅.
export function useRetrySocialLogin() {
    const dispatch = useAppDispatch()

    return useMutation({
        mutationFn: async () => {
            const tokens = await refreshAccessToken()
            const profile = await getMyProfile(tokens.accessToken, tokens.tokenType)
            return {tokens, profile}
        },
        onSuccess: ({tokens, profile}) => {
            const userId = decodeAccessTokenUserId(tokens.accessToken)

            dispatch(setCredentials({
                user: {
                    id: userId ?? 0,
                    nickname: profile.nickname,
                },
                accessToken: tokens.accessToken,
                tokenType: tokens.tokenType,
                expiresIn: tokens.expiresIn,
            }))
        },
    })
}
