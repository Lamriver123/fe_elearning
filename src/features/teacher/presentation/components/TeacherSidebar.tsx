import { NavLink, Link } from 'react-router-dom'

type TeacherSidebarProps = {
  onLogout: () => Promise<void>
}

export function TeacherSidebar({ onLogout }: TeacherSidebarProps) {
  const navItems = [
    { name: 'Quản lý lớp học', path: '/teacher/classes', icon: 'school' },
    { name: 'Quản lý đề thi', path: '/teacher/exams', icon: 'quiz' },
    { name: 'Quản lý từ vựng', path: '/teacher/vocabulary', icon: 'menu_book' },
    { name: 'Thông báo', path: '/teacher/notifications', icon: 'notifications' },
    { name: 'Thông tin cá nhân', path: '/teacher/profile', icon: 'person' },
  ]

  return (
    <aside className="teacher-sidebar">
      <Link 
        to="/teacher" 
        className="teacher-sidebar__brand"
        style={{ textDecoration: 'none' }}
      >
        <span className="teacher-sidebar__brand-text">Teacher Dashboard</span>
      </Link>

      <div className="teacher-sidebar__section-title">
        E-learning Portal
      </div>

      <nav className="teacher-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `teacher-sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <span 
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="teacher-sidebar__footer">
        <button
          onClick={() => void onLogout()}
          className="teacher-sidebar__nav-item teacher-sidebar__logout"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
