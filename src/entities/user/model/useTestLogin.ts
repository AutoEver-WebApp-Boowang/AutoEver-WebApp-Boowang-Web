import {type AuthUser, clearAuth, setCredentials} from "@/entities/user";
import {getMe, loginTest} from "@/entities/user/api/authRepository.ts";
import {getMyProfile} from "@/entities/user/api/userRepository.ts";
import {useAppDispatch} from "@/app/providers/store/hooks.ts";
import {useMutation} from "@tanstack/react-query";

// setCredentails가 원하는 모양의 결과 타입
type LoginResult = {
    user: AuthUser
    accessToken: string
    tokenType: string
    expiresIn: number
}

// 로그인 -> /me를 순서대로 호출하는 일반 함수 (훅 x)
async function loginAndFetchMe(): Promise<LoginResult> {
    const tokens = await loginTest()
    const me = await getMe(tokens.accessToken, tokens.tokenType)
    const profile = await getMyProfile(tokens.accessToken, tokens.tokenType)

    return {
        user: {
            id: me.userId,
            nickname: profile.nickname,
        },
        accessToken: tokens.accessToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn
    }
}

// 테스트 로그인 버튼에서 쓸 훅
export function useTestLogin() {
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: loginAndFetchMe,
        onSuccess: (result) => {
            dispatch(setCredentials(result))
        },
        onError: (error) => {
            console.error('테스트 로그인 실패', error)
            dispatch(clearAuth())
        }
    })
}
