import {useEffect, useMemo, useState, type ChangeEvent, type FormEvent} from 'react'
import {createPortal} from 'react-dom'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {registerParking, uploadParkingPhoto} from '@/entities/parking'
import type {CurrentPosition} from '@/features/current-location'
import {getAddressFromCoordinate} from '../lib/getAddressFromCoordinate'
import styles from './ParkingRegisterModal.module.css'

const MAX_PHOTO_COUNT = 5
const PLACE_TYPE = '제보' as const

type ParkingRegisterModalProps = {
    currentPosition: CurrentPosition | null
    isLocating: boolean
    currentLocationError: string | null
    onRefreshLocation: () => void
    accessToken: string | null
    tokenType: string | null
    onClose: () => void
}

export function ParkingRegisterModal({
                                          currentPosition,
                                          isLocating,
                                          currentLocationError,
                                          onRefreshLocation,
                                          accessToken,
                                          tokenType,
                                          onClose,
                                      }: ParkingRegisterModalProps) {
    const queryClient = useQueryClient()

    const [address, setAddress] = useState<string | null>(null)
    const [isGeocoding, setIsGeocoding] = useState(false)
    const [geocodeError, setGeocodeError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [detailAddress, setDetailAddress] = useState('')
    const [isFree, setIsFree] = useState(true)
    const [feeDescription, setFeeDescription] = useState('')
    const [operatingHours, setOperatingHours] = useState('')
    const [capacity, setCapacity] = useState('')
    const [hasRoof, setHasRoof] = useState(true)
    const [description, setDescription] = useState('')
    const [photoFiles, setPhotoFiles] = useState<File[]>([])

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }

        window.addEventListener('keydown', handleEscape)

        return () => window.removeEventListener('keydown', handleEscape)
    }, [onClose])

    useEffect(() => {
        if (!currentPosition) return

        let isCancelled = false
        setIsGeocoding(true)
        setGeocodeError(null)

        getAddressFromCoordinate({
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
        })
            .then((result) => {
                if (isCancelled) return
                setAddress(result)
            })
            .catch((error: unknown) => {
                if (isCancelled) return
                setAddress(null)
                setGeocodeError(
                    error instanceof Error
                        ? error.message
                        : '주소를 확인할 수 없습니다.',
                )
            })
            .finally(() => {
                if (isCancelled) return
                setIsGeocoding(false)
            })

        return () => {
            isCancelled = true
        }
    }, [currentPosition?.latitude, currentPosition?.longitude])

    const photoPreviewUrls = useMemo(
        () => photoFiles.map((file) => URL.createObjectURL(file)),
        [photoFiles],
    )

    useEffect(() => {
        return () => {
            photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [photoPreviewUrls])

    const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files

        if (!files || files.length === 0) return

        const remainingSlots = MAX_PHOTO_COUNT - photoFiles.length
        const selectedFiles = Array.from(files).slice(0, remainingSlots)

        // input.value를 먼저 비우면 브라우저에 따라 위에서 참조한 files가
        // 같은 FileList 객체라 함께 비워질 수 있어서, 배열로 복사한 뒤에 초기화한다.
        event.target.value = ''

        if (selectedFiles.length === 0) return

        setPhotoFiles((current) => [...current, ...selectedFiles])
    }

    const handlePhotoRemove = (index: number) => {
        setPhotoFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
    }

    const registerMutation = useMutation({
        mutationFn: async () => {
            if (!currentPosition || !address) {
                throw new Error('위치를 확인할 수 없습니다.')
            }

            const placeId = await registerParking(
                {
                    name: name.trim(),
                    address,
                    detailAddress: detailAddress.trim() || null,
                    latitude: currentPosition.latitude,
                    longitude: currentPosition.longitude,
                    type: PLACE_TYPE,
                    isFree,
                    feeDescription: isFree ? null : (feeDescription.trim() || null),
                    hasRoof,
                    operatingHours: operatingHours.trim(),
                    capacity: capacity.trim() ? Number(capacity) : null,
                    description: description.trim() || null,
                },
                accessToken!,
                tokenType!,
            )

            for (let i = 0; i < photoFiles.length; i++) {
                await uploadParkingPhoto(placeId, photoFiles[i], i, accessToken!, tokenType!)
            }
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['parking', 'list']})
            void queryClient.invalidateQueries({queryKey: ['parking', 'search', 'registered']})
            onClose()
        },
        onError: (error) => {
            window.alert(
                error instanceof Error
                    ? error.message
                    : '주차장 등록에 실패했어요. 다시 시도해주세요.',
            )
        },
    })

    const isFormValid =
        name.trim() !== '' &&
        operatingHours.trim() !== '' &&
        address !== null &&
        currentPosition !== null

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!isFormValid || registerMutation.isPending) return

        registerMutation.mutate()
    }

    return createPortal(
        <div className={styles.backdrop} onClick={onClose}>
            <form
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="parking-register-title"
                onClick={(event) => event.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <header className={styles.header}>
                    <div className={styles.headerText}>
                        <p id="parking-register-title" className={styles.title}>주차장 등록</p>
                        <p className={styles.subtitle}>내 위치를 기준으로 등록돼요</p>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="주차장 등록 취소"
                    >
                        ×
                    </button>
                </header>

                <div className={styles.body}>
                    <section className={styles.field}>
                        <p className={styles.label}>위치</p>
                        <div className={styles.addressRow}>
                            <span className={styles.addressText}>
                                {isGeocoding
                                    ? '주소를 확인하는 중...'
                                    : geocodeError ?? address ?? '위치를 확인할 수 없습니다.'}
                            </span>
                            <button
                                type="button"
                                className={styles.refetchLocationButton}
                                onClick={onRefreshLocation}
                                disabled={isLocating}
                            >
                                {isLocating ? '위치 확인 중...' : '위치 다시 찍기'}
                            </button>
                        </div>
                        {currentLocationError && (
                            <p className={styles.locationErrorText}>{currentLocationError}</p>
                        )}
                        <input
                            className={styles.textInput}
                            value={detailAddress}
                            onChange={(event) => setDetailAddress(event.target.value)}
                            placeholder="상세 주소 (선택) 예) 지하 1층, 화단 옆"
                            maxLength={60}
                        />
                    </section>

                    <section className={styles.field}>
                        <p className={styles.label}>
                            장소 이름 <span className={styles.required}>필수</span>
                        </p>
                        <input
                            className={styles.textInput}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="예) 중앙로 공영 이륜차 주차장"
                            maxLength={60}
                        />
                    </section>

                    <section className={styles.field}>
                        <p className={styles.label}>주차장 종류</p>
                        <div className={styles.segmentedGroup}>
                            <span className={styles.segmentSelected}>
                                제보
                            </span>
                        </div>
                    </section>

                    <section className={styles.field}>
                        <p className={styles.label}>
                            이용 요금 <span className={styles.required}>필수</span>
                        </p>
                        <div className={styles.segmentedGroup}>
                            <button
                                type="button"
                                className={isFree ? styles.segmentSelected : styles.segment}
                                onClick={() => setIsFree(true)}
                            >
                                무료
                            </button>
                            <button
                                type="button"
                                className={!isFree ? styles.segmentSelected : styles.segment}
                                onClick={() => setIsFree(false)}
                            >
                                유료
                            </button>
                        </div>
                        {!isFree && (
                            <input
                                className={styles.textInput}
                                value={feeDescription}
                                onChange={(event) => setFeeDescription(event.target.value)}
                                placeholder="예) 1시간 500원"
                            />
                        )}
                    </section>

                    <section className={styles.field}>
                        <p className={styles.label}>
                            운영시간 <span className={styles.required}>필수</span>
                        </p>
                        <input
                            className={styles.textInput}
                            value={operatingHours}
                            onChange={(event) => setOperatingHours(event.target.value)}
                            placeholder="예) 24시간 / 06:00-24:00"
                        />
                    </section>

                    <section className={styles.field}>
                        <p className={styles.label}>주차 가능 대수</p>
                        <input
                            className={styles.textInput}
                            type="number"
                            min={0}
                            value={capacity}
                            onChange={(event) => setCapacity(event.target.value)}
                            placeholder="예) 15"
                        />
                    </section>

                    <section className={styles.field}>
                        <p className={styles.label}>지붕</p>
                        <div className={styles.segmentedGroup}>
                            <button
                                type="button"
                                className={hasRoof ? styles.segmentSelected : styles.segment}
                                onClick={() => setHasRoof(true)}
                            >
                                있음
                            </button>
                            <button
                                type="button"
                                className={!hasRoof ? styles.segmentSelected : styles.segment}
                                onClick={() => setHasRoof(false)}
                            >
                                없음
                            </button>
                        </div>
                    </section>

                    <section className={styles.field}>
                        <p className={styles.label}>사진</p>
                        <div className={styles.photoRow}>
                            <label className={styles.photoAddButton}>
                                <input
                                    className={styles.photoInput}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoSelect}
                                    disabled={photoFiles.length >= MAX_PHOTO_COUNT}
                                />
                                <img src="/icons/plus.svg" alt="" aria-hidden="true" />
                                <span>{photoFiles.length} / {MAX_PHOTO_COUNT}</span>
                            </label>
                            <p className={styles.photoHint}>실제 주차 구역이 보이는 사진이면 좋아요</p>
                        </div>
                        {photoFiles.length > 0 && (
                            <div className={styles.photoPreviewRow}>
                                {photoPreviewUrls.map((url, index) => (
                                    <div key={url} className={styles.photoPreview}>
                                        <img src={url} alt={`선택한 사진 ${index + 1}`} />
                                        <button
                                            type="button"
                                            className={styles.photoRemoveButton}
                                            onClick={() => handlePhotoRemove(index)}
                                            aria-label="사진 삭제"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className={styles.field}>
                        <p className={styles.label}>이용 조건 및 주의사항</p>
                        <textarea
                            className={styles.textArea}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="예) 인도 침범 없이 지정 구역 안에만 주차 가능"
                        />
                    </section>
                </div>

                <footer className={styles.footer}>
                    <button type="button" className={styles.cancelButton} onClick={onClose}>
                        취소
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!isFormValid || registerMutation.isPending}
                    >
                        {registerMutation.isPending ? '등록 중...' : '등록하기'}
                    </button>
                </footer>
            </form>
        </div>,
        document.body,
    )
}
