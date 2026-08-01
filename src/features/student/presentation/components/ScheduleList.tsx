import { type Schedule } from '../../domain/student.types'

type ScheduleListProps = {
  schedules: Schedule[]
}

export function ScheduleList({ schedules }: ScheduleListProps) {
  return (
    <aside className="student-schedule">
      <h3 className="student-schedule__title">Lịch học sắp tới</h3>
      
      <div className="student-schedule__container">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="schedule-item">
            <div className={`schedule-item__date ${schedule.id === '1' ? '' : 'schedule-item__date--normal'}`}>
              <span className="schedule-item__day">{schedule.dayOfWeek}</span>
              <span className="schedule-item__num">{schedule.date}</span>
            </div>
            
            <div className="schedule-item__details">
              <h4>{schedule.title}</h4>
              <p className="schedule-item__time">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                {schedule.time}
              </p>
              {schedule.type === 'zoom' && (
                <div className="schedule-item__type">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>videocam</span>
                  Zoom
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="promo-card">
        <div className="promo-card__bg"></div>
        <div className="promo-card__content">
          <h4 className="promo-card__title">Kiểm tra năng lực</h4>
          <p className="promo-card__desc">
            Làm bài test 15 phút để đánh giá trình độ hiện tại.
          </p>
          <button className="promo-card__btn">Bắt đầu ngay</button>
        </div>
      </div>
    </aside>
  )
}
