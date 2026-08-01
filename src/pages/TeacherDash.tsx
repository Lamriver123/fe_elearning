import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { AuthUser } from '../features/auth/domain/auth.types'
import { TeacherLayout } from '../features/teacher/presentation/components/TeacherLayout'
import { ClassList } from '../features/teacher/presentation/components/ClassList'
import { useClasses } from '../features/teacher/application/useClasses'
import { CreateClassModal } from '../features/teacher/presentation/components/CreateClassModal'
import { ClassDetail } from '../features/teacher/presentation/components/ClassDetail'
import UserProfile from './UserProfile.tsx'

type TeacherAppProps = {
  user: AuthUser
  onLogout: () => Promise<void>
}

function TeacherClassesContent() {
  const { classes, isLoading, error, refreshClasses } = useClasses()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="teacher-content-container">
      <div className="teacher-page-header">
        <div>
          <h1>Quản lý lớp học</h1>
          <p>Quản lý và theo dõi tiến độ các lớp học của bạn.</p>
        </div>
        
        <button 
          className="teacher-btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
          Tạo lớp học mới
        </button>
      </div>
      
      <ClassList 
        classes={classes} 
        isLoading={isLoading} 
        error={error} 
      />

      <CreateClassModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => void refreshClasses()}
      />
    </div>
  )
}

function TeacherHomeContent({ user }: { user: AuthUser }) {
  return (
    <div className="teacher-content-container">
      <div className="teacher-page-header">
        <div>
          <h1>Tổng quan</h1>
          <p>Chào mừng bạn quay trở lại, {user.fullName}!</p>
        </div>
      </div>
      
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '60px 20px',
        textAlign: 'center',
        marginTop: '32px'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-primary-soft)', marginBottom: '16px' }}>dashboard</span>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>Teacher Dashboard</h2>
        <p style={{ color: 'var(--color-muted)', maxWidth: '500px', margin: '0 auto' }}>
          Đây là trang tổng quan. Chọn "Quản lý lớp học" từ menu bên trái để xem danh sách các lớp học của bạn.
        </p>
      </div>
    </div>
  )
}

export default function TeacherApp({ user, onLogout }: TeacherAppProps) {
  return (
    <TeacherLayout user={user} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<TeacherHomeContent user={user} />} />
        <Route path="classes" element={<TeacherClassesContent />} />
        <Route path="classes/:classId/*" element={<ClassDetail />} />
        <Route path="profile" element={<UserProfile />} />
      </Routes>
    </TeacherLayout>
  )
}
