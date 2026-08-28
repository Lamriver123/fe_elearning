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
      >
        <div className="teacher-sidebar__logo">
          <span className="material-symbols-outlined" aria-hidden="true">workspace_premium</span>
        </div>
        <div>
          <h1 className="teacher-sidebar__title">Giáo viên</h1>
          <p className="teacher-sidebar__subtitle">Quản lý đào tạo</p>
        </div>
      </Link>

      <nav className="teacher-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `teacher-sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="teacher-sidebar__footer">
        <button
          onClick={() => void onLogout()}
          className="teacher-sidebar__nav-item teacher-sidebar__logout"
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
