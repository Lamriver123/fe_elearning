import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { AuthUser } from '../features/auth/domain/auth.types'
import { StudentLayout } from '../features/student/presentation/components/StudentLayout'
import { WelcomeSection } from '../features/student/presentation/components/WelcomeSection'
import { CourseList } from '../features/student/presentation/components/CourseList'
import { ScheduleList } from '../features/student/presentation/components/ScheduleList'
const StudentClasses = lazy(() => import('../features/student/presentation/components/StudentClasses').then((module) => ({ default: module.StudentClasses })))
const StudentClassDetail = lazy(() => import('../features/student/presentation/components/StudentClassDetail').then((module) => ({ default: module.StudentClassDetail })))
const StudentAllExamsPage = lazy(() => import('../features/student/presentation/components/StudentQuickPages').then((module) => ({ default: module.StudentAllExamsPage })))
const StudentNotificationsPage = lazy(() => import('../features/student/presentation/components/StudentQuickPages').then((module) => ({ default: module.StudentNotificationsPage })))
const StudentVocabularyPage = lazy(() => import('../features/vocabulary/presentation/components/StudentVocabularyPage').then((module) => ({ default: module.StudentVocabularyPage })))
const UserProfile = lazy(() => import('./UserProfile.tsx'))

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

function StudentRouteLoading() {
  return (
    <div className="surface-card page-state" aria-label="Đang tải nội dung">
      <span className="skeleton-line skeleton-line--lg" />
      <span className="skeleton-line skeleton-line--md" />
      <span className="skeleton-line skeleton-line--sm" />
    </div>
  )
}

function StudentHome({ user, onLogout }: StudentHomeProps) {
  return (
    <StudentLayout user={user}>
      <Suspense fallback={<StudentRouteLoading />}>
        <Routes>
          <Route path="/" element={<StudentDashboardContent user={user} />} />
          <Route path="courses" element={<StudentClasses />} />
          <Route path="courses/:classId/*" element={<StudentClassDetail />} />
          <Route path="exams" element={<StudentAllExamsPage />} />
          <Route path="vocabulary" element={<StudentVocabularyPage />} />
          <Route path="notifications" element={<StudentNotificationsPage />} />
          <Route path="profile" element={<UserProfile onLogout={onLogout} />} />
        </Routes>
      </Suspense>
    </StudentLayout>
  )
}

export default StudentHome
