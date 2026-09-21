import {useTestLogin} from '@/entities/user/model/useTestLogin'
import {redirectToSocialLogin} from '@/entities/user/lib/socialLogin'
import styles from './LoginPrompt.module.css'

type LoginPromptProps = {
    description: string
}

export function LoginPrompt({description}: LoginPromptProps) {
    const testLoginMutation = useTestLogin()

    return (
        <div className={styles.panel}>
            <strong className={styles.title}>로그인이 필요해요</strong>
            <p className={styles.description}>{description}</p>

            <div className={styles.buttonList}>
                <button
                    type="button"
                    className={styles.button}
                    disabled={testLoginMutation.isPending}
                    onClick={() => testLoginMutation.mutate()}
                >
                    테스트 로그인
                </button>
                <button
                    type="button"
                    className={styles.button}
                    onClick={() => redirectToSocialLogin('kakao')}
                >
                    카카오로 로그인
                </button>
                <button
                    type="button"
                    className={styles.button}
                    onClick={() => redirectToSocialLogin('hyundai')}
                >
                    현대자동차로 로그인
                </button>
            </div>

            {testLoginMutation.isError && (
                <p className={styles.errorMessage}>테스트 로그인에 실패했어요. 다시 시도해주세요.</p>
            )}
        </div>
    )
}
