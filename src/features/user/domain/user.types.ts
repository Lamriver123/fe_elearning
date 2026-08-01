import type { UserRole } from '../../../shared/constants/roles'

export type UpdateProfilePayload = {
  fullName?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  avatar?: string
}

export type ChangePasswordPayload = {
  oldPassword: string
  newPassword: string
}
