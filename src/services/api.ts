import {
  AssessmentAIResult,
  Language,
  ReadingLevelIndex,
  SmartGroupSuggestion,
  Student,
} from '../types';

export interface AssessAudioPayload {
  audioBase64: string;
  mimeType: string;
  passageText: string;
  language: Language;
  studentClass: number;
  passageLevel: ReadingLevelIndex;
  durationSeconds: number;
  studentName: string;
}

export class BilingualApiError extends Error {
  messageTe: string;
  messageEn: string;
  code: string;

  constructor(code: string, messageTe: string, messageEn: string) {
    super(messageEn);
    this.code = code;
    this.messageTe = messageTe;
    this.messageEn = messageEn;
  }
}

export async function assessReadingAudio(
  payload: AssessAudioPayload
): Promise<AssessmentAIResult> {
  const res = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.result) {
    throw new BilingualApiError(
      data.error || 'ASSESSMENT_FAILED',
      data.messageTe || 'AI అంచనా విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
      data.messageEn || 'AI assessment could not complete. Please try again.'
    );
  }

  return data.result as AssessmentAIResult;
}

export async function fetchAISmartGroups(
  students: Student[],
  language: Language
): Promise<SmartGroupSuggestion[]> {
  const res = await fetch('/api/smart-groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
        classGrade: s.classGrade,
        teluguLevel: s.teluguLevel,
        englishLevel: s.englishLevel,
      })),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(data.groups)) {
    throw new BilingualApiError(
      data.error || 'SMART_GROUPS_FAILED',
      data.messageTe || 'స్మార్ట్ గ్రూపులను పొందలేకపోయాము. మళ్ళీ ప్రయత్నించండి.',
      data.messageEn || 'Could not generate AI classroom groups. Please try again.'
    );
  }

  return data.groups as SmartGroupSuggestion[];
}
