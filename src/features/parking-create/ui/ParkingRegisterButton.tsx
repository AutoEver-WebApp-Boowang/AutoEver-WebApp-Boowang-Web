import styles from './ParkingRegisterButton.module.css'

type ParkingRegisterButtonProps = {
    onClick: () => void
}

export function ParkingRegisterButton({onClick}: ParkingRegisterButtonProps) {
    return (
        <button
            type="button"
            className={styles.button}
            onClick={onClick}
        >
            <img
                className={styles.icon}
                src="/icons/plus.svg"
                alt=""
                aria-hidden="true"
            />
            주차장 등록
        </button>
    )
}
