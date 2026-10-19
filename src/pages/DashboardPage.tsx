import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Exam, ExamAttempt } from '../types';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    setExams(storageService.getExams().filter((e) => e.isPublished));
    if (user) {
      setAttempts(storageService.getAttemptsByUser(user.id));
    }
  }, [user]);

  // Derive genuine stats from user attempts
  const completedCount = attempts.length;
  const passedCount = attempts.filter((a) => a.passed).length;
  const passRate = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0;
  const avgScore =
    completedCount > 0
      ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / completedCount)
      : 0;

  // Recommended exams (available exams not yet taken)
  const completedExamIds = new Set(attempts.map((a) => a.examId));
  const recommendedExams = exams.filter((e) => !completedExamIds.has(e.id)).slice(0, 3);
  const fallbackExams = exams.slice(0, 3);
  const displayRecommended = recommendedExams.length > 0 ? recommendedExams : fallbackExams;

  // Date-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Section */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDateFormatted}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name || 'Candidate'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Welcome to the NEXORA Assessment Portal. Review your test performance, view assigned
            modules, and continue your technical certification path.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/exams')}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs hover:shadow-sm transition-all flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Browse Exams</span>
          </button>
          <button
            onClick={() => onNavigate('/results')}
            className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors"
          >
            My Transcript
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Available Tests
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {exams.length}
            </span>
            <span className="text-xs text-slate-400">ready to take</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Completed Attempts
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs text-slate-400">submitted tests</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Average Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {avgScore}%
            </span>
            <span className="text-xs text-slate-400">across attempts</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Overall Pass Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {passRate}%
            </span>
            <span className="text-xs text-slate-400">
              {passedCount} of {completedCount} passed
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Exams + Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Exams Section (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recommended Assessments
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core syllabus tests ready for immediate evaluation
              </p>
            </div>
            <button
              onClick={() => onNavigate('/exams')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all ({exams.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {displayRecommended.map((exam) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{exam.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{exam.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {exam.durationMinutes} min
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {exam.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <button
                    onClick={() => onNavigate(`/exam-taking/${exam.id}`)}
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Overview & Weekly Breakdown */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Performance Breakdown
          </h3>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">Assessment Completion</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-white font-bold">
                  {exams.length > 0 ? Math.round((completedCount / exams.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, exams.length > 0 ? (completedCount / exams.length) * 100 : 0)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">Pass / Fail Ratio</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                  {passedCount} passed · {completedCount - passedCount} retake
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-2"
                  style={{
                    width: `${completedCount > 0 ? (passedCount / completedCount) * 100 : 0}%`,
                  }}
                />
                <div
                  className="bg-rose-500 h-2"
                  style={{
                    width: `${completedCount > 0 ? ((completedCount - passedCount) / completedCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="p-3.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-indigo-950 dark:text-indigo-200">
                    Exam Strategy Advice
                  </p>
                  <p className="text-indigo-900/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
                    Flag questions you are uncertain about and review them before your final submission. The timer continuously synchronizes locally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exam Submissions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Assessment Results
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest graded sessions with full question review
            </p>
          </div>
          {attempts.length > 0 && (
            <button
              onClick={() => onNavigate('/results')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View full history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No exam attempts recorded yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Select an exam from the catalog to take your first assessment and view your graded performance report.
            </p>
            <button
              onClick={() => onNavigate('/exams')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Take First Exam
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Exam Title</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Completion Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Score</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attempts.slice(0, 5).map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {att.examTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {att.examCategory}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 tabular-nums">
                        {new Date(att.endTime || att.startTime).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {att.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            att.passed
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {att.passed ? 'PASSED' : 'NOT PASSED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onNavigate(`/results/${att.id}`)}
                          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          Review Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
