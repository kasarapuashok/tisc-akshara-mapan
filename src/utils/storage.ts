import {
  AssessmentRecord,
  SmartGroupSuggestion,
  Student,
  TeacherProfile,
} from '../types';
import {
  buildDefaultSmartGroups,
  DEMO_ASSESSMENTS,
  DEMO_STUDENTS,
} from '../data/demoData';

const KEYS = {
  TEACHER: 'akshara_mapan_teacher_v1',
  STUDENTS: 'akshara_mapan_students_v1',
  ASSESSMENTS: 'akshara_mapan_assessments_v1',
  SMART_GROUPS: 'akshara_mapan_smart_groups_v1',
};

export function loadTeacherProfile(): TeacherProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.TEACHER);
    if (!raw) return null;
    return JSON.parse(raw) as TeacherProfile;
  } catch {
    return null;
  }
}

export function saveTeacherProfile(profile: TeacherProfile): void {
  try {
    localStorage.setItem(KEYS.TEACHER, JSON.stringify(profile));
  } catch {
    // ignore storage quota errors
  }
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(DEMO_STUDENTS));
      return DEMO_STUDENTS;
    }
    const parsed = JSON.parse(raw) as Student[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_STUDENTS;
  } catch {
    return DEMO_STUDENTS;
  }
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch {
    // ignore
  }
}

export function loadAssessments(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.ASSESSMENTS);
    if (!raw) {
      localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(DEMO_ASSESSMENTS));
      return DEMO_ASSESSMENTS;
    }
    const parsed = JSON.parse(raw) as AssessmentRecord[];
    return Array.isArray(parsed) ? parsed : DEMO_ASSESSMENTS;
  } catch {
    return DEMO_ASSESSMENTS;
  }
}

export function saveAssessments(assessments: AssessmentRecord[]): void {
  try {
    localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(assessments));
  } catch {
    // ignore
  }
}

export function loadSmartGroups(students: Student[]): SmartGroupSuggestion[] {
  try {
    const raw = localStorage.getItem(KEYS.SMART_GROUPS);
    if (!raw) return buildDefaultSmartGroups(students);
    const parsed = JSON.parse(raw) as SmartGroupSuggestion[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : buildDefaultSmartGroups(students);
  } catch {
    return buildDefaultSmartGroups(students);
  }
}

export function saveSmartGroups(groups: SmartGroupSuggestion[]): void {
  try {
    localStorage.setItem(KEYS.SMART_GROUPS, JSON.stringify(groups));
  } catch {
    // ignore
  }
}
