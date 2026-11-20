import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Mic,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Square,
  Upload,
  Volume2,
} from 'lucide-react';
import {
  AssessmentRecord,
  Language,
  LEVEL_METADATA,
  levelNameToIndex,
  ReadingLevelIndex,
  Student,
} from '../types';
import { getPassagesByLanguageAndLevel } from '../data/passages';
import { assessReadingAudio, BilingualApiError } from '../services/api';
import { AksharaLogo } from './AksharaLogo';
import { getInitials, speakText } from '../utils/speech';

interface AssessmentScreenProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  initialLevelOverride: ReadingLevelIndex | null;
  sessionStep: number; // 1 to 3
  onAssessmentComplete: (record: AssessmentRecord) => void;
}

const WAVE_BAR_COUNT = 22;

export function AssessmentScreen({
  students,
  selectedStudentId,
  onSelectStudent,
  language,
  onSelectLanguage,
  initialLevelOverride,
  sessionStep,
  onAssessmentComplete,
}: AssessmentScreenProps) {
  const activeStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  const studentBaselineLevel: ReadingLevelIndex = activeStudent
    ? language === 'telugu'
      ? activeStudent.teluguLevel
      : activeStudent.englishLevel
    : 0;

  const [currentLevel, setCurrentLevel] = useState<ReadingLevelIndex>(
    initialLevelOverride ?? studentBaselineLevel
  );
  const [passageIndex, setPassageIndex] = useState(0);
  const [adaptiveMode, setAdaptiveMode] = useState(true);

  // Sync level when student, language, or adaptive override changes
  useEffect(() => {
    if (initialLevelOverride !== null) {
      setCurrentLevel(initialLevelOverride);
    } else {
      setCurrentLevel(studentBaselineLevel);
    }
    setPassageIndex(0);
  }, [activeStudent?.id, language, initialLevelOverride, studentBaselineLevel]);

  const passagesForLevel = useMemo(
    () => getPassagesByLanguageAndLevel(language, currentLevel),
    [language, currentLevel]
  );
  const activePassage = passagesForLevel[passageIndex % passagesForLevel.length] || passagesForLevel[0];
  const levelMeta = LEVEL_METADATA[currentLevel];

  // Recording & audio analysis state
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(
    Array.from({ length: WAVE_BAR_COUNT }, () => 14)
  );
  const [isScoring, setIsScoring] = useState(false);
  const [errorState, setErrorState] = useState<{
    titleTe: string;
    titleEn: string;
    detail: string;
    canRetryScoring?: boolean;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const lastAudioPayloadRef = useRef<{
    base64: string;
    mimeType: string;
    durationSeconds: number;
  } | null>(null);

  const cleanupAudioResources = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setWaveformBars(Array.from({ length: WAVE_BAR_COUNT }, () => 14));
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, [cleanupAudioResources]);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = String(reader.result || '');
        const commaIdx = res.indexOf(',');
        resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
      };
      reader.onerror = () => reject(new Error('Could not read audio recording'));
      reader.readAsDataURL(blob);
    });

  const submitForScoring = useCallback(
    async (base64: string, mimeType: string, durationSeconds: number) => {
      if (!activeStudent || !activePassage) return;
      setErrorState(null);
      setIsScoring(true);
      lastAudioPayloadRef.current = { base64, mimeType, durationSeconds };

      try {
        const aiResult = await assessReadingAudio({
          audioBase64: base64,
          mimeType,
          passageText: activePassage.text,
          language,
          studentClass: activeStudent.classGrade,
          passageLevel: currentLevel,
          durationSeconds: Math.max(2, durationSeconds),
          studentName: activeStudent.name,
        });

        const assessedLevel = levelNameToIndex(aiResult.reading_level);

        const record: AssessmentRecord = {
          id: `asmt-${Date.now()}`,
          studentId: activeStudent.id,
          language,
          passageId: activePassage.id,
          passageText: activePassage.text,
          passageLevel: currentLevel,
          assessedLevel,
          durationSeconds: Math.max(2, durationSeconds),
          createdAt: new Date().toISOString(),
          result: aiResult,
        };

        setIsScoring(false);
        onAssessmentComplete(record);
      } catch (err) {
        setIsScoring(false);
        if (err instanceof BilingualApiError) {
          setErrorState({
            titleTe: err.messageTe,
            titleEn: err.messageEn,
            detail: 'Tap retry to re-score the same recording without asking the child to read again.',
            canRetryScoring: true,
          });
        } else {
          setErrorState({
            titleTe: 'AI అంచనాలో సమస్య వచ్చింది',
            titleEn: 'AI scoring encountered a network error',
            detail: 'Please check your internet connection and tap Retry.',
            canRetryScoring: true,
          });
        }
      }
    },
    [activeStudent, activePassage, language, currentLevel, onAssessmentComplete]
  );

  const startRecording = async () => {
    setErrorState(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setErrorState({
        titleTe: 'మైక్రోఫోన్ అందుబాటులో లేదు',
        titleEn: 'Microphone not available on this browser',
        detail: 'Allow microphone access or upload a recorded audio clip below.',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ];
      const chosenType =
        preferredTypes.find(
          (t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)
        ) || '';

      const recorder = chosenType
        ? new MediaRecorder(stream, { mimeType: chosenType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const durationSec = Math.max(
          2,
          Math.round((Date.now() - startedAtRef.current) / 1000)
        );
        cleanupAudioResources();

        const blobType = recorder.mimeType || chosenType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        if (audioBlob.size < 250) {
          setErrorState({
            titleTe: 'రికార్డింగ్ చాలా చిన్నదిగా ఉంది',
            titleEn: 'Recording was too short',
            detail: 'Please tap the mic and let the child read the passage aloud before tapping Stop.',
          });
          return;
        }

        try {
          const base64 = await blobToBase64(audioBlob);
          await submitForScoring(base64, blobType, durationSec);
        } catch {
          setErrorState({
            titleTe: 'ఆడియో ఫైల్ చదవలేకపోయాము',
            titleEn: 'Could not process the recorded audio',
            detail: 'Please tap the mic button and record again.',
          });
        }
      };

      // Live Web Audio Analyser for responsive waveform
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.78;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateWave = () => {
          analyser.getByteFrequencyData(dataArray);
          const nextBars: number[] = [];
          for (let i = 0; i < WAVE_BAR_COUNT; i++) {
            const idx = Math.floor((i / WAVE_BAR_COUNT) * Math.min(dataArray.length, 24));
            const raw = dataArray[idx] || 0;
            const pct = Math.max(14, Math.min(100, Math.round((raw / 255) * 100) + 12));
            nextBars.push(pct);
          }
          setWaveformBars(nextBars);
          rafRef.current = requestAnimationFrame(updateWave);
        };
        updateWave();
      } catch {
        // Waveform gracefully falls back to steady rhythm if AudioContext is restricted
      }

      startedAtRef.current = Date.now();
      setElapsedSeconds(0);
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);

      recorder.start(250);
      setIsRecording(true);
    } catch (err) {
      cleanupAudioResources();
      const name = err instanceof Error ? err.name : '';
      const denied = name === 'NotAllowedError' || name === 'PermissionDeniedError';
      setErrorState({
        titleTe: denied
          ? 'మైక్రోఫోన్ అనుమతి నిలిపివేయబడింది'
          : 'మైక్రోఫోన్ ప్రారంభించలేకపోయాము',
        titleEn: denied
          ? 'Microphone access is blocked'
          : 'Could not start microphone recording',
        detail: denied
          ? 'Please allow microphone permission in your browser bar and tap Retry, or upload an audio clip.'
          : 'Check that a microphone is connected and tap Retry.',
      });
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    } else {
      cleanupAudioResources();
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const base64 = await blobToBase64(file);
      await submitForScoring(base64, file.type || 'audio/webm', 15);
    } catch {
      setErrorState({
        titleTe: 'ఆడియో అప్‌లోడ్ విఫలమైంది',
        titleEn: 'Could not read the selected audio file',
        detail: 'Please try an MP3, WAV, M4A, or WebM recording.',
      });
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const rem = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${rem}`;
  };

  if (!activeStudent) {
    return (
      <div className="glass-card rounded-[24px] p-8 text-center">
        <p className="font-telugu text-base font-bold text-[#0F172A]">
          ముందుగా ఒక విద్యార్థిని చేర్చండి
        </p>
        <p className="mt-1 text-xs text-[#64748B]">
          Please add at least one student from the Students tab to start an assessment.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {/* Top Bar: Active Student Selector + Language Segmented Control */}
      <div className="glass-card flex flex-col gap-3 rounded-[24px] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${activeStudent.avatarGradient} text-xs font-extrabold text-white`}
          >
            {getInitials(activeStudent.name)}
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="assess-student-select" className="sr-only">
              Select student
            </label>
            <select
              id="assess-student-select"
              value={activeStudent.id}
              disabled={isRecording || isScoring}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="w-full max-w-[230px] cursor-pointer truncate rounded-lg bg-transparent text-base font-extrabold text-[#0F172A] focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Class {s.classGrade})
                </option>
              ))}
            </select>
            <p className="text-xs font-semibold text-[#64748B] tabular-nums">
              Roll #{activeStudent.rollNumber} ·{' '}
              <span className="font-telugu">పాఠం {sessionStep}/3</span> · Adaptive
            </p>
          </div>
        </div>

        {/* Segmented Language Toggle: తెలుగు | English */}
        <div
          role="tablist"
          aria-label="Assessment language"
          className="grid grid-cols-2 gap-1 rounded-[16px] bg-slate-100/90 p-1 sm:w-[220px]"
        >
          {(
            [
              { id: 'telugu', label: 'తెలుగు', sub: 'Telugu' },
              { id: 'english', label: 'English', sub: 'ఇంగ్లీష్' },
            ] as const
          ).map((tab) => {
            const active = language === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                disabled={isRecording || isScoring}
                onClick={() => onSelectLanguage(tab.id)}
                className={`relative flex min-h-[42px] items-center justify-center rounded-[12px] px-3 py-1.5 text-sm font-extrabold transition-colors ${
                  active ? 'text-white' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="lang-segmented-bg"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                    className="secondary-gradient absolute inset-0 rounded-[12px] shadow-sm"
                  />
                )}
                <span className={`relative z-10 ${tab.id === 'telugu' ? 'font-telugu' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ASER Level Switcher + Adaptive Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {([0, 1, 2, 3, 4] as ReadingLevelIndex[]).map((lvl) => {
            const meta = LEVEL_METADATA[lvl];
            const isSelected = currentLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                disabled={isRecording || isScoring}
                onClick={() => {
                  setAdaptiveMode(false);
                  setCurrentLevel(lvl);
                  setPassageIndex(0);
                }}
                className={`min-h-[38px] rounded-[12px] border px-3 py-1 text-xs font-extrabold whitespace-nowrap transition-all ${
                  isSelected
                    ? `${meta.badgeBg} border-transparent text-white shadow-sm`
                    : 'border-white/80 bg-white/75 text-[#64748B] hover:bg-white hover:text-[#0F172A]'
                }`}
              >
                {meta.code} ·{' '}
                <span className="font-telugu">
                  {language === 'telugu' ? meta.nameTe : meta.pluralEn}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isRecording || isScoring}
            onClick={() => setPassageIndex((prev) => (prev + 1) % passagesForLevel.length)}
            className="flex min-h-[38px] items-center gap-1.5 rounded-[12px] border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-bold text-[#0F172A] transition-colors hover:bg-white whitespace-nowrap"
          >
            <Shuffle className="h-3.5 w-3.5 text-[#7C3AED]" />
            <span className="font-telugu">వేరే పాఠం</span>
            <span className="text-[#64748B]">({(passageIndex % passagesForLevel.length) + 1}/{passagesForLevel.length})</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Passage Card + Mic Studio */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* Reading Passage Glass Card (30px+ Typography) */}
        <section className="glass-card rounded-[24px] p-5 sm:p-8 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3.5">
            <div>
              <p className={`text-xs font-extrabold ${levelMeta.textClass}`}>
                {levelMeta.code} ·{' '}
                <span className="font-telugu">{levelMeta.nameTe}</span> / {levelMeta.pluralEn}
                {adaptiveMode ? ' · Adaptive Start' : ''}
              </p>
              <h2 className="font-telugu mt-0.5 text-sm font-bold text-[#0F172A]">
                {activePassage.titleTe}{' '}
                <span className="font-sans text-xs font-medium text-[#64748B]">
                  / {activePassage.titleEn}
                </span>
              </h2>
            </div>

            <button
              type="button"
              disabled={isRecording || isScoring}
              onClick={() => speakText(activePassage.text, language)}
              className="flex min-h-[38px] items-center gap-1.5 rounded-[12px] bg-[#06B6D4]/12 px-3 py-1.5 text-xs font-bold text-[#0891B2] transition-colors hover:bg-[#06B6D4]/20"
            >
              <Volume2 className="h-4 w-4" />
              <span className="font-telugu">వినండి</span>
            </button>
          </div>

          {/* 30px+ High-Contrast Reading Passage */}
          <div className="mt-6 min-h-[160px] flex items-center">
            <p
              className={`w-full font-bold text-[#0F172A] ${
                language === 'telugu'
                  ? 'font-telugu text-[30px] leading-[1.7] tracking-normal sm:text-[34px]'
                  : 'text-[30px] leading-[1.55] tracking-tight sm:text-[34px]'
              } ${currentLevel === 0 ? 'tracking-[0.2em] text-center sm:text-[38px]' : ''}`}
            >
              {activePassage.text}
            </p>
          </div>

          <p className="mt-5 text-xs font-medium text-[#64748B]">
            <span className="font-telugu font-semibold text-[#0F172A]">
              పిల్లవాడిని స్పష్టంగా, గట్టిగా చదవమని చెప్పండి.
            </span>{' '}
            Ask the child to read aloud clearly near the phone microphone.
          </p>
        </section>

        {/* Mic Recording Studio Card */}
        <section className="glass-card flex flex-col items-center rounded-[24px] p-6 text-center lg:col-span-5">
          <div className="w-full">
            <p className="font-telugu text-sm font-extrabold text-[#0F172A]">
              {isRecording ? 'రికార్డింగ్ జరుగుతోంది...' : 'చదవడానికి మైక్ నొక్కండి'}
            </p>
            <p className="text-xs font-medium text-[#64748B]">
              {isRecording
                ? 'Listening to child reading · Tap Stop when finished'
                : 'Tap the mic button to record · Tap again to score'}
            </p>
          </div>

          {/* Live Waveform Visualizer */}
          <div
            className="mt-6 flex h-16 w-full max-w-[280px] items-center justify-center gap-1.5"
            aria-hidden="true"
          >
            {waveformBars.map((heightPct, idx) => (
              <motion.span
                key={idx}
                animate={{
                  height: isRecording ? `${heightPct}%` : '18%',
                  opacity: isRecording ? 1 : 0.35,
                }}
                transition={{ duration: 0.12 }}
                className="w-1.5 rounded-full"
                style={{
                  background: isRecording
                    ? idx % 2 === 0
                      ? 'linear-gradient(180deg, #FF6B00, #FFB800)'
                      : 'linear-gradient(180deg, #7C3AED, #EC4899)'
                    : '#CBD5E1',
                }}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F172A] tabular-nums">
            {formatTimer(elapsedSeconds)}
          </div>

          {/* Large Circular Gradient Mic Button with Glowing Pulse */}
          <div className="relative mt-6 flex items-center justify-center">
            {isRecording && (
              <>
                <motion.span
                  initial={{ scale: 0.9, opacity: 0.55 }}
                  animate={{ scale: 1.55, opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  className="pointer-events-none absolute h-24 w-24 rounded-full bg-[#EC4899]/40"
                />
                <motion.span
                  initial={{ scale: 0.9, opacity: 0.45 }}
                  animate={{ scale: 1.35, opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.45 }}
                  className="pointer-events-none absolute h-24 w-24 rounded-full bg-[#7C3AED]/45"
                />
              </>
            )}

            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.03 }}
              type="button"
              disabled={isScoring}
              onClick={isRecording ? stopRecording : startRecording}
              aria-label={isRecording ? 'Stop recording and score' : 'Start voice recording'}
              className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full text-white transition-all ${
                isRecording
                  ? 'secondary-gradient secondary-glow'
                  : 'primary-gradient primary-glow'
              }`}
            >
              {isRecording ? (
                <Square className="h-8 w-8 fill-white text-white" />
              ) : (
                <Mic className="h-10 w-10" strokeWidth={2.3} />
              )}
            </motion.button>
          </div>

          <p className="mt-4 text-xs font-bold text-[#0F172A]">
            {isRecording ? (
              <span className="font-telugu text-[#EC4899]">
                ఆపడానికి నొక్కండి · Tap to Stop & Score
              </span>
            ) : (
              <span className="font-telugu text-[#FF6B00]">
                రికార్డ్ ప్రారంభించండి · Tap to Record
              </span>
            )}
          </p>

          {/* Secondary Audio Upload Fallback for devices without a microphone */}
          {!isRecording && !isScoring && (
            <label className="mt-5 inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-[12px] border border-slate-200/80 bg-white/75 px-3.5 py-2 text-xs font-semibold text-[#64748B] transition-colors hover:bg-white hover:text-[#0F172A]">
              <Upload className="h-3.5 w-3.5" />
              <span className="font-telugu">ఆడియో అప్‌లోడ్</span>
              <span>/ Upload Audio</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Friendly Bilingual Error Card with Retry */}
          <AnimatePresence>
            {errorState && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-5 w-full rounded-[18px] border border-red-200 bg-red-50/90 p-4 text-left"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-telugu text-xs font-extrabold text-red-900">
                      {errorState.titleTe}
                    </p>
                    <p className="text-xs font-bold text-red-700">{errorState.titleEn}</p>
                    <p className="mt-1 text-[11px] text-red-700/90">{errorState.detail}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {errorState.canRetryScoring && lastAudioPayloadRef.current && (
                        <button
                          type="button"
                          onClick={() => {
                            const last = lastAudioPayloadRef.current;
                            if (last) {
                              submitForScoring(last.base64, last.mimeType, last.durationSeconds);
                            }
                          }}
                          className="flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[#EF4444] px-3 py-1.5 text-xs font-bold text-white"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span className="font-telugu">మళ్ళీ అంచనా</span> · Retry AI
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setErrorState(null);
                          startRecording();
                        }}
                        className="flex min-h-[36px] items-center gap-1.5 rounded-[10px] border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-800"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="font-telugu">మళ్ళీ రికార్డ్</span> · Re-record
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* AI Scoring Loading Modal with Sweeping Gauge Needle */}
      <AnimatePresence>
        {isScoring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="glass-card flex w-full max-w-sm flex-col items-center rounded-[28px] px-7 py-9 text-center"
            >
              <AksharaLogo size={96} animateMode="loading" />
              <h3 className="font-telugu mt-5 text-lg font-extrabold text-[#0F172A]">
                మీ చదువును అంచనా వేస్తున్నాం...
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#64748B]">
                Assessing your reading...
              </p>
              <p className="mt-3 text-xs text-[#64748B]">
                Listening word by word for accuracy, speed & fluency
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
