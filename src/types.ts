export type Language = 'telugu' | 'english';

export type ReadingLevelIndex = 0 | 1 | 2 | 3 | 4;

export type ReadingLevelName = 'Letter' | 'Word' | 'Sentence' | 'Paragraph' | 'Story';

export type NavTab = 'home' | 'students' | 'assess' | 'insights';

export interface TeacherProfile {
  name: string;
  school: string;
  district?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  teluguName?: string;
  classGrade: 1 | 2 | 3 | 4 | 5;
  rollNumber: string;
  gender: 'girl' | 'boy' | 'other';
  teluguLevel: ReadingLevelIndex;
  englishLevel: ReadingLevelIndex;
  lastAssessedAt: string | null;
  avatarGradient: string;
}

export interface Passage {
  id: string;
  language: Language;
  level: ReadingLevelIndex;
  titleTe: string;
  titleEn: string;
  text: string;
  wordCount: number;
}

export interface ReadingMistake {
  expected: string;
  spoken: string;
  type: 'skipped' | 'substituted' | 'mispronounced';
}

export interface AssessmentAIResult {
  transcript: string;
  accuracy_percent: number;
  words_correct_per_minute: number;
  fluency_score: number; // 1 to 5
  mistakes: ReadingMistake[];
  reading_level: ReadingLevelName;
  feedback_child: string;
  teacher_note: string;
  practice_recommendation: string[];
  teacher_intervention: string[];
}

export interface AssessmentRecord {
  id: string;
  studentId: string;
  language: Language;
  passageId: string;
  passageText: string;
  passageLevel: ReadingLevelIndex;
  assessedLevel: ReadingLevelIndex;
  durationSeconds: number;
  createdAt: string;
  result: AssessmentAIResult;
}

export interface SmartGroupSuggestion {
  groupId: string;
  groupNameTe: string;
  groupNameEn: string;
  levelRange: string;
  levelIndices: ReadingLevelIndex[];
  studentIds: string[];
  activityTitleTe: string;
  activityTitleEn: string;
  activityDescription: string;
  durationMinutes: number;
}

export interface LevelMeta {
  index: ReadingLevelIndex;
  code: string;
  nameEn: ReadingLevelName;
  pluralEn: string;
  nameTe: string;
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeBg: string;
}

export const LEVEL_METADATA: Record<ReadingLevelIndex, LevelMeta> = {
  0: {
    index: 0,
    code: 'L0',
    nameEn: 'Letter',
    pluralEn: 'Letters',
    nameTe: 'అక్షరాలు',
    colorHex: '#EF4444',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-700',
    borderClass: 'border-red-500/25',
    badgeBg: 'bg-[#EF4444]',
  },
  1: {
    index: 1,
    code: 'L1',
    nameEn: 'Word',
    pluralEn: 'Words',
    nameTe: 'పదాలు',
    colorHex: '#FF6B00',
    bgClass: 'bg-orange-500/12',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-500/25',
    badgeBg: 'bg-[#FF6B00]',
  },
  2: {
    index: 2,
    code: 'L2',
    nameEn: 'Sentence',
    pluralEn: 'Sentences',
    nameTe: 'వాక్యాలు',
    colorHex: '#F59E0B',
    bgClass: 'bg-amber-500/14',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-500/30',
    badgeBg: 'bg-[#F59E0B]',
  },
  3: {
    index: 3,
    code: 'L3',
    nameEn: 'Paragraph',
    pluralEn: 'Paragraph',
    nameTe: 'పేరా',
    colorHex: '#06B6D4',
    bgClass: 'bg-cyan-500/12',
    textClass: 'text-cyan-800',
    borderClass: 'border-cyan-500/25',
    badgeBg: 'bg-[#06B6D4]',
  },
  4: {
    index: 4,
    code: 'L4',
    nameEn: 'Story',
    pluralEn: 'Story',
    nameTe: 'కథ',
    colorHex: '#10B981',
    bgClass: 'bg-emerald-500/12',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-500/25',
    badgeBg: 'bg-[#10B981]',
  },
};

export function levelNameToIndex(name: string): ReadingLevelIndex {
  const normalized = name.toLowerCase();
  if (normalized.includes('story')) return 4;
  if (normalized.includes('para')) return 3;
  if (normalized.includes('sent')) return 2;
  if (normalized.includes('word')) return 1;
  return 0;
}
