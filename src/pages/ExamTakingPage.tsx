import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  Send,
  HelpCircle,
  X
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Exam, Question } from '../types';
import { useAuth } from '../context/AuthContext';

interface ExamTakingPageProps {
  examId: string;
  onNavigate: (route: string) => void;
}

export const ExamTakingPage: React.FC<ExamTakingPageProps> = ({ examId, onNavigate }) => {
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeExpiredAlert, setTimeExpiredAlert] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Exam Session
  useEffect(() => {
    const targetExam = storageService.getExamById(examId);
    if (!targetExam) {
      onNavigate('/exams');
      return;
    }
    const targetQuestions = storageService.getQuestionsByExamId(examId);
    if (targetQuestions.length === 0) {
      onNavigate('/exams');
      return;
    }

    setExam(targetExam);
    setQuestions(targetQuestions);

    // Check for existing active session in storage
    const activeSession = storageService.getActiveSession();
    if (activeSession && activeSession.examId === examId && activeSession.secondsRemaining > 0) {
      setAnswers(activeSession.answers || {});
      setFlagged(new Set(activeSession.flagged || []));
      setCurrentIndex(Math.min(activeSession.currentQuestionIndex || 0, targetQuestions.length - 1));
      setSecondsRemaining(activeSession.secondsRemaining);
      setTotalSeconds(activeSession.totalSeconds || targetExam.durationMinutes * 60);
    } else {
      const initialTotal = targetExam.durationMinutes * 60;
      setSecondsRemaining(initialTotal);
      setTotalSeconds(initialTotal);
      setAnswers({});
      setFlagged(new Set());
      setCurrentIndex(0);
      storageService.saveActiveSession({
        examId,
        answers: {},
        flagged: [],
        currentQuestionIndex: 0,
        secondsRemaining: initialTotal,
        totalSeconds: initialTotal,
      });
    }
  }, [examId, onNavigate]);

  // Submit assessment handler
  const handleSubmit = useCallback(
    (forcedByTimer = false) => {
      if (isSubmitting || !exam || !user) return;
      setIsSubmitting(true);

      const timeSpent = Math.max(1, totalSeconds - secondsRemaining);

      try {
        const attempt = storageService.submitAttempt(
          exam.id,
          user.id,
          user.name,
          user.email,
          answers,
          timeSpent,
          Array.from(flagged)
        );

        if (forcedByTimer) {
          setTimeExpiredAlert(true);
          setTimeout(() => {
            onNavigate(`/results/${attempt.id}`);
          }, 1500);
        } else {
          onNavigate(`/results/${attempt.id}`);
        }
      } catch (err) {
        console.error('Error submitting attempt:', err);
        setIsSubmitting(false);
      }
    },
    [isSubmitting, exam, user, totalSeconds, secondsRemaining, answers, flagged, onNavigate]
  );

  // Timer Countdown Effect
  useEffect(() => {
    if (secondsRemaining <= 0 && totalSeconds > 0) {
      // Time is up! Auto-submit
      handleSubmit(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        const updated = prev - 1;
        // Autosave session every tick
        if (exam) {
          storageService.saveActiveSession({
            examId: exam.id,
            answers,
            flagged: Array.from(flagged),
            currentQuestionIndex: currentIndex,
            secondsRemaining: updated,
            totalSeconds,
          });
        }
        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsRemaining, totalSeconds, exam, answers, flagged, currentIndex, handleSubmit]);

  // Answer selection handler
  const handleSelectOption = (questionId: string, optionId: string) => {
    const updated = { ...answers, [questionId]: optionId };
    setAnswers(updated);
    if (exam) {
      storageService.saveActiveSession({
        examId: exam.id,
        answers: updated,
        flagged: Array.from(flagged),
        currentQuestionIndex: currentIndex,
        secondsRemaining,
        totalSeconds,
      });
    }
  };

  // Toggle flag handler
  const handleToggleFlag = (questionId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      if (exam) {
        storageService.saveActiveSession({
          examId: exam.id,
          answers,
          flagged: Array.from(next),
          currentQuestionIndex: currentIndex,
          secondsRemaining,
          totalSeconds,
        });
      }
      return next;
    });
  };

  // Keyboard shortcut listener for options (1-4, A-D, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal || isSubmitting) return;

      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      // Numbers 1-4
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIndex = parseInt(e.key, 10) - 1;
        if (currentQ.options[optIndex]) {
          handleSelectOption(currentQ.id, currentQ.options[optIndex].id);
        }
      }

      // Keys A-D
      const keyUpper = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(keyUpper)) {
        const charCodeOffset = keyUpper.charCodeAt(0) - 65; // A=0, B=1...
        if (currentQ.options[charCodeOffset]) {
          handleSelectOption(currentQ.id, currentQ.options[charCodeOffset].id);
        }
      }

      // Arrow navigation
      if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, showSubmitModal, isSubmitting]);

  if (!exam || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Initializing assessment environment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const isCurrentFlagged = flagged.has(currentQuestion.id);

  // Time format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isLowTime = secondsRemaining <= 180; // under 3 minutes

  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Top Test Header Bar: Clean single row */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            {exam.category} Assessment
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {exam.title}
          </h2>
        </div>

        {/* Timer & Finish Button */}
        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm tabular-nums transition-colors ${
              isLowTime
                ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>{timeFormatted}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish Test</span>
          </button>
        </div>
      </div>

      {/* Main Examination Split: Question View + Navigator Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Question Header & Flag Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-400">
                  Single Choice ({currentQuestion.marks} Marks)
                </span>
              </div>

              <button
                onClick={() => handleToggleFlag(currentQuestion.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                  isCurrentFlagged
                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                    : 'text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{isCurrentFlagged ? 'Flagged' : 'Flag Question'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.text}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                const letter = letters[idx] || `${idx + 1}`;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all focus:outline-none ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {letter}
                    </div>
                    <div className="flex-1 text-sm text-slate-800 dark:text-slate-200 pt-0.5 leading-relaxed font-normal">
                      {opt.text}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons: Prev / Next */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {answers[currentQuestion.id] && (
                  <button
                    onClick={() => {
                      const updated = { ...answers };
                      delete updated[currentQuestion.id];
                      setAnswers(updated);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                  >
                    Clear answer
                  </button>
                )}
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Review & Submit</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Question Navigator Palette (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Question Navigator
            </h4>

            {/* Answered Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                <span>Completed</span>
                <span className="font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">
                  {answeredCount} / {questions.length}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Numbered Palette Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 pt-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                const isItemFlagged = flagged.has(q.id);

                let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                if (isCurrent) {
                  bgClass = 'bg-indigo-600 text-white border-indigo-600 font-bold ring-2 ring-indigo-300 dark:ring-indigo-900';
                } else if (isItemFlagged) {
                  bgClass = 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border font-mono text-xs flex items-center justify-center transition-all ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-700 inline-block" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-700 inline-block" />
                <span>Flagged for review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 inline-block" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirm Submission
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Are you ready to submit your exam attempt for final scoring?
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Checklist */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Questions:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {questions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Answered:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {answeredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Unanswered:</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    unansweredCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {unansweredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Time Remaining:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {timeFormatted}
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You have <span className="font-bold">{unansweredCount}</span> unanswered questions. Unanswered items receive 0 marks.
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Return to Test
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmit(false);
                }}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Scoring...' : 'Submit Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Expired Toast Overlay */}
      {timeExpiredAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto text-rose-600">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assessment Window Concluded
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your test time has expired. Your responses have been securely compiled and submitted for evaluation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
