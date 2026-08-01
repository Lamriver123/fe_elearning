import { type Course } from '../../domain/student.types'

type CourseListProps = {
  courses: Course[]
}

export function CourseList({ courses }: CourseListProps) {
  return (
    <section className="student-courses">
      <div className="student-courses__header">
        <h3 className="student-courses__title">Lớp học của tôi</h3>
        <a className="student-courses__link" href="/courses">Xem tất cả</a>
      </div>
      
      <div className="student-courses__list">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-card__image-wrapper">
              <img 
                alt={course.title} 
                className="course-card__image" 
                src={course.thumbnailUrl} 
              />
              <div className="course-card__badge">{course.progress}%</div>
            </div>
            
            <div className="course-card__content">
              <h4 className="course-card__title" title={course.title}>
                {course.title}
              </h4>
              <p className="course-card__teacher">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span> 
                {course.teacher}
              </p>
              
              <div className="course-card__footer">
                <div className="course-progress">
                  <div 
                    className="course-progress__bar" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="course-card__meta">
                  Bài {course.completedLessons}/{course.totalLessons}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
