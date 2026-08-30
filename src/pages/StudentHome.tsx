import { Routes, Route } from 'react-router-dom'
import type { AuthUser } from '../features/auth/domain/auth.types'
import { StudentLayout } from '../features/student/presentation/components/StudentLayout'
import { WelcomeSection } from '../features/student/presentation/components/WelcomeSection'
import { CourseList } from '../features/student/presentation/components/CourseList'
import { ScheduleList } from '../features/student/presentation/components/ScheduleList'
import { StudentClasses } from '../features/student/presentation/components/StudentClasses'
import { StudentClassDetail } from '../features/student/presentation/components/StudentClassDetail'
import { StudentAllExamsPage, StudentNotificationsPage } from '../features/student/presentation/components/StudentQuickPages'
import { StudentVocabularyPage } from '../features/vocabulary/presentation/components/StudentVocabularyPage'
import UserProfile from './UserProfile.tsx'

type StudentHomeProps = {
  user: AuthUser
  onLogout: () => Promise<void>
}

import { MOCK_STATS, MOCK_COURSES, MOCK_SCHEDULES } from '../features/student/domain/__mocks__/studentHome.mocks'

function StudentDashboardContent({ user }: { user: AuthUser }) {
  return (
    <>
      <WelcomeSection user={user} stats={MOCK_STATS} />
      <div className="student-grid">
        <CourseList courses={MOCK_COURSES} />
        <ScheduleList schedules={MOCK_SCHEDULES} />
      </div>
    </>
  )
}

function StudentHome({ user, onLogout }: StudentHomeProps) {
  return (
    <StudentLayout user={user}>
      <Routes>
        <Route path="/" element={<StudentDashboardContent user={user} />} />
        <Route path="courses" element={<StudentClasses />} />
        <Route path="courses/:classId/*" element={<StudentClassDetail />} />
        <Route path="exams" element={<StudentAllExamsPage />} />
        <Route path="vocabulary" element={<StudentVocabularyPage />} />
        <Route path="notifications" element={<StudentNotificationsPage />} />
        <Route path="profile" element={<UserProfile onLogout={onLogout} />} />
      </Routes>
    </StudentLayout>
  )
}

export default StudentHome
