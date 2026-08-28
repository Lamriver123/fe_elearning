import { Link } from 'react-router-dom'
import { type Course } from '../../domain/student.types'

type CourseListProps = {
  courses: Course[]
}

export function CourseList({ courses }: CourseListProps) {
  return (
    <section className="student-courses">
      <div className="student-courses__header">
        <h3 className="student-courses__title">Lớp học của tôi</h3>
        <Link className="student-courses__link" to="/student/courses">Xem tất cả</Link>
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
                <span className="material-symbols-outlined" aria-hidden="true">person</span> 
                {course.teacher}
              </p>
              
              <div className="course-card__footer">
                <div className="course-progress">
                  <progress className="course-progress__native" value={course.progress} max={100} aria-label={`Tiến độ ${course.progress}%`} />
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
