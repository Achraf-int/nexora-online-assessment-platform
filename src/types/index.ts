export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: string;
  department?: string;
  joinedDate: string;
}

export type ExamDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  marks: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: ExamDifficulty;
  durationMinutes: number;
  passingScorePercentage: number;
  totalQuestions: number;
  isPublished: boolean;
  createdAt: string;
  tags: string[];
  rules: string[];
}

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  examCategory: string;
  userId: string;
  userName: string;
  userEmail: string;
  startTime: string;
  endTime?: string;
  timeSpentSeconds: number;
  answers: Record<string, string>; // questionId -> optionId
  flaggedQuestions?: string[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScorePercentage: number;
  status: AttemptStatus;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'EXAM' | 'RESULT' | 'SYSTEM';
  linkRoute?: string;
}

export interface DummyProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  reviews?: Array<{
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
  }>;
}

export interface DummyProductsResponse {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}
