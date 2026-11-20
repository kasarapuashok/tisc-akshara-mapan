import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpenCheck,
  CalendarCheck2,
  ChevronRight,
  Mic,
  Settings2,
} from 'lucide-react';
import {
  AssessmentRecord,
  LEVEL_METADATA,
  ReadingLevelIndex,
  Student,
  TeacherProfile,
} from '../types';
import { AksharaLogo } from './AksharaLogo';
import { CountUpNumber } from './CountUpNumber';
import { formatShortDate, getInitials } from '../utils/speech';

interface HomeScreenProps {
  teacher: TeacherProfile;
  students: Student[];
  assessments: AssessmentRecord[];
  onStartAssessment: (studentId?: string) => void;
  onOpenReport: (record: AssessmentRecord) => void;
  onGoToInsights: () => void;
  onGoToStudents: () => void;
  onEditTeacher: () => void;
}

export function HomeScreen({
  teacher,
  students,
  assessments,
  onStartAssessment,
  onOpenReport,
  onGoToInsights,
  onGoToStudents,
  onEditTeacher,
}: HomeScreenProps) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const assessmentsThisWeek = assessments.filter(
    (a) => new Date(a.createdAt).getTime() >= sevenDaysAgo
  ).length;

  const avgLevelValue =
    students.length > 0
      ? students.reduce((acc, s) => acc + (s.teluguLevel + s.englishLevel) / 2, 0) /
        students.length
      : 0;
  const roundedLevel = Math.min(4, Math.max(0, Math.round(avgLevelValue))) as ReadingLevelIndex;
  const avgLevelMeta = LEVEL_METADATA[roundedLevel];

  const needsSupportStudents = students.filter(
    (s) => s.teluguLevel <= 1 || s.englishLevel <= 1
  );

  const recentAssessments = [...assessments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const studentById = new Map(students.map((s) => [s.id, s]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Top Bar: Brand + Teacher Context */}
      <header className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3 min-w-0">
          <AksharaLogo size={46} animateMode="idle" className="shrink-0" />
          <div className="min-w-0">
            <h1 className="font-telugu truncate text-lg font-extrabold leading-tight text-[#0F172A] sm:text-xl">
              అక్షర మాపన్{' '}
              <span className="font-sans text-sm font-bold text-[#7C3AED]">
                Akshara Mapan
              </span>
            </h1>
            <p className="truncate text-xs font-medium text-[#64748B]">
              {teacher.name} · {teacher.school}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditTeacher}
          aria-label="Edit teacher profile"
          className="glass-card flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full px-3 text-xs font-semibold text-[#64748B] transition-colors hover:text-[#0F172A]"
        >
          <Settings2 className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Profile</span>
        </button>
      </header>

      {/* Hero Bento Card + Primary CTA */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card relative overflow-hidden rounded-[24px] p-6 sm:p-7 lg:col-span-7 flex flex-col justify-between"
        >
          <div
            className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'linear-gradient(135deg, #FF6B00, #7C3AED)',
            }}
          />

          <div className="relative">
            <p className="font-telugu text-sm font-bold text-[#7C3AED]">
              నమస్కారం, {teacher.name} గారు
            </p>
            <h2 className="font-telugu mt-1.5 text-2xl font-extrabold leading-snug text-[#0F172A] sm:text-3xl [text-wrap:balance]">
              ప్రతి బిడ్డకు AI చదువు అంచనా
            </h2>
            <p className="mt-1 text-sm font-medium text-[#64748B] sm:text-base">
              AI Reading Assessment for Every Child · Classes 1–5
            </p>
          </div>

          <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
              type="button"
              onClick={() => onStartAssessment()}
              className="primary-gradient primary-glow flex min-h-[58px] w-full items-center justify-center gap-3 rounded-[20px] px-6 py-3.5 text-white transition-all sm:w-auto sm:flex-1"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Mic className="h-5 w-5 text-white" />
              </span>
              <span className="text-left">
                <span className="font-telugu block text-base font-extrabold leading-tight">
                  అంచనా ప్రారంభించండి
                </span>
                <span className="block text-xs font-semibold text-white/90">
                  Start Reading Assessment
                </span>
              </span>
              <ArrowRight className="ml-auto h-5 w-5 shrink-0 sm:ml-2" />
            </motion.button>

            <button
              type="button"
              onClick={onGoToStudents}
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-[20px] border border-slate-200/80 bg-white/75 px-5 py-3 text-sm font-bold text-[#0F172A] transition-colors hover:bg-white whitespace-nowrap"
            >
              <span className="font-telugu">విద్యార్థులు</span>
              <span className="text-xs font-semibold text-[#64748B]">({students.length})</span>
            </button>
          </div>
        </motion.div>

        {/* 3 Staggered Bento Stat Cards */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
          {/* Stat 1: Assessments this week */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.38 }}
            className="glass-card flex items-center justify-between gap-4 rounded-[24px] p-5"
          >
            <div>
              <p className="font-telugu text-xs font-bold text-[#0F172A]">
                ఈ వారం అంచనాలు
              </p>
              <p className="text-[11px] font-medium text-[#64748B]">
                Assessments this week
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <CountUpNumber
                  value={assessmentsThisWeek}
                  className="text-3xl font-extrabold tracking-tight text-[#0F172A]"
                />
                <span className="text-xs font-semibold text-[#10B981]">
                  of {assessments.length} total
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#FF6B00]/15 to-[#FFB800]/25 text-[#FF6B00]">
              <CalendarCheck2 className="h-6 w-6" />
            </div>
          </motion.div>

          {/* Stat 2: Class average level */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.38 }}
            className="glass-card flex items-center justify-between gap-4 rounded-[24px] p-5"
          >
            <div>
              <p className="font-telugu text-xs font-bold text-[#0F172A]">
                తరగతి సగటు స్థాయి
              </p>
              <p className="text-[11px] font-medium text-[#64748B]">
                Class average level
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-[#0F172A] tabular-nums">
                  L<CountUpNumber value={avgLevelValue} decimals={1} />
                </span>
                <span className={`font-telugu text-xs font-bold ${avgLevelMeta.textClass}`}>
                  {avgLevelMeta.nameTe} · {avgLevelMeta.nameEn}
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#7C3AED]/15 to-[#EC4899]/20 text-[#7C3AED]">
              <Award className="h-6 w-6" />
            </div>
          </motion.div>

          {/* Stat 3: Children needing support */}
          <motion.button
            type="button"
            onClick={onGoToInsights}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.38 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card flex w-full items-center justify-between gap-4 rounded-[24px] p-5 text-left transition-transform hover:-translate-y-0.5"
          >
            <div>
              <p className="font-telugu text-xs font-bold text-[#0F172A]">
                సహాయం అవసరమైన పిల్లలు
              </p>
              <p className="text-[11px] font-medium text-[#64748B]">
                Children needing support (L0–L1)
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <CountUpNumber
                  value={needsSupportStudents.length}
                  className="text-3xl font-extrabold tracking-tight text-[#EF4444]"
                />
                <span className="text-xs font-semibold text-[#64748B]">
                  View Insights →
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-red-500/12 text-[#EF4444]">
              <AlertCircle className="h-6 w-6" />
            </div>
          </motion.button>
        </div>
      </section>

      {/* Lower Bento Section: Quick Assess Students + Recent Assessments */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Quick Student Pick */}
        <div className="glass-card rounded-[24px] p-5 sm:p-6 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-telugu text-base font-extrabold text-[#0F172A]">
                త్వరిత అంచనా
              </h3>
              <p className="text-xs font-medium text-[#64748B]">
                Tap any child to begin voice check
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToStudents}
              className="min-h-[36px] text-xs font-bold text-[#7C3AED] hover:underline whitespace-nowrap"
            >
              All ({students.length})
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {students.slice(0, 5).map((student) => {
              const teMeta = LEVEL_METADATA[student.teluguLevel];
              const enMeta = LEVEL_METADATA[student.englishLevel];
              return (
                <motion.button
                  key={student.id}
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onStartAssessment(student.id)}
                  className="flex min-h-[60px] w-full items-center gap-3 rounded-[18px] border border-slate-200/70 bg-white/70 px-3.5 py-2.5 text-left transition-colors hover:border-[#FF6B00]/40 hover:bg-white"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${student.avatarGradient} text-xs font-extrabold text-white shadow-sm`}
                  >
                    {getInitials(student.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0F172A]">
                      {student.name}
                      {student.teluguName ? (
                        <span className="font-telugu ml-1.5 text-xs font-semibold text-[#64748B]">
                          {student.teluguName}
                        </span>
                      ) : null}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold">
                      <span className="text-[#64748B]">Class {student.classGrade}</span>
                      <span className="text-slate-300">·</span>
                      <span className={teMeta.textClass}>
                        తెలుగు {teMeta.code}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className={enMeta.textClass}>
                        EN {enMeta.code}
                      </span>
                    </div>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/10 text-[#FF6B00]">
                    <Mic className="h-4 w-4" />
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="glass-card rounded-[24px] p-5 sm:p-6 lg:col-span-7">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-telugu text-base font-extrabold text-[#0F172A]">
                ఇటీవలి అంచనాలు
              </h3>
              <p className="text-xs font-medium text-[#64748B]">
                Recent reading report cards · tap to inspect
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToInsights}
              className="min-h-[36px] text-xs font-bold text-[#FF6B00] hover:underline whitespace-nowrap"
            >
              Dashboard →
            </button>
          </div>

          {recentAssessments.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-[18px] bg-white/50 py-10 text-center">
              <BookOpenCheck className="h-8 w-8 text-[#64748B]" />
              <p className="font-telugu mt-2 text-sm font-bold text-[#0F172A]">
                ఇంకా అంచనాలు లేవు
              </p>
              <p className="text-xs text-[#64748B]">
                Start your first voice reading assessment above.
              </p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-200/60">
              {recentAssessments.map((record) => {
                const student = studentById.get(record.studentId);
                const levelMeta = LEVEL_METADATA[record.assessedLevel];
                return (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => onOpenReport(record)}
                    className="flex min-h-[64px] w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-white/50 rounded-[14px] px-2 -mx-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-xs font-extrabold text-white ${levelMeta.badgeBg}`}
                      >
                        {levelMeta.code}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0F172A]">
                          {student?.name || 'Student'}
                        </p>
                        <p className="truncate text-xs font-medium text-[#64748B]">
                          <span className="font-telugu">
                            {record.language === 'telugu' ? 'తెలుగు' : 'English'}
                          </span>{' '}
                          · {levelMeta.nameEn} · {formatShortDate(record.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right tabular-nums">
                        <p className="text-sm font-extrabold text-[#0F172A]">
                          {record.result.accuracy_percent}%
                        </p>
                        <p className="text-[11px] font-semibold text-[#64748B]">
                          {record.result.words_correct_per_minute} WCPM
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
