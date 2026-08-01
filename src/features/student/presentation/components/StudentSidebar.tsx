import { NavLink, Link } from 'react-router-dom'

type StudentSidebarProps = {
  onLogout: () => Promise<void>
}

export function StudentSidebar({ onLogout }: StudentSidebarProps) {
  const navItems = [
    { name: 'Lớp học của tôi', path: '/student/courses', icon: 'school' },
    { name: 'Đề thi', path: '/student/exams', icon: 'quiz' },
    { name: 'Từ vựng', path: '/student/vocabulary', icon: 'menu_book' },
    { name: 'Thông báo', path: '/student/notifications', icon: 'notifications' },
    { name: 'Thông tin cá nhân', path: '/student/profile', icon: 'person' },
  ]

  return (
    <aside className="student-sidebar">
      <Link
        to="/student"
        className="student-sidebar__brand"
        style={{ textDecoration: 'none' }}
      >
        <div className="student-sidebar__logo">
          <span className="material-symbols-outlined">school</span>
        </div>
        <div>
          <h1 className="student-sidebar__title">Học sinh</h1>
          <p className="student-sidebar__subtitle">Tiến độ: 75%</p>
        </div>
      </Link>

      <nav className="student-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `student-sidebar__nav-item ${isActive ? 'active' : ''}`}
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

      <div className="student-sidebar__logout">
        <button
          onClick={() => void onLogout()}
          className="student-sidebar__nav-item"
          style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }}
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
