export type Course = {
  id: string
  title: string
  teacher: string
  progress: number
  totalLessons: number
  completedLessons: number
  thumbnailUrl: string
}

export type Schedule = {
  id: string
  title: string
  dayOfWeek: string
  date: number
  time: string
  type: 'zoom' | 'offline' | 'other'
}

export type StudentStats = {
  streakDays: number
  completedExercises: number
  totalExercises: number
}
