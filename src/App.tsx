import { lazy, Suspense, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/application/AuthProvider'
import { useAuth } from './features/auth/application/useAuth'
import { USER_ROLES } from './shared/constants/roles'

const LoginPage = lazy(() => import('./pages/Login.tsx'))
const RegisterPage = lazy(() => import('./pages/Register.tsx'))
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtp.tsx'))
const StudentHome = lazy(() => import('./pages/StudentHome.tsx'))
const TeacherDash = lazy(() => import('./pages/TeacherDash.tsx'))

const ROUTES = {
  login: '/login',
  register: '/register',
  verifyOtp: '/verify-otp',
  student: '/student',
  teacher: '/teacher',
} as const

function AppLoading() {
  return (
    <main className="auth-page auth-page--loading" aria-label="Đang kiểm tra phiên đăng nhập" aria-live="polite">
      <div className="app-loading">
        <div className="app-loading__brand" aria-hidden="true">
          <img className="app-loading__logo" src="/favicon.svg" alt="" />
        </div>
        <div className="app-loading__copy" aria-hidden="true">
          <span className="skeleton-line skeleton-line--lg" />
          <span className="skeleton-line skeleton-line--md" />
        </div>
      </div>
    </main>
  )
}

function ProtectedRoute({ allowedRole }: { allowedRole?: string }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <AppLoading />

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />
  }

  if (allowedRole && user?.role !== allowedRole) {
    const redirectPath = user?.role === USER_ROLES.TEACHER ? ROUTES.teacher : ROUTES.student
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

function AuthRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <AppLoading />

  if (isAuthenticated) {
    const redirectPath = user?.role === USER_ROLES.TEACHER ? ROUTES.teacher : ROUTES.student
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

function AppRoutes() {
  const { user, logout } = useAuth()
  const [registerEmail, setRegisterEmail] = useState('')
  const navigate = useNavigate()

  return (
    <Suspense fallback={<AppLoading />}>
      <Routes>
        <Route element={<AuthRoute />}>
          <Route path={ROUTES.login} element={<LoginPage onLoginSuccess={(session) => {
            navigate(session.user.role === USER_ROLES.TEACHER ? ROUTES.teacher : ROUTES.student, { replace: true })
          }} />} />
          
          <Route path={ROUTES.register} element={<RegisterPage onRegisterSuccess={(email) => {
            setRegisterEmail(email)
            navigate(ROUTES.verifyOtp)
          }} />} />
          
          <Route path={ROUTES.verifyOtp} element={
            registerEmail ? 
            <VerifyOtpPage email={registerEmail} onVerifySuccess={() => navigate(ROUTES.login, { replace: true })} /> 
            : <Navigate to={ROUTES.register} replace />
          } />
        </Route>

        <Route element={<ProtectedRoute allowedRole={USER_ROLES.STUDENT} />}>
          <Route path={`${ROUTES.student}/*`} element={user ? <StudentHome user={user} onLogout={logout} /> : null} />
        </Route>

        <Route element={<ProtectedRoute allowedRole={USER_ROLES.TEACHER} />}>
          <Route path={`${ROUTES.teacher}/*`} element={user ? <TeacherDash user={user} onLogout={logout} /> : null} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
