// 백엔드가 타임존 정보 없는 문자열로 시각을 내려주는데, 실제 값은 UTC 기준이라
// new Date()에 그대로 넣으면 브라우저 로컬(KST) 시간으로 잘못 해석되어 9시간 어긋난다.
// 타임존 표시(Z, +09:00 등)가 없는 문자열만 UTC로 간주해 'Z'를 붙여 파싱한다.
export function parseServerDate(dateString: string): Date {
    const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(dateString)
    return new Date(hasTimezone ? dateString : `${dateString}Z`)
}
