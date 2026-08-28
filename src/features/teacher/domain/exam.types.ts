export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'SHORT_ANSWER'
  | 'ESSAY'
  | 'AUDIO_RESPONSE'
  | 'MATCHING'
  | 'ORDERING';

export type SkillType = 'READING' | 'LISTENING' | 'SPEAKING' | 'WRITING' | 'MIXED';

export type ExamFile = {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: 'AUDIO' | 'IMAGE' | 'PDF' | 'DOCUMENT' | 'VIDEO';
  purpose?: string;
  fileSize?: number;
  uploadedAt?: string;
};

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
  files?: ExamFile[];
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
  skillType: SkillType;
  createMethod: Exam['createMethod'];
  durationMinutes?: number;
};

export type UpdateExamPayload = Partial<Pick<Exam, 'title' | 'description'>> & {
  durationMinutes?: number | null;
};

export type ExamSubmissionSummary = {
  id?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  submittedAt: string;
  totalScore?: number | null;
  maxScore?: number | null;
  status?: 'SUBMITTED' | 'GRADED' | string;
};

export type GradePayload = {
  grades: Array<{
    answerId: string;
    score: number;
    teacherComment?: string;
  }>;
};

export type SectionPayload = {
  title: string;
  instructions?: string;
  skillType?: SkillType;
  orderIndex?: number;
  pointsPerQuestion?: number;
};

export type QuestionPayload = {
  questionType: QuestionType;
  content: string;
  explanation?: string;
  points: number;
  orderIndex?: number;
  options?: Array<{
    id?: string;
    label?: string;
    content: string;
    isCorrect?: boolean;
    orderIndex?: number;
  }>;
};

export type ExcelImportOptionPreview = {
  content: string;
  isCorrect?: boolean;
};

export type ExcelImportQuestionPreview = {
  content: string;
  questionType?: QuestionType;
  points?: number;
  options?: ExcelImportOptionPreview[];
};

export type ExcelImportSectionPreview = {
  title: string;
  instructions?: string;
  skillType?: SkillType;
  questions: ExcelImportQuestionPreview[];
};

export type ExcelImportPreview = {
  sections: ExcelImportSectionPreview[];
};
