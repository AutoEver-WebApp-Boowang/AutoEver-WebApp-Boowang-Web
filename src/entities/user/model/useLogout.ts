import {clearAuth} from "@/entities/user";
import {logout} from "@/entities/user/api/authRepository.ts";
import {useAppDispatch} from "@/app/providers/store/hooks.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";

// 로그아웃 버튼에서 쓸 훅.
// 백엔드 호출이 실패해도(이미 만료된 세션 등) 어차피 프론트 상태는 비로그인으로 정리해야 하므로
// onSuccess/onError 둘 다에서 clearAuth를 호출한다.
export function useLogout() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    // 로그인 상태에 따라 내용이 달라지는 쿼리 캐시(리뷰 isLiked, 즐겨찾기 등)가
    // 로그아웃 후에도 그대로 남아있으면 안 되므로 전부 지운다.
    const clearAuthAndCache = () => {
        dispatch(clearAuth())
        queryClient.clear()
    }

    return useMutation({
        mutationFn: logout,
        onSuccess: clearAuthAndCache,
        onError: (error) => {
            console.error('로그아웃 실패', error)
            clearAuthAndCache()
        },
    })
}
