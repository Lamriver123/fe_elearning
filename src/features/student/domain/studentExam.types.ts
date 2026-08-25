export type StudentExamInfo = {
  id: string;
  title: string;
  description?: string;
  skillType: string;
  createMethod: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  classSettings?: {
    id: string;
    durationMinutes?: number;
    allowReview?: boolean;
    startTime?: string;
    endTime?: string;
  };
  isSubmitted?: boolean;
  totalPoints?: number;
};

export type StudentExamDetail = StudentExamInfo & {
  sections: StudentExamSection[];
};

export type StudentExamSection = {
  id: string;
  title: string;
  instructions: string;
  skillType: 'READING' | 'LISTENING' | 'SPEAKING' | 'WRITING';
  orderIndex: number;
  questions: StudentQuestion[];
  files?: any[];
};

export type StudentQuestion = {
  id: string;
  content: string;
  questionType: 'MULTIPLE_CHOICE' | 'ESSAY' | 'AUDIO_RESPONSE';
  points: number;
  options?: { id: string; content: string }[]; // Options for multiple choice (no isCorrect field!)
  orderIndex: number;
};

export type StudentAnswerPayload = {
  answers: {
    questionId: string;
    textAnswer?: string;
    selectedOptionId?: string;
    audioUrl?: string;
  }[];
};

export type ExamResult = {
  examId: string;
  totalScore: number;
  totalPoints: number;
  gradedAt: string;
};
