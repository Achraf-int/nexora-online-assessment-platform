import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Share2,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import { ExamAttempt, Question, Exam } from '../types';

interface ResultPageProps {
  attemptId: string;
  onNavigate: (route: string) => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ attemptId, onNavigate }) => {
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const att = storageService.getAttemptById(attemptId);
    if (!att) {
      onNavigate('/results');
      return;
    }
    setAttempt(att);
    const ex = storageService.getExamById(att.examId);
    if (ex) setExam(ex);
    const qs = storageService.getQuestionsByExamId(att.examId);
    setQuestions(qs);

    // Trigger celebratory confetti if passed!
    if (att.passed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#8B5CF6', '#14B8A6', '#10B981'],
      });
    }
  }, [attemptId, onNavigate]);

  if (!attempt || !exam) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading assessment evaluation report...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  questions.forEach((q) => {
    const selected = attempt.answers[q.id];
    if (!selected) {
      unattemptedCount++;
    } else if (selected === q.correctOptionId) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  const minutesSpent = Math.floor(attempt.timeSpentSeconds / 60);
  const secondsSpent = attempt.timeSpentSeconds % 60;
  const timeFormatted = `${minutesSpent}m ${secondsSpent}s`;

  const toggleExplanation = (questionId: string) => {
    setExpandedExplanation((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/results')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Results</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(`/exam-taking/${exam.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Exam</span>
          </button>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none ${
            attempt.passed ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {attempt.examCategory}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-400 tabular-nums">
                {new Date(attempt.endTime || attempt.startTime).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {attempt.examTitle}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Candidate: <span className="font-semibold text-slate-700 dark:text-slate-300">{attempt.userName}</span> ({attempt.userEmail})
            </p>
          </div>

          {/* Big Score Badge */}
          <div className="flex flex-col items-center sm:items-end shrink-0">
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tabular-nums">
                {attempt.percentage}%
              </span>
            </div>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  attempt.passed
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {attempt.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{attempt.passed ? 'PASSED (Target Met)' : 'NOT PASSED'}</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 tabular-nums font-mono">
              Required to Pass: {attempt.passingScorePercentage}%
            </span>
          </div>
        </div>

        {/* Detailed Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">RAW SCORE</span>
            <span className="font-mono font-bold text-base text-slate-900 dark:text-white tabular-nums">
              {attempt.score} / {attempt.maxScore}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">CORRECT ANSWERS</span>
            <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
              {correctCount} questions
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">INCORRECT / MISSED</span>
            <span className="font-mono font-bold text-base text-rose-600 dark:text-rose-400 tabular-nums">
              {incorrectCount + unattemptedCount} questions
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">TIME TAKEN</span>
            <span className="font-mono font-bold text-base text-slate-900 dark:text-white tabular-nums">
              {timeFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Question-by-Question Review Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Question-by-Question Diagnostic Review
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Detailed breakdown of your submitted choices, correct keys, and technical explanations.
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userChoiceId = attempt.answers[q.id];
            const isCorrect = userChoiceId === q.correctOptionId;
            const isUnanswered = !userChoiceId;
            const isExpanded = expandedExplanation[q.id] ?? true; // default expanded

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        Question {idx + 1}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : isUnanswered
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {isCorrect ? 'Correct (+10)' : isUnanswered ? 'Unanswered (0)' : 'Incorrect (0)'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white pt-1 leading-relaxed">
                      {q.text}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleExplanation(q.id)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    title={isExpanded ? 'Collapse analysis' : 'Expand analysis'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Options Review */}
                <div className="space-y-2 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isUserPick = userChoiceId === opt.id;
                    const isActualCorrect = q.correctOptionId === opt.id;

                    let optionBorder = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300';
                    let badgeLabel = null;

                    if (isActualCorrect) {
                      optionBorder = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-medium ring-1 ring-emerald-500';
                      badgeLabel = 'Correct Answer';
                    } else if (isUserPick && !isCorrect) {
                      optionBorder = 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500';
                      badgeLabel = 'Your Selection (Incorrect)';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${optionBorder}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-[11px] w-5 text-center">
                            {letters[optIdx]}.
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        {badgeLabel && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                              isActualCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {badgeLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {isExpanded && (
                  <div className="p-3.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 block">
                      Rationale & Explanation
                    </span>
                    <p className="text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
