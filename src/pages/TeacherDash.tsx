import { useState } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
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
  const shortcuts = [
    {
      to: '/teacher/classes',
      icon: 'school',
      label: 'Lớp học',
      description: 'Theo dõi lớp, học sinh và lời mời.',
    },
    {
      to: '/teacher/exams',
      icon: 'assignment',
      label: 'Đề thi',
      description: 'Tạo đề, quản lý bài nộp và chấm điểm.',
    },
    {
      to: '/teacher/vocabulary',
      icon: 'menu_book',
      label: 'Từ vựng',
      description: 'Import danh mục, gán lớp và review đặt câu.',
    },
    {
      to: '/teacher/audio',
      icon: 'graphic_eq',
      label: 'Audio',
      description: 'Upload hoặc cắt audio phát âm.',
    },
  ]

  return (
    <div className="teacher-content-container">
      <div className="teacher-page-header">
        <div>
          <h1>Tổng quan</h1>
          <p>Chào mừng bạn quay trở lại, {user.fullName}!</p>
        </div>
      </div>
      
      <div className="teacher-home-grid">
        {shortcuts.map((shortcut) => (
          <Link className="teacher-home-shortcut surface-card" to={shortcut.to} key={shortcut.to}>
            <span className="material-symbols-outlined teacher-home-shortcut__icon" aria-hidden="true">
              {shortcut.icon}
            </span>
            <strong>{shortcut.label}</strong>
            <span>{shortcut.description}</span>
          </Link>
        ))}
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
