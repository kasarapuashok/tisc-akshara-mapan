import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FileText,
  Mic,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import {
  AssessmentRecord,
  LEVEL_METADATA,
  Student,
} from '../types';
import { AVATAR_GRADIENTS } from '../data/demoData';
import { formatShortDate, getInitials } from '../utils/speech';

interface StudentsScreenProps {
  students: Student[];
  assessments: AssessmentRecord[];
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onAssessStudent: (studentId: string) => void;
  onOpenReport: (record: AssessmentRecord) => void;
}

export function StudentsScreen({
  students,
  assessments,
  onAddStudent,
  onDeleteStudent,
  onAssessStudent,
  onOpenReport,
}: StudentsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add student form state
  const [name, setName] = useState('');
  const [teluguName, setTeluguName] = useState('');
  const [classGrade, setClassGrade] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [rollNumber, setRollNumber] = useState('');
  const [gender, setGender] = useState<'girl' | 'boy' | 'other'>('girl');
  const [formError, setFormError] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      if (classFilter !== 'all' && s.classGrade !== classFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.teluguName || '').toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        `class ${s.classGrade}`.includes(q)
      );
    });
  }, [students, searchQuery, classFilter]);

  const latestAssessmentByStudent = useMemo(() => {
    const map = new Map<string, AssessmentRecord>();
    const sorted = [...assessments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    for (const rec of sorted) {
      if (!map.has(rec.studentId)) {
        map.set(rec.studentId, rec);
      }
    }
    return map;
  }, [assessments]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNumber.trim()) {
      setFormError('దయచేసి పేరు మరియు రోల్ నంబర్ నమోదు చేయండి / Please enter name and roll number.');
      return;
    }

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      name: name.trim(),
      teluguName: teluguName.trim() || undefined,
      classGrade,
      rollNumber: rollNumber.trim(),
      gender,
      teluguLevel: 0,
      englishLevel: 0,
      lastAssessedAt: null,
      avatarGradient: AVATAR_GRADIENTS[students.length % AVATAR_GRADIENTS.length],
    };

    onAddStudent(newStudent);
    setName('');
    setTeluguName('');
    setRollNumber('');
    setClassGrade(3);
    setGender('girl');
    setFormError('');
    setShowAddModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="font-telugu text-2xl font-extrabold text-[#0F172A]">
            విద్యార్థులు
          </h1>
          <p className="text-xs font-semibold text-[#64748B]">
            Students Roster · {students.length} enrolled (Classes 1–5)
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setShowAddModal(true)}
          className="primary-gradient primary-glow flex min-h-[46px] items-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-bold text-white whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span className="font-telugu">కొత్త విద్యార్థి</span>
          <span className="hidden text-xs font-semibold text-white/90 sm:inline">
            / Add Student
          </span>
        </motion.button>
      </div>

      {/* Search + Class Filter Bar */}
      <div className="glass-card flex flex-col gap-3 rounded-[24px] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="పేరు / రోల్ నంబర్ వెతకండి · Search name or roll no..."
            className="min-h-[44px] w-full rounded-[14px] border border-slate-200/80 bg-white/85 py-2 pr-4 pl-10 text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-[14px] bg-slate-100/80 p-1">
          {(['all', 1, 2, 3, 4, 5] as const).map((grade) => {
            const active = classFilter === grade;
            return (
              <button
                key={grade}
                type="button"
                onClick={() => setClassFilter(grade)}
                className={`min-h-[36px] rounded-[10px] px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {grade === 'all' ? 'All' : `C${grade}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-[24px] px-6 py-12 text-center">
          <UserPlus className="h-9 w-9 text-[#64748B]" />
          <p className="font-telugu mt-3 text-base font-bold text-[#0F172A]">
            విద్యార్థులు కనబడలేదు
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            No students match your filter. Try another search or add a new student.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student, index) => {
            const teMeta = LEVEL_METADATA[student.teluguLevel];
            const enMeta = LEVEL_METADATA[student.englishLevel];
            const latest = latestAssessmentByStudent.get(student.id);

            return (
              <motion.article
                key={student.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.25), duration: 0.35 }}
                className="glass-card flex flex-col justify-between rounded-[24px] p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${student.avatarGradient} text-sm font-extrabold text-white shadow-sm`}
                      >
                        {getInitials(student.name)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-extrabold text-[#0F172A]">
                          {student.name}
                        </h2>
                        {student.teluguName && (
                          <p className="font-telugu truncate text-xs font-semibold text-[#7C3AED]">
                            {student.teluguName}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs font-medium text-[#64748B] tabular-nums">
                          Class {student.classGrade} · Roll #{student.rollNumber} ·{' '}
                          {student.gender === 'girl'
                            ? 'Girl'
                            : student.gender === 'boy'
                              ? 'Boy'
                              : 'Student'}
                        </p>
                      </div>
                    </div>

                    {students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteStudent(student.id)}
                        aria-label={`Remove ${student.name}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Colour-Coded Bilingual Level Indicators */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <div
                      className={`rounded-[14px] border px-3 py-2 ${teMeta.bgClass} ${teMeta.borderClass}`}
                    >
                      <p className="font-telugu text-[11px] font-bold text-[#64748B]">
                        తెలుగు · Telugu
                      </p>
                      <p className={`mt-0.5 text-xs font-extrabold ${teMeta.textClass}`}>
                        {teMeta.code}{' '}
                        <span className="font-telugu">{teMeta.nameTe}</span>
                      </p>
                      <p className="text-[10px] font-semibold text-[#64748B]">
                        {teMeta.pluralEn}
                      </p>
                    </div>

                    <div
                      className={`rounded-[14px] border px-3 py-2 ${enMeta.bgClass} ${enMeta.borderClass}`}
                    >
                      <p className="text-[11px] font-bold text-[#64748B]">
                        ఇంగ్లీష్ · English
                      </p>
                      <p className={`mt-0.5 text-xs font-extrabold ${enMeta.textClass}`}>
                        {enMeta.code} {enMeta.pluralEn}
                      </p>
                      <p className="font-telugu text-[10px] font-semibold text-[#64748B]">
                        {enMeta.nameTe}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer: Last Assessed + Actions */}
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-3.5">
                  <span className="text-[11px] font-semibold text-[#64748B]">
                    <span className="font-telugu">చివరి అంచనా:</span>{' '}
                    {formatShortDate(student.lastAssessedAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    {latest && (
                      <button
                        type="button"
                        onClick={() => onOpenReport(latest)}
                        className="flex min-h-[40px] items-center gap-1.5 rounded-[12px] border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-bold text-[#0F172A] transition-colors hover:bg-white"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#7C3AED]" />
                        <span>Report</span>
                      </button>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => onAssessStudent(student.id)}
                      className="primary-gradient flex min-h-[40px] items-center gap-1.5 rounded-[12px] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-[#FF6B00]/25"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span className="font-telugu">అంచనా</span>
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Add Student Modal / Bottom Sheet */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-[28px] bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:rounded-[28px]"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-telugu text-lg font-extrabold text-[#0F172A]">
                    కొత్త విద్యార్థిని చేర్చండి
                  </h2>
                  <p className="text-xs font-medium text-[#64748B]">
                    Add Student to Classroom Roster
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close modal"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#0F172A]">
                    <span className="font-telugu">విద్యార్థి పేరు</span> / Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFormError('');
                    }}
                    placeholder="e.g. Karthik Varma"
                    className="min-h-[46px] w-full rounded-[14px] border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-[#0F172A] focus:border-[#FF6B00] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#0F172A]">
                    <span className="font-telugu">తెలుగులో పేరు</span> / Name in Telugu (Optional)
                  </label>
                  <input
                    type="text"
                    value={teluguName}
                    onChange={(e) => setTeluguName(e.target.value)}
                    placeholder="ఉదా: కార్తీక్ వర్మ"
                    className="font-telugu min-h-[46px] w-full rounded-[14px] border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-[#0F172A] focus:border-[#FF6B00] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#0F172A]">
                      <span className="font-telugu">రోల్ నంబర్</span> / Roll No *
                    </label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => {
                        setRollNumber(e.target.value);
                        setFormError('');
                      }}
                      placeholder="e.g. 305"
                      className="min-h-[46px] w-full rounded-[14px] border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-[#0F172A] focus:border-[#FF6B00] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#0F172A]">
                      <span className="font-telugu">లింగం</span> / Gender
                    </label>
                    <div className="grid grid-cols-3 gap-1 rounded-[14px] bg-slate-100 p-1">
                      {(
                        [
                          { id: 'girl', label: 'Girl' },
                          { id: 'boy', label: 'Boy' },
                          { id: 'other', label: 'Other' },
                        ] as const
                      ).map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGender(g.id)}
                          className={`min-h-[38px] rounded-[10px] text-xs font-bold transition-colors ${
                            gender === g.id
                              ? 'bg-white text-[#0F172A] shadow-sm'
                              : 'text-[#64748B]'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#0F172A]">
                    <span className="font-telugu">తరగతి</span> / Class (1–5)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {([1, 2, 3, 4, 5] as const).map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setClassGrade(grade)}
                        className={`min-h-[44px] rounded-[14px] border text-sm font-extrabold transition-all ${
                          classGrade === grade
                            ? 'primary-gradient border-transparent text-white shadow-sm'
                            : 'border-slate-200 bg-white text-[#0F172A] hover:border-[#FF6B00]/40'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <p className="rounded-[12px] bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    {formError}
                  </p>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="primary-gradient primary-glow min-h-[52px] w-full rounded-[16px] text-sm font-extrabold text-white"
                >
                  <span className="font-telugu">విద్యార్థిని సేవ్ చేయండి</span> · Save Student
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
