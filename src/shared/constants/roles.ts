export const USER_ROLES = {
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
