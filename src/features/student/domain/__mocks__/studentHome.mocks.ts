import type { Course, Schedule, StudentStats } from '../student.types'

export const MOCK_STATS: StudentStats = {
  streakDays: 5,
  completedExercises: 24,
  totalExercises: 30
}

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Tiếng Anh Giao Tiếp Cơ Bản',
    teacher: 'Ms. Cheese',
    progress: 45,
    completedLessons: 5,
    totalLessons: 12,
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhNVzQDI_wADpWGejXKBu_7mQj72FWg9xAsEdbaJIA12bqY1S-tPjJD4B_nYTGnsz7lGcFVmR2-oKJ5H5A0UICZNPyPkkymla3t0bQmm_y_sflnAvFWrdw9tQVh4DItOhn9qUaZAzBpG5XJYYZa8yOaZuugXJHzb4T9KgEKjhC5H5LLfGrEEf6t4gZymJCVsBWSOCL1Z7BaJlq00YhuEUNKaJKDFAv9f8p9_T8OqCOCxiOInJT2Q6xRw'
  },
  {
    id: '2',
    title: 'Toán Tư Duy Lớp 5 - Nâng Cao',
    teacher: 'Thầy Phong',
    progress: 80,
    completedLessons: 16,
    totalLessons: 20,
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbPi1_HWwyAOqNAqZBDiDSYKPviQBwnc4GlxHiKlj2FWXAFks1M1wUGASOPPsYTqMr7RVjXvna4HS0tkmxYeqjKIrPxaOZo7NWXE-U18nAKSrXHeiWewZVR90u4mNVxltEKRUadtfMCrQf_78TJ4zKXf7iS7E1Rc7T4GP9qscXQqb6hCgW-sJRmSFJZtesnJVfipYiGRmumsKQ3fSPE5ILJZ037UB05_zcu_32Hk4LR2-IZlm3waimGg'
  }
]

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: '1',
    title: 'Tiếng Anh Giao Tiếp',
    dayOfWeek: 'Thứ 3',
    date: 15,
    time: '19:00 - 20:30',
    type: 'zoom'
  },
  {
    id: '2',
    title: 'Toán Tư Duy Lớp 5',
    dayOfWeek: 'Thứ 5',
    date: 17,
    time: '18:00 - 19:30',
    type: 'offline'
  }
]
