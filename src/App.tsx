import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  AssessmentRecord,
  Language,
  NavTab,
  ReadingLevelIndex,
  SmartGroupSuggestion,
  Student,
  TeacherProfile,
} from './types';
import {
  loadAssessments,
  loadSmartGroups,
  loadStudents,
  loadTeacherProfile,
  saveAssessments,
  saveSmartGroups,
  saveStudents,
  saveTeacherProfile,
} from './utils/storage';
import { buildDefaultSmartGroups } from './data/demoData';
import { AmbientBackground } from './components/AmbientBackground';
import { BottomNav } from './components/BottomNav';
import { SplashScreen, TeacherOnboarding } from './components/SplashAndOnboarding';
import { HomeScreen } from './components/HomeScreen';
import { StudentsScreen } from './components/StudentsScreen';
import { AssessmentScreen } from './components/AssessmentScreen';
import { ReportCardScreen } from './components/ReportCardScreen';
import { InsightsScreen } from './components/InsightsScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(() => loadTeacherProfile());
  const [editingTeacher, setEditingTeacher] = useState(false);

  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [assessments, setAssessments] = useState<AssessmentRecord[]>(() => loadAssessments());
  const [smartGroups, setSmartGroups] = useState<SmartGroupSuggestion[]>(() =>
    loadSmartGroups(loadStudents())
  );

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    () => loadStudents()[0]?.id || ''
  );
  const [assessLanguage, setAssessLanguage] = useState<Language>('telugu');
  const [adaptiveLevelOverride, setAdaptiveLevelOverride] =
    useState<ReadingLevelIndex | null>(null);
  const [sessionStep, setSessionStep] = useState<number>(1);

  // Active report card view (either freshly scored or opened from history)
  const [activeReport, setActiveReport] = useState<{
    record: AssessmentRecord;
    isNew: boolean;
  } | null>(null);

  // Auto-dismiss splash screen after animated logo gauge sweep
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 1750);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSaveTeacher = (profile: TeacherProfile) => {
    setTeacher(profile);
    saveTeacherProfile(profile);
    setEditingTeacher(false);
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => {
      const next = [newStudent, ...prev];
      saveStudents(next);
      setSmartGroups(buildDefaultSmartGroups(next));
      return next;
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((s) => s.id !== studentId);
      saveStudents(next);
      setSmartGroups(buildDefaultSmartGroups(next));
      if (selectedStudentId === studentId && next[0]) {
        setSelectedStudentId(next[0].id);
      }
      return next;
    });
  };

  const persistAssessmentRecord = (record: AssessmentRecord) => {
    setAssessments((prev) => {
      const exists = prev.some((a) => a.id === record.id);
      const next = exists
        ? prev.map((a) => (a.id === record.id ? record : a))
        : [record, ...prev];
      saveAssessments(next);
      return next;
    });

    setStudents((prev) => {
      const next = prev.map((s) => {
        if (s.id !== record.studentId) return s;
        return {
          ...s,
          teluguLevel:
            record.language === 'telugu' ? record.assessedLevel : s.teluguLevel,
          englishLevel:
            record.language === 'english' ? record.assessedLevel : s.englishLevel,
          lastAssessedAt: record.createdAt,
        };
      });
      saveStudents(next);
      setSmartGroups(buildDefaultSmartGroups(next));
      return next;
    });
  };

  const handleStartAssessment = (studentId?: string) => {
    if (studentId) {
      setSelectedStudentId(studentId);
    } else if (!students.some((s) => s.id === selectedStudentId) && students[0]) {
      setSelectedStudentId(students[0].id);
    }
    setAdaptiveLevelOverride(null);
    setSessionStep(1);
    setActiveReport(null);
    setActiveTab('assess');
  };

  const handleAssessmentComplete = (record: AssessmentRecord) => {
    persistAssessmentRecord(record);
    setActiveReport({ record, isNew: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHistoryReport = (record: AssessmentRecord) => {
    setActiveReport({ record, isNew: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdaptiveContinue = (nextLevel: ReadingLevelIndex) => {
    setAdaptiveLevelOverride(nextLevel);
    setSessionStep((prev) => Math.min(3, prev + 1));
    setActiveReport(null);
    setActiveTab('assess');
  };

  const handleNextStudent = () => {
    if (students.length === 0) return;
    const idx = students.findIndex((s) => s.id === selectedStudentId);
    const nextStudent = students[(idx + 1) % students.length];
    setSelectedStudentId(nextStudent.id);
    setAdaptiveLevelOverride(null);
    setSessionStep(1);
    setActiveReport(null);
    setActiveTab('assess');
  };

  const handleUpdateSmartGroups = (groups: SmartGroupSuggestion[]) => {
    setSmartGroups(groups);
    saveSmartGroups(groups);
  };

  const reportStudent = useMemo(() => {
    if (!activeReport) return null;
    return (
      students.find((s) => s.id === activeReport.record.studentId) ||
      students[0] ||
      null
    );
  }, [activeReport, students]);

  const isReportSaved = useMemo(() => {
    if (!activeReport) return false;
    return assessments.some((a) => a.id === activeReport.record.id);
  }, [activeReport, assessments]);

  return (
    <div className="relative min-h-screen w-full text-[#0F172A]">
      <AmbientBackground />

      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {!showSplash && (!teacher || editingTeacher) ? (
        <TeacherOnboarding
          initialProfile={teacher}
          onSave={handleSaveTeacher}
          onCancel={teacher ? () => setEditingTeacher(false) : undefined}
        />
      ) : null}

      {!showSplash && teacher && !editingTeacher && (
        <>
          <main className="mx-auto w-full max-w-6xl px-4 pt-4 pb-28 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {activeReport && reportStudent ? (
                <ReportCardScreen
                  key={`report-${activeReport.record.id}`}
                  record={activeReport.record}
                  student={reportStudent}
                  isNewResult={activeReport.isNew}
                  sessionStep={sessionStep}
                  isSaved={isReportSaved}
                  onSave={persistAssessmentRecord}
                  onReassess={() => {
                    setAdaptiveLevelOverride(activeReport.record.passageLevel);
                    setActiveReport(null);
                    setActiveTab('assess');
                  }}
                  onAdaptiveContinue={handleAdaptiveContinue}
                  onNextStudent={handleNextStudent}
                  onBack={() => setActiveReport(null)}
                />
              ) : activeTab === 'home' ? (
                <HomeScreen
                  key="home"
                  teacher={teacher}
                  students={students}
                  assessments={assessments}
                  onStartAssessment={handleStartAssessment}
                  onOpenReport={handleOpenHistoryReport}
                  onGoToInsights={() => setActiveTab('insights')}
                  onGoToStudents={() => setActiveTab('students')}
                  onEditTeacher={() => setEditingTeacher(true)}
                />
              ) : activeTab === 'students' ? (
                <StudentsScreen
                  key="students"
                  students={students}
                  assessments={assessments}
                  onAddStudent={handleAddStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onAssessStudent={handleStartAssessment}
                  onOpenReport={handleOpenHistoryReport}
                />
              ) : activeTab === 'assess' ? (
                <AssessmentScreen
                  key="assess"
                  students={students}
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={(id) => {
                    setSelectedStudentId(id);
                    setAdaptiveLevelOverride(null);
                    setSessionStep(1);
                  }}
                  language={assessLanguage}
                  onSelectLanguage={(lang) => {
                    setAssessLanguage(lang);
                    setAdaptiveLevelOverride(null);
                    setSessionStep(1);
                  }}
                  initialLevelOverride={adaptiveLevelOverride}
                  sessionStep={sessionStep}
                  onAssessmentComplete={handleAssessmentComplete}
                />
              ) : (
                <InsightsScreen
                  key="insights"
                  teacher={teacher}
                  students={students}
                  assessments={assessments}
                  smartGroups={smartGroups}
                  onUpdateSmartGroups={handleUpdateSmartGroups}
                  onAssessStudent={handleStartAssessment}
                />
              )}
            </AnimatePresence>
          </main>

          <BottomNav
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveReport(null);
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
}
