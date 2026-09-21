import {clearAuth} from "@/entities/user";
import {logout} from "@/entities/user/api/authRepository.ts";
import {useAppDispatch} from "@/app/providers/store/hooks.ts";
import {useMutation} from "@tanstack/react-query";

// 로그아웃 버튼에서 쓸 훅.
// 백엔드 호출이 실패해도(이미 만료된 세션 등) 어차피 프론트 상태는 비로그인으로 정리해야 하므로
// onSuccess/onError 둘 다에서 clearAuth를 호출한다.
export function useLogout() {
    const dispatch = useAppDispatch()

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            dispatch(clearAuth())
        },
        onError: (error) => {
            console.error('로그아웃 실패', error)
            dispatch(clearAuth())
        },
    })
}
