import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { AuthUser } from '../features/auth/domain/auth.types'
import { TeacherLayout } from '../features/teacher/presentation/components/TeacherLayout'
import { ClassList } from '../features/teacher/presentation/components/ClassList'
import { useClasses } from '../features/teacher/application/useClasses'
import { CreateClassModal } from '../features/teacher/presentation/components/CreateClassModal'
import { ClassDetail } from '../features/teacher/presentation/components/ClassDetail'
import UserProfile from './UserProfile.tsx'
import { TeacherAudioUpload } from '../features/vocabulary/presentation/components/TeacherAudioUpload'
import { TeacherVocabularyManager } from '../features/vocabulary/presentation/components/TeacherVocabularyManager'

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
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
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
      
      <div className="teacher-home-panel surface-card">
        <span className="material-symbols-outlined teacher-home-panel__icon" aria-hidden="true">dashboard</span>
        <h2>Teacher Dashboard</h2>
        <p>
          Đây là trang tổng quan. Chọn "Quản lý lớp học" từ menu bên trái để xem danh sách các lớp học của bạn.
        </p>
      </div>
    </div>
  )
}

export default function TeacherApp({ user, onLogout }: TeacherAppProps) {
  return (
    <TeacherLayout user={user}>
      <Routes>
        <Route path="/" element={<TeacherHomeContent user={user} />} />
        <Route path="classes" element={<TeacherClassesContent />} />
        <Route path="classes/:classId/*" element={<ClassDetail />} />
        <Route path="vocabulary" element={<TeacherVocabularyManager />} />
        <Route path="audio" element={<TeacherAudioUpload />} />
        <Route path="profile" element={<UserProfile onLogout={onLogout} />} />
      </Routes>
    </TeacherLayout>
  )
}
