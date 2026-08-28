import type { AuthUser } from '../../auth/domain/auth.types'
import type { ChangePasswordPayload, UpdateProfilePayload } from './user.types'

export type UserRepository = {
  getProfile(): Promise<AuthUser>
  updateProfile(payload: UpdateProfilePayload): Promise<AuthUser>
  changePassword(payload: ChangePasswordPayload): Promise<{ message: string }>
  uploadAvatar(file: File): Promise<{ avatar: string; message: string }>
}
