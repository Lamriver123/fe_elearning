import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../features/auth/application/useAuth'
import { useUserProfile } from '../features/user/application/useUserProfile'
import type { UpdateProfilePayload, ChangePasswordPayload } from '../features/user/domain/user.types'
import { USER_ROLES } from '../shared/constants/roles'

export default function UserProfile() {
  const { user } = useAuth()
  const { updateProfile, changePassword, uploadAvatar, isUpdating, isChangingPassword, isUploadingAvatar } = useUserProfile()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
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

  const [profileForm, setProfileForm] = useState<UpdateProfilePayload>({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    avatar: '',
  })

  const [passwordForm, setPasswordForm] = useState<ChangePasswordPayload>({
    oldPassword: '',
    newPassword: '',
  })
  
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '', // format YYYY-MM-DD
        gender: user.gender || '',
        address: user.address || '',
        avatar: user.avatar || '',
      })
    }
  }, [user])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await updateProfile(profileForm)
    if (success) {
      setIsEditingProfile(false)
    }
  }

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!')
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (!user) return null

  const isTeacher = user.role === USER_ROLES.TEACHER

  return (
    <div className={isTeacher ? "teacher-content-container" : "student-content-container"} style={{ padding: isTeacher ? '0' : '24px' }}>
      {isTeacher && (
        <div className="teacher-page-header">
          <div>
            <h1>Thông tin cá nhân</h1>
            <p>Quản lý hồ sơ và bảo mật tài khoản của bạn.</p>
          </div>
        </div>
      )}

      {!isTeacher && (
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>Thông tin cá nhân</h1>
          <p style={{ color: 'var(--color-muted)' }}>Quản lý hồ sơ và bảo mật tài khoản của bạn.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '32px', marginTop: '24px' }}>
        
        {/* Profile Card */}
        <div className="dashboard-card" style={{ flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border-soft)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={avatarPreview || user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName)} 
                  alt={user.fullName}
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '4px solid var(--color-primary-soft)',
                    opacity: isUploadingAvatar ? 0.5 : 1
                  }}
                />
                {!selectedAvatarFile && (
                  <button 
                    type="button" 
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      border: '2px solid #fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    title="Thay đổi ảnh đại diện"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
              
              {selectedAvatarFile && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    className="secondary-action" 
                    onClick={cancelAvatarUpload} 
                    disabled={isUploadingAvatar}
                    style={{ padding: '4px 8px', minHeight: 'unset', fontSize: '0.75rem' }}
                  >
                    Hủy
                  </button>
                  <button 
                    type="button" 
                    className="primary-action" 
                    onClick={confirmAvatarUpload} 
                    disabled={isUploadingAvatar}
                    style={{ padding: '4px 8px', minHeight: 'unset', fontSize: '0.75rem', flex: 1 }}
                  >
                    {isUploadingAvatar ? 'Đang lưu...' : 'Lưu ảnh'}
                  </button>
                </div>
              )}
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'inline-flex', marginBottom: '8px', padding: '6px 12px', borderRadius: '999px', background: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)', fontSize: '0.85rem', fontWeight: 700 }}>
                    {user.role === USER_ROLES.TEACHER ? 'Giáo viên' : 'Học viên'}
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px', wordBreak: 'break-word' }}>{user.fullName}</h2>
                  <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', wordBreak: 'break-all' }}>{user.email}</p>
                </div>
                {!isEditingProfile && (
                  <button type="button" className="secondary-action" onClick={() => setIsEditingProfile(true)} style={{ padding: '10px 20px', minHeight: 'unset', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                    Sửa thông tin
                  </button>
                )}
              </div>
            </div>
          </div>

          {!isEditingProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-muted-soft)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Họ và tên</p>
                  <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>{user.fullName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-muted-soft)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Số điện thoại</p>
                  <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>{user.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-muted-soft)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Ngày sinh</p>
                  <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-muted-soft)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Giới tính</p>
                  <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>
                    {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : user.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-muted-soft)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Địa chỉ</p>
                  <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>{user.address || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={submitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Họ và tên</label>
                <input type="text" className="form-input" name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Số điện thoại</label>
                <input type="text" className="form-input" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-input" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileChange} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Giới tính</label>
                  <select className="form-select" name="gender" value={profileForm.gender} onChange={handleProfileChange}>
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Địa chỉ</label>
                <input type="text" className="form-input" name="address" value={profileForm.address} onChange={handleProfileChange} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="secondary-action" style={{ flex: 1 }} onClick={() => setIsEditingProfile(false)} disabled={isUpdating}>
                  Hủy
                </button>
                <button type="submit" className="primary-action" style={{ flex: 2 }} disabled={isUpdating}>
                  {isUpdating ? 'Đang cập nhật...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Card */}
        <div className="dashboard-card" style={{ flexDirection: 'column', gap: '24px', height: 'fit-content' }}>
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-border-soft)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Bảo mật tài khoản</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Đảm bảo tài khoản của bạn đang sử dụng mật khẩu dài, ngẫu nhiên để an toàn.
            </p>
          </div>

          {!showPasswordForm ? (
            <button type="button" className="secondary-action" onClick={() => setShowPasswordForm(true)} style={{ width: 'fit-content' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '6px' }}>lock_reset</span>
              Đổi mật khẩu
            </button>
          ) : (
            <form onSubmit={submitPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', border: '1px solid var(--color-border-soft)', borderRadius: '8px', background: 'var(--color-surface-soft)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mật khẩu hiện tại</label>
                <input type="password" className="form-input" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} required minLength={6} />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mật khẩu mới</label>
                <input type="password" className="form-input" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required minLength={6} />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="secondary-action" onClick={() => setShowPasswordForm(false)} disabled={isChangingPassword} style={{ flex: 1, background: '#fff' }}>
                  Hủy
                </button>
                <button type="submit" className="primary-action" disabled={isChangingPassword} style={{ flex: 2, backgroundColor: 'var(--color-text)', borderColor: 'var(--color-text)' }}>
                  {isChangingPassword ? 'Đang cập nhật...' : 'Xác nhận đổi'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
