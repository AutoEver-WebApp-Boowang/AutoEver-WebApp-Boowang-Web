import {useState} from 'react'
import {useTestLogin} from '@/entities/user/model/useTestLogin'
import {redirectToSocialLogin, type SocialLoginProvider} from '@/entities/user/lib/socialLogin'
import styles from './LoginPrompt.module.css'

type LoginPromptProps = {
    description: string
}

export function LoginPrompt({description}: LoginPromptProps) {
    const testLoginMutation = useTestLogin()
    // 소셜 로그인 버튼을 연타하면 /oauth2/authorization/{provider} 요청이 중복으로 나가서
    // 백엔드 세션에 저장된 OAuth 인가 요청(state)이 덮어써질 수 있어 리다이렉트 중에는 버튼을 막아둔다.
    const [isRedirecting, setIsRedirecting] = useState(false)

    const handleSocialLogin = (provider: SocialLoginProvider) => {
        if (isRedirecting) return

        setIsRedirecting(true)
        redirectToSocialLogin(provider)
    }

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
                    disabled={isRedirecting}
                    onClick={() => handleSocialLogin('kakao')}
                >
                    카카오로 로그인
                </button>
                <button
                    type="button"
                    className={styles.button}
                    disabled={isRedirecting}
                    onClick={() => handleSocialLogin('hyundai')}
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
