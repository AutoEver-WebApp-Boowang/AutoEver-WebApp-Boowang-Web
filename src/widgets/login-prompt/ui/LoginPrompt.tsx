import {useState} from 'react'
import {redirectToSocialLogin} from '@/entities/user/lib/socialLogin'
import styles from './LoginPrompt.module.css'

type LoginPromptProps = {
    description: string
}

export function LoginPrompt({description}: LoginPromptProps) {
    // 소셜 로그인 버튼을 연타하면 /oauth2/authorization/{provider} 요청이 중복으로 나가서
    // 백엔드 세션에 저장된 OAuth 인가 요청(state)이 덮어써질 수 있어 리다이렉트 중에는 버튼을 막아둔다.
    const [isRedirecting, setIsRedirecting] = useState(false)

    const handleKakaoLogin = () => {
        if (isRedirecting) return

        setIsRedirecting(true)
        redirectToSocialLogin('kakao')
    }

    return (
        <div className={styles.panel}>
            <strong className={styles.title}>로그인이 필요해요</strong>
            <p className={styles.description}>{description}</p>

            <div className={styles.buttonList}>
                <button
                    type="button"
                    className={styles.kakaoButton}
                    disabled={isRedirecting}
                    onClick={handleKakaoLogin}
                >
                    <img
                        className={styles.kakaoIcon}
                        src="/icons/kakao-logo.svg"
                        alt=""
                        aria-hidden="true"
                    />
                    카카오로 로그인
                </button>
            </div>
        </div>
    )
}
