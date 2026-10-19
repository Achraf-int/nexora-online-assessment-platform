import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  GraduationCap,
  Clock,
  HelpCircle,
  Award,
  ArrowRight,
  CheckCircle,
  FileText,
  X,
  Play,
  RotateCcw
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Exam, ExamDifficulty } from '../types';
import { useAuth } from '../context/AuthContext';

interface ExamsPageProps {
  onNavigate: (route: string) => void;
}

export const ExamsPage: React.FC<ExamsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [exams] = useState<Exam[]>(() => storageService.getExams().filter((e) => e.isPublished));
  const [attempts] = useState(() => (user ? storageService.getAttemptsByUser(user.id) : []));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'questions'>('title');

  // Modal for Exam Detail & Rules
  const [selectedExamForDetail, setSelectedExamForDetail] = useState<Exam | null>(null);

  // Set of completed exam IDs
  const completedExamMap = useMemo(() => {
    const map = new Map<string, { passed: boolean; percentage: number; attemptId: string }>();
    attempts.forEach((a) => {
      // keep latest
      map.set(a.examId, { passed: a.passed, percentage: a.percentage, attemptId: a.id });
    });
    return map;
  }, [attempts]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(exams.map((e) => e.category));
    return ['ALL', ...Array.from(set)];
  }, [exams]);

  // Filtered & sorted exams
  const filteredExams = useMemo(() => {
    return exams
      .filter((exam) => {
        const matchesSearch =
          exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'ALL' || exam.category === selectedCategory;
        const matchesDiff = selectedDifficulty === 'ALL' || exam.difficulty === selectedDifficulty;

        return matchesSearch && matchesCat && matchesDiff;
      })
      .sort((a, b) => {
        if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
        if (sortBy === 'questions') return a.totalQuestions - b.totalQuestions;
        return a.title.localeCompare(b.title);
      });
  }, [exams, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const handleStartExam = (examId: string) => {
    setSelectedExamForDetail(null);
    onNavigate(`/exam-taking/${examId}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Filter Controls */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assessment Catalog
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a verified multiple-choice examination to validate competencies and earn course credit.
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search exams by title, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Subjects' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Difficulties</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* Secondary Filter & Sort Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">{filteredExams.length}</span> examinations
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1 px-2 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="title">Alphabetical (Title)</option>
                <option value="duration">Duration (Shortest first)</option>
                <option value="questions">Question Count</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Grid */}
      {filteredExams.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            No examinations found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or adjusting your subject and difficulty filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedDifficulty('ALL');
            }}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const history = completedExamMap.get(exam.id);
            const isCompleted = !!history;

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all group"
              >
                <div className="space-y-3">
                  {/* Category & Status Strip */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {exam.category}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        exam.difficulty === 'BEGINNER'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : exam.difficulty === 'INTERMEDIATE'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      }`}
                    >
                      {exam.difficulty}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>

                  {/* Metadata Specs (Zero-Pill discipline) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono tabular-nums">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono tabular-nums">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pass: {exam.passingScorePercentage}%</span>
                    </div>
                  </div>

                  {/* Status Indicator if already taken */}
                  {isCompleted && (
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Previous Attempt:</span>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          history.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {history.percentage}% ({history.passed ? 'PASSED' : 'FAILED'})
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedExamForDetail(exam)}
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    View Syllabus
                  </button>
                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {isCompleted ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isCompleted ? 'Retake Test' : 'Start Exam'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exam Details & Confirmation Modal */}
      {selectedExamForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {selectedExamForDetail.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedExamForDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExamForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedExamForDetail.description}
            </p>

            {/* Test Specifications */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">DURATION</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {selectedExamForDetail.durationMinutes} Minutes
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">QUESTIONS</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {selectedExamForDetail.totalQuestions} Items
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PASS THRESHOLD</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {selectedExamForDetail.passingScorePercentage}%
                </span>
              </div>
            </div>

            {/* Examination Rules */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Examination Rules & Protocol
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                {selectedExamForDetail.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedExamForDetail(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartExam(selectedExamForDetail.id)}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Begin Assessment Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
