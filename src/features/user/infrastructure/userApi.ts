import { httpClient } from '../../../shared/lib/httpClient'
import type { AuthUser } from '../../auth/domain/auth.types'
import type { UpdateProfilePayload, ChangePasswordPayload } from '../domain/user.types'

export const userApi = {
  getProfile() {
    return httpClient.get('/users/me') as Promise<AuthUser>
  },

  updateProfile(payload: UpdateProfilePayload) {
    return httpClient.patch('/users/me', payload) as Promise<AuthUser>
  },

  changePassword(payload: ChangePasswordPayload) {
    return httpClient.patch('/users/me/password', payload) as Promise<{ message: string }>
  },

  uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }) as Promise<{ avatar: string; message: string }>
  }
}
