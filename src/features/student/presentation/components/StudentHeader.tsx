import type { AuthUser } from '../../../auth/domain/auth.types.ts'

type StudentHeaderProps = {
  user: AuthUser
}

export function StudentHeader({ user }: StudentHeaderProps) {
  return (
    <header className="student-header">
      <div className="student-header__brand" style={{ display: 'none' }}>
        <span>E-Learning Platform</span>
      </div>

      <div className="student-header__actions">
        <div className="student-search">
          <span className="material-symbols-outlined student-search__icon" aria-hidden="true">search</span>
          <input 
            className="student-search__input" 
            placeholder="Tìm kiếm khoá học..." 
            type="text" 
          />
        </div>

        <div className="student-header__tools">
          <button aria-label="help" className="student-header__icon-btn">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button aria-label="settings" className="student-header__icon-btn">
            <span className="material-symbols-outlined">settings</span>
          </button>
          
          <button className="student-header__avatar" style={{ overflow: 'hidden', padding: 0 }}>
            <img 
              alt="User Avatar" 
              className="student-header__avatar" 
              style={{ width: '100%', height: '100%', margin: 0 }}
              src={user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXcASnBhKkXcMz-4dj_IFw3CDj_jXnA3gqpRXDfsIHyJu6wie-Nn9QZg1HWbRvNenu_DzUszh8ZzThvKwLCSGU7tmrxYZpfC3LL2LYmHkG25xXuGTrJ0BNcWrp4wHcqHCyV8JoBy5zdV4tZOhNBqnfcHjn5wC41IzLMW_jEvWQS3SVFK_r95dcfVyyypzq9UAAiP01ncQrMbnK2M8H9p3eISEEH7d_uOE5FGLCZLhywtx5j6I7QNaBig'} 
            />
          </button>
        </div>
      </div>
    </header>
  )
}
