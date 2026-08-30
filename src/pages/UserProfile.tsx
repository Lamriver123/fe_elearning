import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../features/auth/application/useAuth'
import type { AuthUser } from '../features/auth/domain/auth.types'
import { useUserProfile } from '../features/user/application/useUserProfile'
import type { UpdateProfilePayload, ChangePasswordPayload } from '../features/user/domain/user.types'
import { USER_ROLES } from '../shared/constants/roles'

type UserProfileProps = {
  onLogout: () => Promise<void>
}

function getProfileForm(user: AuthUser | null): UpdateProfilePayload {
  return {
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
  }
}

export default function UserProfile({ onLogout }: UserProfileProps) {
  const { user } = useAuth()
  const { updateProfile, changePassword, uploadAvatar, isUpdating, isChangingPassword, isUploadingAvatar } = useUserProfile()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const [profileForm, setProfileForm] = useState<UpdateProfilePayload>(() => getProfileForm(user))

  const [passwordForm, setPasswordForm] = useState<ChangePasswordPayload>({
    oldPassword: '',
    newPassword: '',
  })
  
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const startEditingProfile = () => {
    setProfileForm(getProfileForm(user))
    setIsEditingProfile(true)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const submitProfile = async (e: FormEvent) => {
    e.preventDefault()
    const success = await updateProfile(profileForm)
    if (success) {
      setIsEditingProfile(false)
    }
  }

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }
    const success = await changePassword(passwordForm)
    if (success) {
      setPasswordForm({ oldPassword: '', newPassword: '' })
      setConfirmPassword('')
      setShowPasswordForm(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
      setSelectedAvatarFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const confirmAvatarUpload = async () => {
    if (!selectedAvatarFile) return
    const newAvatarUrl = await uploadAvatar(selectedAvatarFile)
    if (newAvatarUrl) {
      setProfileForm(prev => ({ ...prev, avatar: newAvatarUrl }))
      setAvatarPreview(null)
      setSelectedAvatarFile(null)
    }
  }

  const cancelAvatarUpload = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarPreview(null)
    setSelectedAvatarFile(null)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await onLogout()
  }

  if (!user) return null

  const isTeacher = user.role === USER_ROLES.TEACHER

  return (
    <div className={`${isTeacher ? 'teacher-content-container' : 'student-content-container'} profile-page`}>
      {isTeacher && (
        <div className="teacher-page-header">
          <div>
            <h1>Thông tin cá nhân</h1>
            <p>Quản lý hồ sơ và bảo mật tài khoản của bạn.</p>
          </div>
        </div>
      )}

      {!isTeacher && (
        <div className="profile-page__header">
          <h1>Thông tin cá nhân</h1>
          <p>Quản lý hồ sơ và bảo mật tài khoản của bạn.</p>
        </div>
      )}

      <div className="profile-grid">
        
        <section className="dashboard-card profile-card">
          <div className="profile-identity">
            <div className="profile-avatar-block">
              <div className="profile-avatar">
                <img 
                  src={avatarPreview || user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName)} 
                  alt={user.fullName}
                  className={`profile-avatar__image ${isUploadingAvatar ? 'profile-avatar__image--loading' : ''}`}
                />
                {!selectedAvatarFile && (
                  <button 
                    type="button" 
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="profile-avatar__edit"
                    title="Thay đổi ảnh đại diện"
                    aria-label="Thay đổi ảnh đại diện"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="profile-avatar__input"
                />
              </div>
              
              {selectedAvatarFile && (
                <div className="profile-avatar__actions">
                  <button 
                    type="button" 
                    className="secondary-action" 
                    onClick={cancelAvatarUpload} 
                    disabled={isUploadingAvatar}
                  >
                    Hủy
                  </button>
                  <button 
                    type="button" 
                    className="primary-action" 
                    onClick={confirmAvatarUpload} 
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? 'Đang lưu...' : 'Lưu ảnh'}
                  </button>
                </div>
              )}
            </div>
            <div className="profile-identity__content">
              <div className="profile-identity__row">
                <div className="profile-identity__text">
                  <div className="status-pill status-pill--info profile-role">
                    {user.role === USER_ROLES.TEACHER ? 'Giáo viên' : 'Học sinh'}
                  </div>
                  <h2>{user.fullName}</h2>
                  <p>{user.email}</p>
                </div>
                {!isEditingProfile && (
                  <button type="button" className="secondary-action profile-edit-btn" onClick={startEditingProfile}>
                    Sửa thông tin
                  </button>
                )}
              </div>
            </div>
          </div>

          {!isEditingProfile ? (
            <div className="profile-details">
                <div className="profile-detail">
                  <p className="profile-detail__label">Họ và tên</p>
                  <p className="profile-detail__value">{user.fullName}</p>
                </div>
                <div className="profile-detail">
                  <p className="profile-detail__label">Số điện thoại</p>
                  <p className="profile-detail__value">{user.phone || 'Chưa cập nhật'}</p>
                </div>
                <div className="profile-detail">
                  <p className="profile-detail__label">Ngày sinh</p>
                  <p className="profile-detail__value">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                </div>
                <div className="profile-detail">
                  <p className="profile-detail__label">Giới tính</p>
                  <p className="profile-detail__value">
                    {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : user.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="profile-detail profile-detail--wide">
                  <p className="profile-detail__label">Địa chỉ</p>
                  <p className="profile-detail__value">{user.address || 'Chưa cập nhật'}</p>
                </div>
            </div>
          ) : (
            <form onSubmit={submitProfile} className="profile-form">
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input type="text" className="form-input" name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input type="text" className="form-input" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
              </div>

              <div className="profile-form__grid">
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-input" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  <select className="form-select" name="gender" value={profileForm.gender} onChange={handleProfileChange}>
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <input type="text" className="form-input" name="address" value={profileForm.address} onChange={handleProfileChange} />
              </div>

              <div className="profile-form__actions">
                <button type="button" className="secondary-action" onClick={() => setIsEditingProfile(false)} disabled={isUpdating}>
                  Hủy
                </button>
                <button type="submit" className="primary-action" disabled={isUpdating}>
                  {isUpdating ? 'Đang cập nhật...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="dashboard-card profile-card profile-card--security">
          <div className="profile-card__header">
            <h2>Bảo mật tài khoản</h2>
            <p>
              Đảm bảo tài khoản của bạn đang sử dụng mật khẩu dài, ngẫu nhiên để an toàn.
            </p>
          </div>

          {!showPasswordForm ? (
            <button type="button" className="secondary-action profile-security-btn" onClick={() => setShowPasswordForm(true)}>
              <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>
              Đổi mật khẩu
            </button>
          ) : (
            <form onSubmit={submitPassword} className="profile-form profile-form--security">
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input type="password" className="form-input" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} required minLength={6} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input type="password" className="form-input" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required minLength={6} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>

              <div className="profile-form__actions">
                <button type="button" className="secondary-action" onClick={() => setShowPasswordForm(false)} disabled={isChangingPassword}>
                  Hủy
                </button>
                <button type="submit" className="primary-action primary-action--dark" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Đang cập nhật...' : 'Xác nhận đổi'}
                </button>
              </div>
            </form>
          )}

          <div className="profile-account-actions">
            <div>
              <h3>Phiên đăng nhập</h3>
              <p>Thoát khỏi tài khoản trên thiết bị hiện tại.</p>
            </div>
            <button
              type="button"
              className="secondary-action profile-logout-btn"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
            >
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
