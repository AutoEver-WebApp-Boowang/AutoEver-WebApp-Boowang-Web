import {useAppDispatch, useAppSelector} from '@/app/providers/store/hooks.ts'
import {setSocialLoginFailed} from '@/entities/user'
import {useRetrySocialLogin} from '@/entities/user/model/useRetrySocialLogin'
import styles from './SocialLoginRetryBanner.module.css'

// 소셜 로그인 콜백 이후 토큰 재발급이 실패했을 때(예: 서드파티 쿠키 차단) 화면 상단에 띄워서
// 사용자가 다시 시도하거나 닫을 수 있게 하는 배너.
export function SocialLoginRetryBanner() {
    const dispatch = useAppDispatch()
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const socialLoginFailed = useAppSelector((state) => state.auth.socialLoginFailed)
    const retryMutation = useRetrySocialLogin()

    if (!socialLoginFailed || isAuthenticated) return null

    return (
        <div className={styles.banner} role="alert">
            <span>로그인 처리에 실패했어요.</span>
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.retryButton}
                    onClick={() => retryMutation.mutate()}
                    disabled={retryMutation.isPending}
                >
                    다시 시도
                </button>
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => dispatch(setSocialLoginFailed(false))}
                    aria-label="닫기"
                >
                    ×
                </button>
            </div>
            {retryMutation.isError && (
                <p className={styles.retryErrorMessage}>여전히 실패했어요. 다시 로그인해주세요.</p>
            )}
        </div>
    )
}
