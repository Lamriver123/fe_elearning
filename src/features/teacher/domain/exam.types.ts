export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'FILL_IN_THE_BLANK'
  | 'ESSAY'
  | 'SPEAKING'
  | 'LISTENING'
  | 'MATCHING';

export type SkillType = 'READING' | 'LISTENING' | 'SPEAKING' | 'WRITING' | 'GENERAL';

export type QuestionOption = {
  id: string;
  label?: string;
  content: string;
  isCorrect?: boolean;
  orderIndex: number;
};

export type Question = {
  id: string;
  questionType: QuestionType;
  content: string;
  explanation?: string;
  points: number;
  orderIndex: number;
  options?: QuestionOption[];
};

export type ExamSection = {
  id: string;
  title: string;
  instructions?: string;
  skillType?: SkillType;
  orderIndex: number;
  pointsPerQuestion?: number;
  questions?: Question[];
  files?: any[];
};

export type Exam = {
  id: string;
  title: string;
  description?: string;
  status: ExamStatus;
  createMethod: 'MANUAL' | 'FILE_UPLOAD' | 'EXCEL_IMPORT';
  skillType: SkillType;
  createdAt: string;
  updatedAt: string;
  classSettings?: ExamClassSettings;
  sections?: ExamSection[];
};

export type ExamClassSettings = {
  id: string;
  durationMinutes: number;
  allowReview: boolean;
  startTime?: string;
  endTime?: string;
};

export type CreateExamPayload = {
  title: string;
  description?: string;
  skillType: string;
  createMethod: string;
  durationMinutes?: number;
};
