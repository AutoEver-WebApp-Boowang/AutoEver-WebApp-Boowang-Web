// swagger 기준: 성공 시 { data: T, ... } 형태로 감싸서 옴

export type FieldError = {
    field: string
    message: string
}

export type ApiErrorDetail = {
    code: string
    message: string
    fieldErrors: FieldError[] | null
}

export type ApiResponse<T> = {
    success: boolean
    data: T
    error: ApiErrorDetail | null
}