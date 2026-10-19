import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  BookOpen,
  HelpCircle,
  Award,
  Users,
  CheckCircle,
  X,
  Search,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Exam, Question, ExamAttempt, ExamDifficulty } from '../types';

export const AdminPanelPage: React.FC = () => {
  const { user, isAdmin, switchRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'exams' | 'questions' | 'attempts'>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);

  // Modals
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedExamIdForQuestions, setSelectedExamIdForQuestions] = useState<string>('ALL');

  // Attempt Inspection Modal
  const [inspectingAttempt, setInspectingAttempt] = useState<ExamAttempt | null>(null);

  // Exam Form State
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    category: 'Computer Science',
    difficulty: 'INTERMEDIATE' as ExamDifficulty,
    durationMinutes: 20,
    passingScorePercentage: 70,
    rules: [
      'Each question has one single correct answer.',
      'Test automatically submits when the timer reaches 00:00.',
    ],
  });

  // Question Form State
  const [questionForm, setQuestionForm] = useState({
    examId: '',
    text: '',
    options: [
      { id: 'opt-1', text: '' },
      { id: 'opt-2', text: '' },
      { id: 'opt-3', text: '' },
      { id: 'opt-4', text: '' },
    ],
    correctOptionId: 'opt-1',
    explanation: '',
    marks: 10,
  });

  const loadData = () => {
    setExams(storageService.getExams());
    setQuestions(storageService.getQuestions());
    setAttempts(storageService.getAttempts());
  };

  useEffect(() => {
    loadData();
  }, []);

  // If user is not admin, show clear authorization prompt with 1-click switch
  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Administrator Access Required
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            You are currently signed in as a <span className="font-semibold text-indigo-600 dark:text-indigo-400">Student</span>.
            The Admin Management Console is restricted to authorized faculty members.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => switchRole('ADMIN')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Switch Role to Administrator</span>
          </button>
        </div>
      </div>
    );
  }

  // Admin Metrics Calculations
  const totalExams = exams.length;
  const totalQuestions = questions.length;
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.passed).length;
  const overallPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  // Handlers for Exam Form
  const handleOpenCreateExam = () => {
    setEditingExam(null);
    setExamForm({
      title: '',
      description: '',
      category: 'Computer Science',
      difficulty: 'INTERMEDIATE',
      durationMinutes: 20,
      passingScorePercentage: 70,
      rules: [
        'Each question has one single correct answer.',
        'Test automatically submits when the timer reaches 00:00.',
      ],
    });
    setShowExamModal(true);
  };

  const handleOpenEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      description: exam.description,
      category: exam.category,
      difficulty: exam.difficulty,
      durationMinutes: exam.durationMinutes,
      passingScorePercentage: exam.passingScorePercentage,
      rules: exam.rules || [],
    });
    setShowExamModal(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.title.trim()) return;

    if (editingExam) {
      const updated: Exam = {
        ...editingExam,
        ...examForm,
      };
      storageService.saveExam(updated);
    } else {
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        ...examForm,
        totalQuestions: 0,
        isPublished: true,
        createdAt: new Date().toISOString(),
        tags: [examForm.category, examForm.difficulty],
      };
      storageService.saveExam(newExam);
    }
    setShowExamModal(false);
    loadData();
  };

  const handleDeleteExam = (id: string) => {
    if (confirm('Are you sure you want to delete this examination and all its questions?')) {
      storageService.deleteExam(id);
      loadData();
    }
  };

  const handleTogglePublish = (id: string) => {
    storageService.toggleExamPublish(id);
    loadData();
  };

  // Handlers for Question Form
  const handleOpenCreateQuestion = (defaultExamId?: string) => {
    setEditingQuestion(null);
    setQuestionForm({
      examId: defaultExamId || (exams[0]?.id ?? ''),
      text: '',
      options: [
        { id: 'opt-1', text: '' },
        { id: 'opt-2', text: '' },
        { id: 'opt-3', text: '' },
        { id: 'opt-4', text: '' },
      ],
      correctOptionId: 'opt-1',
      explanation: '',
      marks: 10,
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQuestionForm({
      examId: q.examId,
      text: q.text,
      options: q.options,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      marks: q.marks,
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.text.trim()) return;

    if (editingQuestion) {
      const updated: Question = {
        ...editingQuestion,
        ...questionForm,
      };
      storageService.saveQuestion(updated);
    } else {
      const newQ: Question = {
        id: `q-${Date.now()}`,
        ...questionForm,
      };
      storageService.saveQuestion(newQ);
    }
    setShowQuestionModal(false);
    loadData();
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Delete this question permanently?')) {
      storageService.deleteQuestion(id);
      loadData();
    }
  };

  // Filtered Questions by selected Exam
  const filteredQuestions = questions.filter(
    (q) => selectedExamIdForQuestions === 'ALL' || q.examId === selectedExamIdForQuestions
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
            Faculty & Proctoring Management
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Administration Console
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create examinations, manage question banks, review student submissions, and configure passing thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'exams' && (
            <button
              onClick={handleOpenCreateExam}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Exam</span>
            </button>
          )}
          {activeTab === 'questions' && (
            <button
              onClick={() => handleOpenCreateQuestion(selectedExamIdForQuestions !== 'ALL' ? selectedExamIdForQuestions : undefined)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">TOTAL EXAMS</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {totalExams}
          </div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">QUESTION BANK</span>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {totalQuestions} items
          </div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">STUDENT ATTEMPTS</span>
          <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1 tabular-nums">
            {totalAttempts}
          </div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">AVERAGE PASS RATE</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {overallPassRate}%
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Functional button controls) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'exams'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Exam Management ({exams.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Question Bank ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('attempts')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'attempts'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Audit Attempts ({attempts.length})
        </button>
      </div>

      {/* TAB 1: Exam Management */}
      {activeTab === 'exams' && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Title & Category</th>
                  <th className="py-3 px-4 font-semibold">Difficulty</th>
                  <th className="py-3 px-4 font-semibold text-center">Duration</th>
                  <th className="py-3 px-4 font-semibold text-center">Questions</th>
                  <th className="py-3 px-4 font-semibold text-center">Passing</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{exam.title}</div>
                      <div className="text-[11px] text-slate-400">{exam.category}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {exam.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {exam.durationMinutes} min
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">
                      {exam.totalQuestions}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {exam.passingScorePercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(exam.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          exam.isPublished
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {exam.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{exam.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditExam(exam)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600"
                        title="Edit exam"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Delete exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Question Bank */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Exam Filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Filter by Exam:</span>
            <select
              value={selectedExamIdForQuestions}
              onChange={(e) => setSelectedExamIdForQuestions(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Examinations ({questions.length} questions)</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => {
              const parentExam = exams.find((e) => e.id === q.examId);
              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                          #{idx + 1}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{parentExam?.title || 'Unknown Exam'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{q.marks} Marks</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                        {q.text}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.correctOptionId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`p-2 rounded border flex items-center justify-between ${
                            isCorrect
                              ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-semibold'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{String.fromCharCode(65 + oIdx)}. {opt.text}</span>
                          {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded border border-slate-200/50 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Attempt Auditing */}
      {activeTab === 'attempts' && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name & ID</th>
                  <th className="py-3 px-4 font-semibold">Exam Title</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Score</th>
                  <th className="py-3 px-4 font-semibold text-center">Outcome</th>
                  <th className="py-3 px-4 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{att.userName}</div>
                      <div className="text-[11px] text-slate-400">{att.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {att.examTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 tabular-nums">
                      {new Date(att.endTime || att.startTime).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {att.percentage}% ({att.score}/{att.maxScore})
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          att.passed
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {att.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectingAttempt(att)}
                        className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Audit Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exam Modal (Create / Edit) */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingExam ? 'Edit Examination' : 'Create New Examination'}
              </h3>
              <button onClick={() => setShowExamModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="e.g. Distributed Cloud Architectures"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Syllabus Description
                </label>
                <textarea
                  rows={3}
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  placeholder="Detailed summary of covered learning topics..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={examForm.category}
                    onChange={(e) => setExamForm({ ...examForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={examForm.difficulty}
                    onChange={(e) => setExamForm({ ...examForm, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={examForm.durationMinutes}
                    onChange={(e) => setExamForm({ ...examForm, durationMinutes: parseInt(e.target.value, 10) || 20 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={examForm.passingScorePercentage}
                    onChange={(e) => setExamForm({ ...examForm, passingScorePercentage: parseInt(e.target.value, 10) || 70 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Save Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal (Create / Edit) */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingQuestion ? 'Edit Question Item' : 'Add New Question Item'}
              </h3>
              <button onClick={() => setShowQuestionModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Assign to Exam
                </label>
                <select
                  value={questionForm.examId}
                  onChange={(e) => setQuestionForm({ ...questionForm, examId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Question Prompt Text
                </label>
                <textarea
                  rows={2}
                  required
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                  placeholder="e.g. Which Java interface must be implemented to support custom sorting?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* 4 Choices */}
              <div className="space-y-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                  Multiple-Choice Options (Select radio for correct answer)
                </label>
                {questionForm.options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOptionRadio"
                      checked={questionForm.correctOptionId === opt.id}
                      onChange={() => setQuestionForm({ ...questionForm, correctOptionId: opt.id })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-mono font-bold w-4">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      placeholder={`Choice ${String.fromCharCode(65 + idx)}...`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Technical Explanation
                </label>
                <textarea
                  rows={2}
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Rationale displayed to candidates upon review..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attempt Audit Inspection Modal */}
      {inspectingAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                  Submission Log #{inspectingAttempt.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {inspectingAttempt.examTitle}
                </h3>
              </div>
              <button onClick={() => setInspectingAttempt(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2 text-xs border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectingAttempt.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-600 dark:text-slate-300">{inspectingAttempt.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Score & Percentage:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {inspectingAttempt.percentage}% ({inspectingAttempt.score}/{inspectingAttempt.maxScore})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Passing Threshold:</span>
                <span className="font-mono tabular-nums">{inspectingAttempt.passingScorePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Result:</span>
                <span className={`font-bold ${inspectingAttempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {inspectingAttempt.passed ? 'PASSED' : 'NOT PASSED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Spent:</span>
                <span className="font-mono tabular-nums">
                  {Math.floor(inspectingAttempt.timeSpentSeconds / 60)}m {inspectingAttempt.timeSpentSeconds % 60}s
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">Answer Key Snapshot:</span>
              <div className="max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1">
                {Object.entries(inspectingAttempt.answers).map(([qId, optId]) => (
                  <div key={qId} className="flex justify-between">
                    <span className="text-slate-500">{qId}:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{optId}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectingAttempt(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
