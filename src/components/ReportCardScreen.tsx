import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpCircle,
  BookmarkCheck,
  Check,
  ClipboardList,
  Gauge,
  RotateCcw,
  Star,
  Volume2,
} from 'lucide-react';
import {
  AssessmentRecord,
  LEVEL_METADATA,
  ReadingLevelIndex,
  ReadingMistake,
  Student,
} from '../types';
import { CountUpNumber } from './CountUpNumber';
import { getInitials, speakText } from '../utils/speech';

interface ReportCardScreenProps {
  record: AssessmentRecord;
  student: Student;
  isNewResult: boolean;
  sessionStep: number; // 1 to 3
  isSaved: boolean;
  onSave: (record: AssessmentRecord) => void;
  onReassess: () => void;
  onAdaptiveContinue: (nextLevel: ReadingLevelIndex) => void;
  onNextStudent: () => void;
  onBack: () => void;
}

function normalizeToken(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,!?;:"'()[\]–—-]/g, '')
    .trim();
}

export function ReportCardScreen({
  record,
  student,
  isNewResult,
  sessionStep,
  isSaved,
  onSave,
  onReassess,
  onAdaptiveContinue,
  onNextStudent,
  onBack,
}: ReportCardScreenProps) {
  const { result } = record;
  const levelMeta = LEVEL_METADATA[record.assessedLevel];

  const [activeWordKey, setActiveWordKey] = useState<string | null>(null);
  const [selectedMistake, setSelectedMistake] = useState<ReadingMistake | null>(null);
  const [justSaved, setJustSaved] = useState(isSaved);

  useEffect(() => {
    setJustSaved(isSaved);
  }, [isSaved]);

  // Trigger joyful confetti celebration when accuracy > 70% on new results
  useEffect(() => {
    if (!isNewResult || result.accuracy_percent <= 70) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const timer = window.setTimeout(() => {
      confetti({
        particleCount: 75,
        spread: 68,
        origin: { y: 0.55 },
        colors: ['#FF6B00', '#FFB800', '#7C3AED', '#EC4899', '#06B6D4', '#10B981'],
      });
    }, 320);

    return () => window.clearTimeout(timer);
  }, [isNewResult, record.id, result.accuracy_percent]);

  // Adaptive recommendation logic: max 3 passages per session
  const adaptiveNextLevel: ReadingLevelIndex | null = useMemo(() => {
    if (!isNewResult || sessionStep >= 3) return null;
    if (result.accuracy_percent > 80 && record.passageLevel < 4) {
      return (record.passageLevel + 1) as ReadingLevelIndex;
    }
    if (result.accuracy_percent < 50 && record.passageLevel > 0) {
      return (record.passageLevel - 1) as ReadingLevelIndex;
    }
    return null;
  }, [isNewResult, sessionStep, result.accuracy_percent, record.passageLevel]);

  const mistakeMap = useMemo(() => {
    const map = new Map<string, ReadingMistake>();
    for (const m of result.mistakes || []) {
      const key = normalizeToken(m.expected);
      if (key && !map.has(key)) {
        map.set(key, m);
      }
    }
    return map;
  }, [result.mistakes]);

  const passageTokens = useMemo(
    () => record.passageText.split(/\s+/).filter(Boolean),
    [record.passageText]
  );

  // SVG circular gauge geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (Math.min(100, Math.max(0, result.accuracy_percent)) / 100) * circumference;

  const handleWordTap = (word: string, key: string, mistake?: ReadingMistake) => {
    setActiveWordKey(key);
    setSelectedMistake(mistake || null);
    speakText(word.replace(/[.,!?;:"'()[\]]/g, ''), record.language);
    window.setTimeout(() => {
      setActiveWordKey((prev) => (prev === key ? null : prev));
    }, 900);
  };

  const handleSaveClick = () => {
    onSave(record);
    setJustSaved(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Top Navigation & Student Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="glass-card flex min-h-[44px] items-center gap-2 rounded-full px-4 text-xs font-bold text-[#0F172A] hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-telugu">వెనుకకు</span> · Back
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="text-right min-w-0">
            <p className="truncate text-sm font-extrabold text-[#0F172A]">{student.name}</p>
            <p className="text-[11px] font-semibold text-[#64748B]">
              Class {student.classGrade} ·{' '}
              <span className="font-telugu">
                {record.language === 'telugu' ? 'తెలుగు' : 'English'}
              </span>
            </p>
          </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${student.avatarGradient} text-xs font-extrabold text-white`}
          >
            {getInitials(student.name)}
          </div>
        </div>
      </div>

      {/* Adaptive Session Prompt (Level Up or Step Down) */}
      {adaptiveNextLevel !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex flex-col gap-3 rounded-[24px] border border-[#7C3AED]/25 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            {adaptiveNextLevel > record.passageLevel ? (
              <ArrowUpCircle className="mt-0.5 h-6 w-6 shrink-0 text-[#10B981]" />
            ) : (
              <ArrowDownCircle className="mt-0.5 h-6 w-6 shrink-0 text-[#FF6B00]" />
            )}
            <div>
              <p className="font-telugu text-sm font-extrabold text-[#0F172A]">
                {adaptiveNextLevel > record.passageLevel
                  ? `అద్భుతం! ${LEVEL_METADATA[adaptiveNextLevel].code} (${LEVEL_METADATA[adaptiveNextLevel].nameTe}) స్థాయికి వెళ్దాం`
                  : `సౌకర్యం కోసం ${LEVEL_METADATA[adaptiveNextLevel].code} (${LEVEL_METADATA[adaptiveNextLevel].nameTe}) ప్రయత్నిద్దాం`}
              </p>
              <p className="text-xs font-medium text-[#64748B]">
                {adaptiveNextLevel > record.passageLevel
                  ? `Adaptive Mode (Passage ${sessionStep}/3): Accuracy > 80% — ready to test Level ${adaptiveNextLevel} (${LEVEL_METADATA[adaptiveNextLevel].pluralEn}).`
                  : `Adaptive Mode (Passage ${sessionStep}/3): Accuracy < 50% — step down to Level ${adaptiveNextLevel} (${LEVEL_METADATA[adaptiveNextLevel].pluralEn}) to find comfort level.`}
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onAdaptiveContinue(adaptiveNextLevel)}
            className="secondary-gradient secondary-glow flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-[14px] px-4 py-2 text-xs font-extrabold text-white whitespace-nowrap"
          >
            <span className="font-telugu">తదుపరి స్థాయి</span>
            <span>· Try {LEVEL_METADATA[adaptiveNextLevel].code}</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      )}

      {/* Hero Score Bento Row: Circular Gauge + 3 Bento Metric Cards */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Animated Circular Accuracy Gauge + Child Feedback */}
        <div className="glass-card flex flex-col items-center justify-between gap-5 rounded-[24px] p-6 sm:flex-row lg:col-span-7">
          <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="accuracy-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B00" />
                  <stop offset="50%" stopColor="#FFB800" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#E2E8F0"
                strokeWidth="12"
                fill="none"
              />
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                stroke="url(#accuracy-ring-grad)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <CountUpNumber
                value={result.accuracy_percent}
                suffix="%"
                className="text-3xl font-extrabold text-[#0F172A]"
              />
              <span className="font-telugu text-[11px] font-bold text-[#64748B]">
                ఖచ్చితత్వం
              </span>
              <span className="text-[10px] font-semibold text-[#64748B]">Accuracy</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold text-[#7C3AED]">
              <span className="font-telugu">పిల్లవాడికి ప్రోత్సాహం</span> · For {student.name}
            </p>
            <p
              className={`mt-2 text-lg font-extrabold leading-snug text-[#0F172A] ${
                record.language === 'telugu' ? 'font-telugu' : ''
              }`}
            >
              “{result.feedback_child}”
            </p>

            <button
              type="button"
              onClick={() => speakText(result.feedback_child, record.language)}
              className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 rounded-[12px] bg-[#7C3AED]/10 px-3.5 py-2 text-xs font-bold text-[#7C3AED] transition-colors hover:bg-[#7C3AED]/18"
            >
              <Volume2 className="h-4 w-4" />
              <span className="font-telugu">ప్రోత్సాహం వినండి</span> · Play Aloud
            </button>
          </div>
        </div>

        {/* 3 Metric Bento Cards */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
          {/* Card 1: WCPM */}
          <div className="glass-card flex items-center justify-between rounded-[24px] p-4 sm:p-5">
            <div>
              <p className="font-telugu text-xs font-bold text-[#0F172A]">
                నిమిషానికి సరైన పదాలు
              </p>
              <p className="text-[11px] font-medium text-[#64748B]">
                Words Correct Per Minute
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-[#06B6D4]" />
              <CountUpNumber
                value={result.words_correct_per_minute}
                className="text-2xl font-extrabold text-[#0F172A]"
              />
            </div>
          </div>

          {/* Card 2: Fluency (5 glowing stars) */}
          <div className="glass-card flex items-center justify-between rounded-[24px] p-4 sm:p-5">
            <div>
              <p className="font-telugu text-xs font-bold text-[#0F172A]">ధారాళత</p>
              <p className="text-[11px] font-medium text-[#64748B]">
                Fluency ({result.fluency_score} / 5)
              </p>
            </div>
            <div className="flex items-center gap-1" aria-label={`Fluency ${result.fluency_score} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((starIdx) => {
                const filled = starIdx <= result.fluency_score;
                return (
                  <Star
                    key={starIdx}
                    className={`h-5 w-5 transition-transform ${
                      filled
                        ? 'fill-[#FFB800] text-[#FF6B00] drop-shadow-[0_0_6px_rgba(255,184,0,0.6)]'
                        : 'text-slate-300'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Card 3: Reading Level Badge */}
          <div className="glass-card flex items-center justify-between rounded-[24px] p-4 sm:p-5">
            <div>
              <p className="font-telugu text-xs font-bold text-[#0F172A]">చదువు స్థాయి</p>
              <p className="text-[11px] font-medium text-[#64748B]">Reading Level</p>
            </div>
            <div
              className={`flex items-center gap-2 rounded-[14px] px-3.5 py-2 text-white shadow-sm ${levelMeta.badgeBg}`}
            >
              <span className="text-sm font-extrabold">{levelMeta.code}</span>
              <span className="font-telugu text-xs font-bold">
                {levelMeta.nameTe} · {levelMeta.nameEn}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Passage Word Breakdown */}
      <section className="glass-card rounded-[24px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3.5">
          <div>
            <h2 className="font-telugu text-base font-extrabold text-[#0F172A]">
              పాఠం విశ్లేషణ · పదం నొక్కి ఉచ్చారణ వినండి
            </h2>
            <p className="text-xs font-medium text-[#64748B]">
              Tap any word to hear pronunciation · Red underline marks words needing practice
            </p>
          </div>
          <span className="text-xs font-bold text-[#64748B] tabular-nums">
            {result.mistakes.length} mistake{result.mistakes.length === 1 ? '' : 's'} noted
          </span>
        </div>

        <div
          className={`mt-5 flex flex-wrap gap-x-2 gap-y-2.5 leading-relaxed ${
            record.language === 'telugu'
              ? 'font-telugu text-[24px] sm:text-[26px]'
              : 'text-[22px] sm:text-[25px]'
          }`}
        >
          {passageTokens.map((token, idx) => {
            const norm = normalizeToken(token);
            const mistake = mistakeMap.get(norm);
            const key = `${idx}-${token}`;
            const isSpeaking = activeWordKey === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleWordTap(token, key, mistake)}
                className={`inline-flex items-center rounded-[10px] px-1.5 py-0.5 font-bold transition-all active:scale-95 ${
                  mistake
                    ? 'mistake-word text-red-900 hover:bg-red-100/80'
                    : 'text-[#0F172A] hover:bg-[#06B6D4]/12 hover:text-[#0891B2]'
                } ${isSpeaking ? 'ring-2 ring-[#FF6B00] bg-[#FF6B00]/15' : ''}`}
              >
                {token}
              </button>
            );
          })}
        </div>

        {/* Mistake Detail Pop-bar when a highlighted word is tapped */}
        {selectedMistake && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-red-200/80 bg-red-50/80 px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-extrabold text-red-800 uppercase">
                {selectedMistake.type}
              </span>
              <span className="text-slate-600">
                Expected:{' '}
                <strong className="font-telugu text-sm text-[#0F172A]">
                  {selectedMistake.expected}
                </strong>
              </span>
              <span className="text-slate-600">
                Spoken:{' '}
                <strong className="font-telugu text-sm text-red-700">
                  {selectedMistake.spoken || '(skipped)'}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => speakText(selectedMistake.expected, record.language)}
              className="flex items-center gap-1 font-bold text-[#FF6B00]"
            >
              <Volume2 className="h-4 w-4" />
              Hear Correct
            </button>
          </div>
        )}

        {/* Transcript Disclosure */}
        {result.transcript && (
          <div className="mt-5 rounded-[16px] bg-slate-50/85 px-4 py-3">
            <p className="text-[11px] font-bold text-[#64748B]">
              <span className="font-telugu">పిల్లవాడు చదివినది</span> · Child’s Spoken Transcript
            </p>
            <p
              className={`mt-1 text-sm font-medium text-[#0F172A] ${
                record.language === 'telugu' ? 'font-telugu' : ''
              }`}
            >
              {result.transcript}
            </p>
          </div>
        )}
      </section>

      {/* Practice For You — Horizontal Scroll Cards */}
      {result.practice_recommendation.length > 0 && (
        <section className="space-y-3">
          <div className="px-1">
            <h2 className="font-telugu text-base font-extrabold text-[#0F172A]">
              మీ కోసం అభ్యాసం
            </h2>
            <p className="text-xs font-medium text-[#64748B]">
              Practice for you · tap any card to listen and repeat aloud
            </p>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar">
            {result.practice_recommendation.map((item, idx) => (
              <motion.button
                key={`${item}-${idx}`}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => speakText(item, record.language)}
                className="glass-card flex min-w-[170px] shrink-0 flex-col items-start justify-between rounded-[22px] p-4 text-left transition-colors hover:border-[#FF6B00]/40 hover:bg-white sm:min-w-[200px]"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7C3AED]">
                    Practice #{idx + 1}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B00]/12 text-[#FF6B00]">
                    <Volume2 className="h-4 w-4" />
                  </span>
                </div>
                <p
                  className={`mt-3 text-xl font-extrabold text-[#0F172A] ${
                    record.language === 'telugu' ? 'font-telugu' : ''
                  }`}
                >
                  {item}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-[#64748B]">
                  <span className="font-telugu">వినడానికి నొక్కండి</span> · Tap to hear
                </p>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Teacher Action Card */}
      <section className="glass-card rounded-[24px] p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#7C3AED]/12 text-[#7C3AED]">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-telugu text-base font-extrabold text-[#0F172A]">
              ఉపాధ్యాయుని చర్యలు
            </h2>
            <p className="text-xs font-medium text-[#64748B]">
              Teacher Action & Classroom Intervention
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-[16px] bg-white/75 p-4 text-sm font-semibold leading-relaxed text-[#0F172A]">
          {result.teacher_note}
        </p>

        {result.teacher_intervention.length > 0 && (
          <ol className="mt-4 space-y-2.5">
            {result.teacher_intervention.map((action, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 rounded-[16px] border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-[#0F172A]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FFB800] text-xs font-extrabold text-white">
                  {idx + 1}
                </span>
                <span className="leading-snug">{action}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Bottom Action Bar: Re-assess, Next Student, Save */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onReassess}
          className="glass-card flex min-h-[52px] items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-bold text-[#0F172A] hover:bg-white"
        >
          <RotateCcw className="h-4 w-4 text-[#7C3AED]" />
          <span className="font-telugu">మళ్ళీ అంచనా</span>
          <span className="text-xs text-[#64748B]">/ Re-assess</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onNextStudent}
          className="secondary-gradient secondary-glow flex min-h-[52px] items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-bold text-white"
        >
          <span className="font-telugu">తదుపరి విద్యార్థి</span>
          <span className="text-xs text-white/90">/ Next Student</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleSaveClick}
          className={`flex min-h-[52px] items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-extrabold text-white transition-all ${
            justSaved
              ? 'bg-[#10B981] shadow-md shadow-emerald-500/25'
              : 'primary-gradient primary-glow'
          }`}
        >
          {justSaved ? (
            <>
              <Check className="h-4 w-4" />
              <span className="font-telugu">సేవ్ అయింది</span>
              <span className="text-xs text-white/90">/ Saved</span>
            </>
          ) : (
            <>
              <BookmarkCheck className="h-4 w-4" />
              <span className="font-telugu">సేవ్ చేయండి</span>
              <span className="text-xs text-white/90">/ Save</span>
            </>
          )}
        </motion.button>
      </section>
    </motion.div>
  );
}
