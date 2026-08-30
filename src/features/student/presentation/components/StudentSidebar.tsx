import { NavLink, Link } from 'react-router-dom'

export function StudentSidebar() {
  const navItems = [
    { name: 'Trang chủ', path: '/student', icon: 'home', tone: 'blue' },
    { name: 'Lớp học của tôi', path: '/student/courses', icon: 'school', tone: 'mint' },
    { name: 'Đề thi', path: '/student/exams', icon: 'quiz', tone: 'orange' },
    { name: 'Từ vựng', path: '/student/vocabulary', icon: 'menu_book', tone: 'violet' },
    { name: 'Thông báo', path: '/student/notifications', icon: 'notifications', tone: 'rose' },
    { name: 'Thông tin cá nhân', path: '/student/profile', icon: 'person', tone: 'slate' },
  ]

  return (
    <aside className="student-sidebar">
      <Link
        to="/student"
        className="student-sidebar__brand"
      >
        <div className="student-sidebar__logo">
          <span className="material-symbols-outlined" aria-hidden="true">auto_stories</span>
        </div>
        <div>
          <h1 className="student-sidebar__title">E-Learning</h1>
          <p className="student-sidebar__subtitle">Học vui mỗi ngày</p>
        </div>
      </Link>

      <div className="student-sidebar__progress-card" aria-label="Tiến độ học tập">
        <div>
          <span>Tiến độ tuần</span>
          <strong>75%</strong>
        </div>
        <span className="student-sidebar__progress-track" aria-hidden="true">
          <span />
        </span>
      </div>

      <nav className="student-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/student'}
            className={({ isActive }) =>
              `student-sidebar__nav-item student-sidebar__nav-item--${item.tone} ${isActive ? 'active' : ''}`
            }
          >
            <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="student-sidebar__boost">
        <span className="material-symbols-outlined" aria-hidden="true">stars</span>
        <strong>Chinh phục mục tiêu</strong>
        <p>Hoàn thành một nhiệm vụ nhỏ hôm nay để giữ đà học tập.</p>
      </div>
    </aside>
  )
}
