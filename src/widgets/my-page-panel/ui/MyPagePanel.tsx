import {useQuery} from '@tanstack/react-query'
import {useAppSelector} from '@/app/providers/store/hooks.ts'
import {getMyProfile} from '@/entities/user/api/userRepository'
import {LoginPrompt} from '@/widgets/login-prompt'
import styles from './MyPagePanel.module.css'

const FEEDBACK_FORM_URL = 'https://forms.gle/d757kmTL9GqnQoMo6'

// 등급별 임계값이 아직 백엔드에 없어서 100점 단위로 임시 가정한 값.
// 실제 등급 기준이 정해지면 이 부분을 그 기준으로 교체해야 함.
const TRUST_LEVEL_STEP = 100

function getNextLevelProgress(trustScore: number) {
    const currentLevelFloor = Math.floor(trustScore / TRUST_LEVEL_STEP) * TRUST_LEVEL_STEP
    const nextLevelThreshold = currentLevelFloor + TRUST_LEVEL_STEP

    return {
        pointsUntilNextLevel: nextLevelThreshold - trustScore,
        progressRatio: (trustScore - currentLevelFloor) / TRUST_LEVEL_STEP,
    }
}

export function MyPagePanel() {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const accessToken = useAppSelector((state) => state.auth.accessToken)
    const tokenType = useAppSelector((state) => state.auth.tokenType)

    const myProfileQuery = useQuery({
        queryKey: ['user', 'me'],
        queryFn: () => getMyProfile(accessToken!, tokenType!),
        enabled: isAuthenticated,
        retry: false,
    })

    if (!isAuthenticated) {
        return <LoginPrompt description="마이페이지는 로그인 후 이용할 수 있어요"/>
    }

    return (
        <section className={styles.panel}>
            <header className={styles.header}>
                <h2>마이페이지</h2>
            </header>

            {myProfileQuery.isLoading && (
                <p className={styles.state}>불러오는 중입니다.</p>
            )}

            {myProfileQuery.error instanceof Error && (
                <p className={styles.state}>{myProfileQuery.error.message}</p>
            )}

            {myProfileQuery.data && (
                <>
                    <div className={styles.profileSection}>
                        <div className={styles.avatar}/>
                        <p className={styles.nickname}>{myProfileQuery.data.nickname}</p>
                        <div className={styles.trustBadgeRow}>
                            <span className={styles.trustBadge}>
                                {myProfileQuery.data.trustLevel.displayName}
                            </span>
                        </div>
                    </div>

                    <div className={styles.trustCardWrapper}>
                        <div className={styles.trustCard}>
                            <div className={styles.trustCardHeader}>
                                <p className={styles.trustCardTitle}>
                                    {myProfileQuery.data.trustLevel.displayName}
                                </p>
                                <p className={styles.trustCardMeta}>
                                    다음 등급까지 {getNextLevelProgress(myProfileQuery.data.trustScore).pointsUntilNextLevel}점
                                </p>
                            </div>

                            <div className={styles.progressTrack}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${getNextLevelProgress(myProfileQuery.data.trustScore).progressRatio * 100}%`,
                                    }}
                                />
                            </div>

                            <p className={styles.trustCardCaption}>
                                정확한 정보를 제공할수록 등급이 올라가요
                            </p>
                        </div>
                    </div>

                    <div className={styles.feedbackSection}>
                        <p className={styles.feedbackTitle}>피드백</p>
                        <a
                            className={styles.feedbackButton}
                            href={FEEDBACK_FORM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                <path d="M6 1V11M1 6H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            버그 제보 / 의견 남기기
                        </a>
                    </div>
                </>
            )}
        </section>
    )
}
