import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useAppSelector} from '@/app/providers/store/hooks.ts'
import {updateMyProfile} from '@/entities/user/api/userRepository.ts'
import type {UserUpdateRequest} from '@/entities/user/api/types.ts'

export function useUpdateMyProfile() {
    const queryClient = useQueryClient()
    const accessToken = useAppSelector((state) => state.auth.accessToken)
    const tokenType = useAppSelector((state) => state.auth.tokenType)

    return useMutation({
        mutationFn: (payload: UserUpdateRequest) => updateMyProfile(payload, accessToken!, tokenType!),
        onSuccess: (profile) => {
            queryClient.setQueryData(['user', 'me'], profile)
        },
    })
}
