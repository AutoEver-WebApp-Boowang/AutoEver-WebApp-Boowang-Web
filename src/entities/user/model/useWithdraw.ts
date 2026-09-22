import {clearAuth} from "@/entities/user";
import {withdraw} from "@/entities/user/api/userRepository.ts";
import {useAppDispatch, useAppSelector} from "@/app/providers/store/hooks.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";

// 회원 탈퇴 버튼에서 쓸 훅.
// 탈퇴 요청이 실패하면 계정이 그대로 남아있는 상태이므로 로그인 상태를 유지하고,
// 성공했을 때만 프론트 인증 상태를 정리한다.
export function useWithdraw() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const accessToken = useAppSelector((state) => state.auth.accessToken)
    const tokenType = useAppSelector((state) => state.auth.tokenType)

    return useMutation({
        mutationFn: () => withdraw(accessToken!, tokenType!),
        onSuccess: () => {
            dispatch(clearAuth())
            // 로그아웃과 마찬가지로 로그인 상태에 따라 달라지는 쿼리 캐시를 지운다.
            queryClient.clear()
        },
    })
}
