import { Exam, Question, ExamAttempt, AppNotification, User } from '../types';
import { INITIAL_EXAMS, INITIAL_QUESTIONS, INITIAL_ATTEMPTS, INITIAL_NOTIFICATIONS, INITIAL_USERS } from '../data/seedData';

const KEYS = {
  EXAMS: 'nexora_exams_v1',
  QUESTIONS: 'nexora_questions_v1',
  ATTEMPTS: 'nexora_attempts_v1',
  NOTIFICATIONS: 'nexora_notifications_v1',
  USERS: 'nexora_users_v1',
  ACTIVE_EXAM_SESSION: 'nexora_active_session_v1',
  THEME: 'nexora_theme_preference',
};

// Initialize localStorage on first load
function initStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(KEYS.EXAMS)) {
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
  }
  if (!localStorage.getItem(KEYS.QUESTIONS)) {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  }
  if (!localStorage.getItem(KEYS.ATTEMPTS)) {
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
}

initStorage();

export const storageService = {
  // Exams
  getExams(): Exam[] {
    initStorage();
    try {
      const data = localStorage.getItem(KEYS.EXAMS);
      return data ? JSON.parse(data) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  },

  getExamById(id: string): Exam | undefined {
    const exams = this.getExams();
    return exams.find((e) => e.id === id);
  },

  saveExam(exam: Exam): void {
    const exams = this.getExams();
    const index = exams.findIndex((e) => e.id === exam.id);
    if (index >= 0) {
      exams[index] = exam;
    } else {
      exams.unshift(exam);
    }
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
  },

  deleteExam(id: string): void {
    const exams = this.getExams().filter((e) => e.id !== id);
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
    // Also remove associated questions
    const questions = this.getQuestions().filter((q) => q.examId !== id);
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  },

  toggleExamPublish(id: string): Exam | undefined {
    const exams = this.getExams();
    const exam = exams.find((e) => e.id === id);
    if (exam) {
      exam.isPublished = !exam.isPublished;
      localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
    }
    return exam;
  },

  // Questions
  getQuestions(): Question[] {
    initStorage();
    try {
      const data = localStorage.getItem(KEYS.QUESTIONS);
      return data ? JSON.parse(data) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  },

  getQuestionsByExamId(examId: string): Question[] {
    return this.getQuestions().filter((q) => q.examId === examId);
  },

  saveQuestion(question: Question): void {
    const questions = this.getQuestions();
    const index = questions.findIndex((q) => q.id === question.id);
    if (index >= 0) {
      questions[index] = question;
    } else {
      questions.push(question);
    }
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));

    // Update total questions count in Exam
    const exams = this.getExams();
    const exam = exams.find((e) => e.id === question.examId);
    if (exam) {
      exam.totalQuestions = questions.filter((q) => q.examId === exam.id).length;
      localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
    }
  },

  deleteQuestion(id: string): void {
    const questions = this.getQuestions();
    const target = questions.find((q) => q.id === id);
    const updated = questions.filter((q) => q.id !== id);
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(updated));

    if (target) {
      const exams = this.getExams();
      const exam = exams.find((e) => e.id === target.examId);
      if (exam) {
        exam.totalQuestions = updated.filter((q) => q.examId === exam.id).length;
        localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
      }
    }
  },

  // Attempts
  getAttempts(): ExamAttempt[] {
    initStorage();
    try {
      const data = localStorage.getItem(KEYS.ATTEMPTS);
      return data ? JSON.parse(data) : INITIAL_ATTEMPTS;
    } catch {
      return INITIAL_ATTEMPTS;
    }
  },

  getAttemptById(id: string): ExamAttempt | undefined {
    return this.getAttempts().find((a) => a.id === id);
  },

  getAttemptsByUser(userId: string): ExamAttempt[] {
    return this.getAttempts().filter((a) => a.userId === userId);
  },

  submitAttempt(
    examId: string,
    userId: string,
    userName: string,
    userEmail: string,
    answers: Record<string, string>,
    timeSpentSeconds: number,
    flaggedQuestions: string[] = []
  ): ExamAttempt {
    const exam = this.getExamById(examId);
    if (!exam) throw new Error('Exam not found');

    const questions = this.getQuestionsByExamId(examId);
    let earnedMarks = 0;
    let totalMarks = 0;

    questions.forEach((q) => {
      totalMarks += q.marks || 10;
      const selected = answers[q.id];
      if (selected === q.correctOptionId) {
        earnedMarks += q.marks || 10;
      }
    });

    const percentage = totalMarks > 0 ? Number(((earnedMarks / totalMarks) * 100).toFixed(1)) : 0;
    const passed = percentage >= exam.passingScorePercentage;

    const newAttempt: ExamAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      examId: exam.id,
      examTitle: exam.title,
      examCategory: exam.category,
      userId,
      userName,
      userEmail,
      startTime: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      timeSpentSeconds,
      answers,
      flaggedQuestions,
      score: earnedMarks,
      maxScore: totalMarks,
      percentage,
      passed,
      passingScorePercentage: exam.passingScorePercentage,
      status: 'SUBMITTED',
    };

    const attempts = this.getAttempts();
    attempts.unshift(newAttempt);
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));

    // Clear active test session in storage
    this.clearActiveSession();

    // Add a result notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `${exam.title} Result`,
      message: `You completed ${exam.title} with a score of ${percentage}% (${passed ? 'PASSED' : 'NOT PASSED'}).`,
      date: new Date().toISOString(),
      read: false,
      type: 'RESULT',
      linkRoute: `/results/${newAttempt.id}`,
    });
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));

    return newAttempt;
  },

  // Active exam session persistence (for auto-saving answers & surviving refresh)
  saveActiveSession(session: {
    attemptId?: string;
    examId: string;
    answers: Record<string, string>;
    flagged: string[];
    currentQuestionIndex: number;
    secondsRemaining: number;
    totalSeconds: number;
  }): void {
    localStorage.setItem(KEYS.ACTIVE_EXAM_SESSION, JSON.stringify(session));
  },

  getActiveSession(): {
    attemptId?: string;
    examId: string;
    answers: Record<string, string>;
    flagged: string[];
    currentQuestionIndex: number;
    secondsRemaining: number;
    totalSeconds: number;
  } | null {
    try {
      const data = localStorage.getItem(KEYS.ACTIVE_EXAM_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearActiveSession(): void {
    localStorage.removeItem(KEYS.ACTIVE_EXAM_SESSION);
  },

  // Notifications
  getNotifications(): AppNotification[] {
    initStorage();
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.read = true;
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
  },

  markAllNotificationsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  // Reset to seed data
  resetAllData(): void {
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.removeItem(KEYS.ACTIVE_EXAM_SESSION);
  },
};
