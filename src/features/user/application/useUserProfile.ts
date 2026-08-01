import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { userApi } from '../infrastructure/userApi'
import type { UpdateProfilePayload, ChangePasswordPayload } from '../domain/user.types'
import { useAuth } from '../../auth/application/useAuth'

export function useUserProfile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const { updateUser, user } = useAuth()

  const handleUpdateProfile = async (payload: UpdateProfilePayload) => {
    setIsUpdating(true)
    try {
      const updatedUser = await userApi.updateProfile(payload)
      updateUser(updatedUser)
      toast.success('Cập nhật thông tin thành công')
      return true
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin')
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async (payload: ChangePasswordPayload) => {
    setIsChangingPassword(true)
    try {
      const res = await userApi.changePassword(payload)
      toast.success(res.message || 'Đổi mật khẩu thành công')
      return true
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu')
      return false
    } finally {
      setIsChangingPassword(false)
    }
  }

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleUploadAvatar = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const res = await userApi.uploadAvatar(file)
      if (user) {
        updateUser({ ...user, avatar: res.avatar })
      }
      toast.success(res.message || 'Tải ảnh lên thành công')
      return res.avatar
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi tải ảnh lên')
      return null
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return {
    isUpdating,
    isChangingPassword,
    isUploadingAvatar,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    uploadAvatar: handleUploadAvatar,
  }
}
