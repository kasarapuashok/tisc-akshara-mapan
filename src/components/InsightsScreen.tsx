import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Clock,
  Download,
  Mic,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  AssessmentRecord,
  Language,
  LEVEL_METADATA,
  ReadingLevelIndex,
  SmartGroupSuggestion,
  Student,
  TeacherProfile,
} from '../types';
import { fetchAISmartGroups, BilingualApiError } from '../services/api';
import { exportClassReportCSV, getInitials } from '../utils/speech';

interface InsightsScreenProps {
  teacher: TeacherProfile | null;
  students: Student[];
  assessments: AssessmentRecord[];
  smartGroups: SmartGroupSuggestion[];
  onUpdateSmartGroups: (groups: SmartGroupSuggestion[]) => void;
  onAssessStudent: (studentId: string) => void;
}

export function InsightsScreen({
  teacher,
  students,
  assessments,
  smartGroups,
  onUpdateSmartGroups,
  onAssessStudent,
}: InsightsScreenProps) {
  const [distLanguage, setDistLanguage] = useState<Language>('telugu');
  const [selectedChildId, setSelectedChildId] = useState<string>(students[0]?.id || '');
  const [isRefreshingGroups, setIsRefreshingGroups] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [csvFeedback, setCsvFeedback] = useState(false);

  const studentById = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students]
  );

  // 1. Needs Attention (Level 0–1 in either Telugu or English)
  const needsAttentionStudents = useMemo(
    () =>
      students
        .filter((s) => s.teluguLevel <= 1 || s.englishLevel <= 1)
        .sort(
          (a, b) =>
            Math.min(a.teluguLevel, a.englishLevel) -
            Math.min(b.teluguLevel, b.englishLevel)
        ),
    [students]
  );

  // 2. Level Distribution Chart Data (Telugu / English toggle)
  const levelDistributionData = useMemo(() => {
    const levels: ReadingLevelIndex[] = [0, 1, 2, 3, 4];
    return levels.map((lvl) => {
      const meta = LEVEL_METADATA[lvl];
      const count = students.filter((s) =>
        distLanguage === 'telugu' ? s.teluguLevel === lvl : s.englishLevel === lvl
      ).length;
      return {
        code: meta.code,
        label: `${meta.code} ${meta.nameEn}`,
        nameTe: meta.nameTe,
        count,
        color: meta.colorHex,
      };
    });
  }, [students, distLanguage]);

  // 3. Class Average WCPM & Accuracy Trend over dates
  const classTrendData = useMemo(() => {
    const grouped = new Map<string, { accSum: number; wcpmSum: number; count: number; ts: number }>();
    for (const a of assessments) {
      const d = new Date(a.createdAt);
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const prev = grouped.get(key) || { accSum: 0, wcpmSum: 0, count: 0, ts: d.getTime() };
      prev.accSum += a.result.accuracy_percent;
      prev.wcpmSum += a.result.words_correct_per_minute;
      prev.count += 1;
      grouped.set(key, prev);
    }
    return Array.from(grouped.entries())
      .map(([date, v]) => ({
        date,
        accuracy: Math.round(v.accSum / v.count),
        wcpm: Math.round(v.wcpmSum / v.count),
        ts: v.ts,
      }))
      .sort((a, b) => a.ts - b.ts);
  }, [assessments]);

  const classAvgAccuracy = useMemo(() => {
    if (assessments.length === 0) return 0;
    return Math.round(
      assessments.reduce((sum, a) => sum + a.result.accuracy_percent, 0) / assessments.length
    );
  }, [assessments]);

  const classAvgWcpm = useMemo(() => {
    if (assessments.length === 0) return 0;
    return Math.round(
      assessments.reduce((sum, a) => sum + a.result.words_correct_per_minute, 0) /
        assessments.length
    );
  }, [assessments]);

  // 4. Child Progress Over Time
  const activeChildId =
    students.some((s) => s.id === selectedChildId) ? selectedChildId : students[0]?.id || '';

  const childProgressData = useMemo(() => {
    return assessments
      .filter((a) => a.studentId === activeChildId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((a, idx) => ({
        label: `${new Date(a.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })} (${a.language === 'telugu' ? 'TE' : 'EN'})`,
        attempt: idx + 1,
        accuracy: a.result.accuracy_percent,
        wcpm: a.result.words_correct_per_minute,
      }));
  }, [assessments, activeChildId]);

  const handleRefreshSmartGroups = async () => {
    setIsRefreshingGroups(true);
    setGroupError(null);
    try {
      const freshGroups = await fetchAISmartGroups(students, distLanguage);
      if (freshGroups.length > 0) {
        onUpdateSmartGroups(freshGroups);
      }
    } catch (err) {
      if (err instanceof BilingualApiError) {
        setGroupError(`${err.messageTe} · ${err.messageEn}`);
      } else {
        setGroupError('Could not refresh AI groups right now. Please try again.');
      }
    } finally {
      setIsRefreshingGroups(false);
    }
  };

  const handleExportCSV = () => {
    exportClassReportCSV(teacher, students, assessments);
    setCsvFeedback(true);
    window.setTimeout(() => setCsvFeedback(false), 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Header + Export CSV */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="font-telugu text-2xl font-extrabold text-[#0F172A]">
            తరగతి విశ్లేషణ
          </h1>
          <p className="text-xs font-semibold text-[#64748B]">
            Teacher Insights Dashboard · {students.length} students · {assessments.length} assessments
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleExportCSV}
          className="primary-gradient primary-glow flex min-h-[46px] items-center gap-2 rounded-[16px] px-4 py-2.5 text-xs font-extrabold text-white whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          <span className="font-telugu">
            {csvFeedback ? 'డౌన్‌లోడ్ అయింది!' : 'CSV నివేదిక'}
          </span>
          <span className="text-white/90">/ Export CSV</span>
        </motion.button>
      </div>

      {/* BENTO ROW 1: Needs Attention (Top Priority) */}
      <section className="glass-card rounded-[24px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-500/12 text-[#EF4444]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-telugu text-base font-extrabold text-[#0F172A]">
                శ్రద్ధ అవసరమైన విద్యార్థులు (స్థాయి 0–1)
              </h2>
              <p className="text-xs font-medium text-[#64748B]">
                Needs attention · Level 0–1 learners needing foundational support
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-[#EF4444] tabular-nums">
            {needsAttentionStudents.length} child{needsAttentionStudents.length === 1 ? '' : 'ren'}
          </span>
        </div>

        {needsAttentionStudents.length === 0 ? (
          <p className="mt-4 rounded-[16px] bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
            అందరూ స్థాయి 2 లేదా అంతకంటే ఎక్కువ స్థాయిలో ఉన్నారు! · All students are at Level 2 or above.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {needsAttentionStudents.map((student) => {
              const teMeta = LEVEL_METADATA[student.teluguLevel];
              const enMeta = LEVEL_METADATA[student.englishLevel];
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-3 rounded-[18px] border border-red-200/70 bg-white/80 p-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${student.avatarGradient} text-xs font-extrabold text-white`}
                    >
                      {getInitials(student.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-[#0F172A]">
                        {student.name}
                      </p>
                      <p className="text-[11px] font-semibold text-[#64748B]">
                        Class {student.classGrade} ·{' '}
                        <span className={teMeta.textClass}>TE {teMeta.code}</span> ·{' '}
                        <span className={enMeta.textClass}>EN {enMeta.code}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAssessStudent(student.id)}
                    className="flex min-h-[38px] shrink-0 items-center gap-1 rounded-[12px] bg-[#FF6B00]/12 px-3 py-1.5 text-xs font-bold text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-colors"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Assess</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BENTO ROW 2: Level Distribution + Class Average Trend */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Level Distribution Chart */}
        <div className="glass-card rounded-[24px] p-5 sm:p-6 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-telugu text-base font-extrabold text-[#0F172A]">
                స్థాయి పంపిణీ
              </h2>
              <p className="text-xs font-medium text-[#64748B]">
                Reading level distribution (L0–L4)
              </p>
            </div>

            {/* Telugu / English Tabs */}
            <div className="grid grid-cols-2 gap-1 rounded-[12px] bg-slate-100 p-1">
              {(
                [
                  { id: 'telugu', label: 'తెలుగు' },
                  { id: 'english', label: 'English' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDistLanguage(t.id)}
                  className={`min-h-[34px] rounded-[9px] px-3 text-xs font-extrabold transition-colors ${
                    distLanguage === t.id
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  } ${t.id === 'telugu' ? 'font-telugu' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={levelDistributionData}
                margin={{ top: 10, right: 10, left: -24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="code"
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }}
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid rgba(226,232,240,0.9)',
                    background: 'rgba(255,255,255,0.96)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  formatter={(value) => [`${value} student(s)`, 'Count']}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload;
                    return row ? `${row.label} (${row.nameTe})` : '';
                  }}
                />
                <Bar dataKey="count" radius={[10, 10, 4, 4]} maxBarSize={44}>
                  {levelDistributionData.map((entry) => (
                    <Cell key={entry.code} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Average WCPM & Accuracy Trend */}
        <div className="glass-card rounded-[24px] p-5 sm:p-6 lg:col-span-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-telugu text-base font-extrabold text-[#0F172A]">
                తరగతి సగటు ప్రగతి
              </h2>
              <p className="text-xs font-medium text-[#64748B]">
                Class average WCPM & accuracy trend
              </p>
            </div>
            <div className="flex items-center gap-4 text-right tabular-nums">
              <div>
                <p className="text-lg font-extrabold text-[#FF6B00]">{classAvgAccuracy}%</p>
                <p className="text-[10px] font-bold text-[#64748B]">Avg Accuracy</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[#7C3AED]">{classAvgWcpm}</p>
                <p className="text-[10px] font-bold text-[#64748B]">Avg WCPM</p>
              </div>
            </div>
          </div>

          <div className="mt-5 h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={classTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="wcpmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid rgba(226,232,240,0.9)',
                    background: 'rgba(255,255,255,0.96)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy (%)"
                  stroke="#FF6B00"
                  strokeWidth={2.5}
                  fill="url(#accGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="wcpm"
                  name="WCPM"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  fill="url(#wcpmGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* BENTO ROW 3: Individual Child Progress Chart */}
      <section className="glass-card rounded-[24px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#06B6D4]/12 text-[#0891B2]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-telugu text-base font-extrabold text-[#0F172A]">
                విద్యార్థి ప్రగతి
              </h2>
              <p className="text-xs font-medium text-[#64748B]">
                Progress over time · Accuracy (%) & WCPM per child
              </p>
            </div>
          </div>

          <select
            aria-label="Select student for progress chart"
            value={activeChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="min-h-[42px] rounded-[14px] border border-slate-200 bg-white/90 px-3.5 py-2 text-xs font-bold text-[#0F172A] focus:border-[#FF6B00] focus:outline-none"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Class {s.classGrade})
              </option>
            ))}
          </select>
        </div>

        {childProgressData.length === 0 ? (
          <p className="mt-5 rounded-[16px] bg-white/60 py-8 text-center text-xs font-semibold text-[#64748B]">
            No assessments recorded for this child yet.
          </p>
        ) : (
          <div className="mt-5 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={childProgressData}
                margin={{ top: 10, right: 16, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid rgba(226,232,240,0.9)',
                    background: 'rgba(255,255,255,0.96)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy (%)"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="wcpm"
                  name="WCPM"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#06B6D4', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* BENTO ROW 4: AI Smart Groups */}
      <section className="glass-card rounded-[24px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#7C3AED]/15 to-[#EC4899]/20 text-[#7C3AED]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-telugu text-base font-extrabold text-[#0F172A]">
                స్మార్ట్ గ్రూపులు (AI తరగతి కార్యాచరణ)
              </h2>
              <p className="text-xs font-medium text-[#64748B]">
                AI-grouped reading circles with one tailored classroom activity per group
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            disabled={isRefreshingGroups}
            onClick={handleRefreshSmartGroups}
            className="secondary-gradient flex min-h-[42px] items-center gap-1.5 rounded-[14px] px-4 py-2 text-xs font-extrabold text-white shadow-sm disabled:opacity-65 whitespace-nowrap"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingGroups ? 'animate-spin' : ''}`} />
            <span className="font-telugu">
              {isRefreshingGroups ? 'రూపొందిస్తున్నాం...' : 'AI సూచనలు నవీకరించు'}
            </span>
          </motion.button>
        </div>

        {groupError && (
          <p className="mt-3 rounded-[14px] bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
            {groupError}
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {smartGroups.map((group) => {
            const members = group.studentIds
              .map((id) => studentById.get(id))
              .filter((s): s is Student => Boolean(s));

            return (
              <div
                key={group.groupId}
                className="flex flex-col justify-between rounded-[20px] border border-slate-200/75 bg-white/80 p-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-telugu text-sm font-extrabold text-[#0F172A]">
                        {group.groupNameTe}
                      </h3>
                      <p className="text-xs font-bold text-[#7C3AED]">
                        {group.groupNameEn}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#64748B] tabular-nums whitespace-nowrap">
                      <Clock className="h-3.5 w-3.5" />
                      {group.durationMinutes}m
                    </span>
                  </div>

                  {/* Group Members */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#64748B]" />
                    {members.length > 0 ? (
                      members.map((m) => (
                        <span
                          key={m.id}
                          className="text-xs font-bold text-[#0F172A]"
                        >
                          {m.name}
                          {members[members.length - 1].id !== m.id ? ',' : ''}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#64748B]">Level {group.levelRange}</span>
                    )}
                  </div>

                  {/* Activity Box */}
                  <div className="mt-3.5 rounded-[16px] bg-[#FAFAFF] p-3.5">
                    <p className="font-telugu text-xs font-extrabold text-[#FF6B00]">
                      {group.activityTitleTe}
                    </p>
                    <p className="text-xs font-bold text-[#0F172A]">
                      {group.activityTitleEn}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">
                      {group.activityDescription}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
