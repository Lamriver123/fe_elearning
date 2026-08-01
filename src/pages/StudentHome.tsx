import { Routes, Route } from 'react-router-dom'
import type { AuthUser } from '../features/auth/domain/auth.types'
import { StudentLayout } from '../features/student/presentation/components/StudentLayout'
import { WelcomeSection } from '../features/student/presentation/components/WelcomeSection'
import { CourseList } from '../features/student/presentation/components/CourseList'
import { ScheduleList } from '../features/student/presentation/components/ScheduleList'
import type { Course, Schedule, StudentStats } from '../features/student/domain/student.types'
import { StudentClasses } from '../features/student/presentation/components/StudentClasses'

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
    <StudentLayout user={user} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<StudentDashboardContent user={user} />} />
        <Route path="courses/*" element={<StudentClasses />} />
      </Routes>
    </StudentLayout>
  )
}

export default StudentHome

