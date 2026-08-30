import { type AuthUser } from '../../../auth/domain/auth.types'
import { type StudentStats } from '../../domain/student.types'
import { Link } from 'react-router-dom'

type WelcomeSectionProps = {
  user: AuthUser
  stats: StudentStats
}

export function WelcomeSection({ user, stats }: WelcomeSectionProps) {
  const completedPercent = Math.round((stats.completedExercises / Math.max(1, stats.totalExercises)) * 100)

  return (
    <section className="student-welcome">
      <div className="student-welcome__hero">
        <span className="student-welcome__eyebrow">
          <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
          Kế hoạch hôm nay
        </span>
        <h2 className="student-welcome__title">Cố lên nào, {user.fullName}!</h2>
        <p className="student-welcome__desc">
          Hoàn thành một vòng từ vựng, một bài kiểm tra nhỏ và giữ đà học tập của bạn.
        </p>
        <div className="student-welcome__actions">
          <Link className="student-welcome__btn" to="/student/vocabulary">
            <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
            Tiếp tục học
          </Link>
          <span className="student-welcome__mini-goal">
            <span className="material-symbols-outlined" aria-hidden="true">flag</span>
            Mục tiêu ngày: 20 phút
          </span>
        </div>
      </div>

      <div className="student-welcome__stats" aria-label="Tóm tắt tiến độ">
        <article className="student-stat-card student-stat-card--streak">
          <span className="student-stat-card__icon">
            <span className="material-symbols-outlined" aria-hidden="true">local_fire_department</span>
          </span>
          <div>
            <p className="student-stat-card__label">Chuỗi ngày học</p>
            <p className="student-stat-card__value">{stats.streakDays} ngày</p>
          </div>
        </article>

        <article className="student-stat-card student-stat-card--task">
          <span className="student-stat-card__icon">
            <span className="material-symbols-outlined" aria-hidden="true">task_alt</span>
          </span>
          <div>
            <p className="student-stat-card__label">Bài tập hoàn thành</p>
            <p className="student-stat-card__value">{stats.completedExercises}/{stats.totalExercises}</p>
          </div>
        </article>

        <article className="student-stat-card student-stat-card--accuracy">
          <span className="student-stat-card__icon">
            <span className="material-symbols-outlined" aria-hidden="true">track_changes</span>
          </span>
          <div>
            <p className="student-stat-card__label">Độ phủ nhiệm vụ</p>
            <p className="student-stat-card__value">{completedPercent}%</p>
          </div>
        </article>
      </div>

      <div className="student-today-panel">
        <div className="student-today-panel__head">
          <div>
            <h3>Nhiệm vụ hôm nay</h3>
            <p>Hoàn thành từng chút một, tiến bộ sẽ cộng dồn.</p>
          </div>
          <span>+40 XP</span>
        </div>

        <div className="student-task-list">
          {[
            { icon: 'menu_book', title: 'Ôn tập từ vựng', done: 1, total: 5, tone: 'violet' },
            { icon: 'quiz', title: 'Làm một đề ngắn', done: 0, total: 1, tone: 'orange' },
            { icon: 'school', title: 'Xem lớp đang học', done: 2, total: 4, tone: 'mint' },
          ].map((task) => (
            <div className={`student-task student-task--${task.tone}`} key={task.title}>
              <span className="material-symbols-outlined" aria-hidden="true">{task.icon}</span>
              <div>
                <strong>{task.title}</strong>
                <span className="student-task__track" aria-hidden="true">
                  <span style={{ width: `${Math.round((task.done / task.total) * 100)}%` }} />
                </span>
              </div>
              <em>{task.done}/{task.total}</em>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
