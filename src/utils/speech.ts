import { AssessmentRecord, Language, LEVEL_METADATA, Student, TeacherProfile } from '../types';

/**
 * Speaks a word or phrase aloud using the browser Web Speech Synthesis API,
 * preferring Telugu (te-IN) or Indian English (en-IN) voices.
 */
export function speakText(text: string, language: Language): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = language === 'telugu' ? 'te-IN' : 'en-IN';
    utterance.lang = targetLang;
    utterance.rate = language === 'telugu' ? 0.85 : 0.88;
    utterance.pitch = 1.05;

    const voices = synth.getVoices();
    if (voices.length > 0) {
      const exactMatch = voices.find((v) =>
        v.lang.toLowerCase().startsWith(language === 'telugu' ? 'te' : 'en-in')
      );
      const fallbackMatch =
        exactMatch ||
        voices.find((v) =>
          v.lang.toLowerCase().startsWith(language === 'telugu' ? 'hi' : 'en')
        );
      if (fallbackMatch) {
        utterance.voice = fallbackMatch;
      }
    }

    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates and downloads a UTF-8 BOM CSV report for the teacher's class.
 */
export function exportClassReportCSV(
  teacher: TeacherProfile | null,
  students: Student[],
  assessments: AssessmentRecord[]
): void {
  const escapeCell = (val: string | number) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headers = [
    'Roll No',
    'Student Name',
    'Telugu Name',
    'Class',
    'Gender',
    'Telugu Level',
    'English Level',
    'Total Assessments',
    'Latest Accuracy (%)',
    'Latest WCPM',
    'Latest Fluency (1-5)',
    'Last Assessed Date',
    'Latest Teacher Note',
  ];

  const rows = students.map((student) => {
    const studentAssessments = assessments
      .filter((a) => a.studentId === student.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = studentAssessments[0];

    const teMeta = LEVEL_METADATA[student.teluguLevel];
    const enMeta = LEVEL_METADATA[student.englishLevel];

    return [
      student.rollNumber,
      student.name,
      student.teluguName || '',
      `Class ${student.classGrade}`,
      student.gender,
      `${teMeta.code} - ${teMeta.nameEn} (${teMeta.nameTe})`,
      `${enMeta.code} - ${enMeta.nameEn}`,
      studentAssessments.length,
      latest ? latest.result.accuracy_percent : '',
      latest ? latest.result.words_correct_per_minute : '',
      latest ? latest.result.fluency_score : '',
      student.lastAssessedAt ? new Date(student.lastAssessedAt).toLocaleDateString('en-IN') : 'Not assessed',
      latest ? latest.result.teacher_note : '',
    ].map(escapeCell);
  });

  const metaLines = [
    [`Akshara Mapan — Class Reading Assessment Report`],
    [`School`, teacher?.school || 'Telangana Government Primary School'],
    [`Teacher`, teacher?.name || 'Teacher'],
    [`Generated`, new Date().toLocaleString('en-IN')],
    [],
    headers.map(escapeCell),
    ...rows,
  ];

  // Add UTF-8 BOM so Telugu Unicode characters open cleanly in Microsoft Excel
  const csvContent = '\uFEFF' + metaLines.map((line) => line.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const dateSlug = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `Akshara_Mapan_Report_${dateSlug}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatShortDate(isoDate: string | null): string {
  if (!isoDate) return 'Not yet';
  const d = new Date(isoDate);
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
