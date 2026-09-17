import styles from './CurrentLocationButton.module.css'

type CurrentLocationButtonProps = {
    isLocating: boolean
    onClick: () => void
}

export function CurrentLocationButton({
                                          isLocating,
                                          onClick,
                                      }: CurrentLocationButtonProps) {
    return (
        <button
            type={"button"}
            className={styles.button}
            onClick={onClick}
            disabled={isLocating}
            aria-label={
                isLocating
                    ? '현재 위치 확인 중'
                    : '현재 내 위치로 이동'
            }
        >
            <img
                src="/icons/current-location.svg"
                alt=""
                aria-hidden="true"
            />
        </button>
    )
}