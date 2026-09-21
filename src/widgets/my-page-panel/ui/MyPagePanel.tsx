import {useQuery} from '@tanstack/react-query'
import {useAppSelector} from '@/app/providers/store/hooks.ts'
import {getMyProfile} from '@/entities/user/api/userRepository'
import {useLogout} from '@/entities/user/model/useLogout'
import {useWithdraw} from '@/entities/user/model/useWithdraw'
import {LoginPrompt} from '@/widgets/login-prompt'
import styles from './MyPagePanel.module.css'

const FEEDBACK_FORM_URL = 'https://forms.gle/d757kmTL9GqnQoMo6'

// 등급별 점수 기준 (0~100 바린이 / 101~200 쿼터라이더 / 201~300 미들라이더 / 301~ 리터라이더)
const TRUST_LEVEL_THRESHOLDS = [
    {code: 'BEGINNER', minScore: 0},
    {code: 'INTERMEDIATE', minScore: 101},
    {code: 'EXPERT', minScore: 201},
    {code: 'LITER_RIDER', minScore: 301},
]

function getNextLevelProgress(trustScore: number) {
    let currentIndex = 0
    for (let i = 0; i < TRUST_LEVEL_THRESHOLDS.length; i++) {
        if (trustScore >= TRUST_LEVEL_THRESHOLDS[i].minScore) currentIndex = i
    }

    const currentLevel = TRUST_LEVEL_THRESHOLDS[currentIndex]
    const nextLevel = TRUST_LEVEL_THRESHOLDS[currentIndex + 1]

    if (!nextLevel) {
        return {isMaxLevel: true as const, pointsUntilNextLevel: 0, progressRatio: 1}
    }

    const rangeSize = nextLevel.minScore - currentLevel.minScore

    return {
        isMaxLevel: false as const,
        pointsUntilNextLevel: nextLevel.minScore - trustScore,
        progressRatio: (trustScore - currentLevel.minScore) / rangeSize,
    }
}

export function MyPagePanel() {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const accessToken = useAppSelector((state) => state.auth.accessToken)
    const tokenType = useAppSelector((state) => state.auth.tokenType)

    const logoutMutation = useLogout()
    const withdrawMutation = useWithdraw()

    const handleWithdraw = () => {
        const confirmed = window.confirm('정말 탈퇴하시겠어요? 탈퇴하면 계정 정보를 되돌릴 수 없어요.')
        if (!confirmed) return

        withdrawMutation.mutate(undefined, {
            onError: (error) => {
                window.alert(error instanceof Error ? error.message : '회원 탈퇴에 실패했어요. 다시 시도해주세요.')
            },
        })
    }

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
                <button
                    type="button"
                    className={styles.logoutButton}
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                >
                    로그아웃
                </button>
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
                                    {getNextLevelProgress(myProfileQuery.data.trustScore).isMaxLevel
                                        ? '최고 등급이에요'
                                        : `다음 등급까지 ${getNextLevelProgress(myProfileQuery.data.trustScore).pointsUntilNextLevel}점`}
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

                    <div className={styles.withdrawSection}>
                        <button
                            type="button"
                            className={styles.withdrawButton}
                            onClick={handleWithdraw}
                            disabled={withdrawMutation.isPending}
                        >
                            회원 탈퇴
                        </button>
                    </div>
                </>
            )}
        </section>
    )
}
