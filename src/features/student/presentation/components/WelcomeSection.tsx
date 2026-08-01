import { type AuthUser } from '../../../auth/domain/auth.types'
import { type StudentStats } from '../../domain/student.types'

type WelcomeSectionProps = {
  user: AuthUser
  stats: StudentStats
}

export function WelcomeSection({ user, stats }: WelcomeSectionProps) {
  return (
    <section className="student-welcome">
      <div className="student-welcome__greeting">
        <div className="student-welcome__bg-shape"></div>
        <div className="student-welcome__content">
          <h2 className="student-welcome__title">Chào mừng trở lại, {user.fullName}!</h2>
          <p className="student-welcome__desc">
            Bạn đã hoàn thành 2 bài học trong tuần này. Tiếp tục phát huy nhé!
          </p>
          <button className="student-welcome__btn">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
            Tiếp tục học
          </button>
        </div>
      </div>

      <div className="student-welcome__stats">
        <div className="student-stat-card">
          <div className="student-stat-card__icon student-stat-card__icon--streak">
            <span className="material-symbols-outlined">local_fire_department</span>
          </div>
          <div>
            <p className="student-stat-card__label">Chuỗi ngày học</p>
            <p className="student-stat-card__value">{stats.streakDays} Ngày</p>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-card__icon student-stat-card__icon--task">
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <div>
            <p className="student-stat-card__label">Bài tập hoàn thành</p>
            <p className="student-stat-card__value">{stats.completedExercises}/{stats.totalExercises}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
