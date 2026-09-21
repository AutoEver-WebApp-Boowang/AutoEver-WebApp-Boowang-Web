import {useState, type FormEvent} from 'react'
import styles from './MyProfileEditForm.module.css'

type MyProfileEditFormProps = {
    initialNickname: string
    initialPhone: string
    onSubmit: (payload: {nickname?: string; phone?: string}) => Promise<void>
    onClose: () => void
}

const NICKNAME_PATTERN = /^[가-힣A-Za-z0-9_]{2,20}$/
const PHONE_PATTERN = /^(010[0-9]{8}|01[16789][0-9]{7,8})$/

export function MyProfileEditForm({
                                       initialNickname,
                                       initialPhone,
                                       onSubmit,
                                       onClose,
                                   }: MyProfileEditFormProps) {
    const [nickname, setNickname] = useState(initialNickname)
    const [phone, setPhone] = useState(initialPhone)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const trimmedNickname = nickname.trim()
    const trimmedPhone = phone.trim()

    const isNicknameValid = trimmedNickname === '' || NICKNAME_PATTERN.test(trimmedNickname)
    const isPhoneValid = trimmedPhone === '' || PHONE_PATTERN.test(trimmedPhone)
    const hasAnyValue = trimmedNickname !== '' || trimmedPhone !== ''
    const canSubmit = isNicknameValid && isPhoneValid && hasAnyValue && !isSubmitting

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!canSubmit) return

        try {
            setIsSubmitting(true)
            await onSubmit({
                nickname: trimmedNickname || undefined,
                phone: trimmedPhone || undefined,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-edit-title"
        >
            <header className={styles.header}>
                <h3 id="profile-edit-title">프로필 수정</h3>
                <button
                    type="button"
                    className={styles.closeButton}
                    aria-label="프로필 수정창 닫기"
                    onClick={onClose}
                >
                    ×
                </button>
            </header>

            <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="profile-nickname">닉네임</label>
                <input
                    id="profile-nickname"
                    className={styles.textInput}
                    value={nickname}
                    maxLength={20}
                    placeholder="2~20자 (한글/영문/숫자/_)"
                    onChange={(event) => setNickname(event.target.value)}
                />
                {!isNicknameValid && (
                    <p className={styles.fieldError}>닉네임은 한글/영문/숫자/_ 2~20자로 입력해주세요.</p>
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="profile-phone">전화번호</label>
                <input
                    id="profile-phone"
                    className={styles.textInput}
                    value={phone}
                    maxLength={11}
                    placeholder="01012345678"
                    onChange={(event) => setPhone(event.target.value)}
                />
                {!isPhoneValid && (
                    <p className={styles.fieldError}>올바른 전화번호 형식으로 입력해주세요.</p>
                )}
            </div>

            <p className={styles.hint}>닉네임과 전화번호 중 하나만 입력해도 수정할 수 있어요.</p>

            <div className={styles.footer}>
                <button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? '저장 중...' : '저장'}
                </button>
            </div>
        </form>
    )
}
