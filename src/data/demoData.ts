import { AssessmentRecord, SmartGroupSuggestion, Student } from '../types';

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

export const AVATAR_GRADIENTS = [
  'from-[#FF6B00] to-[#FFB800]',
  'from-[#7C3AED] to-[#EC4899]',
  'from-[#06B6D4] to-[#3B82F6]',
  'from-[#10B981] to-[#06B6D4]',
  'from-[#F59E0B] to-[#EC4899]',
];

export const DEMO_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    name: 'Kavya Reddy',
    teluguName: 'కావ్య రెడ్డి',
    classGrade: 4,
    rollNumber: '401',
    gender: 'girl',
    teluguLevel: 4,
    englishLevel: 3,
    lastAssessedAt: daysAgo(1),
    avatarGradient: AVATAR_GRADIENTS[1],
  },
  {
    id: 'stu-2',
    name: 'Sai Kiran',
    teluguName: 'సాయి కిరణ్',
    classGrade: 3,
    rollNumber: '304',
    gender: 'boy',
    teluguLevel: 2,
    englishLevel: 1,
    lastAssessedAt: daysAgo(2),
    avatarGradient: AVATAR_GRADIENTS[0],
  },
  {
    id: 'stu-3',
    name: 'Lakshmi Priya',
    teluguName: 'లక్ష్మి ప్రియ',
    classGrade: 2,
    rollNumber: '208',
    gender: 'girl',
    teluguLevel: 1,
    englishLevel: 0,
    lastAssessedAt: daysAgo(3),
    avatarGradient: AVATAR_GRADIENTS[4],
  },
  {
    id: 'stu-4',
    name: 'Raju Naik',
    teluguName: 'రాజు నాయక్',
    classGrade: 1,
    rollNumber: '112',
    gender: 'boy',
    teluguLevel: 0,
    englishLevel: 0,
    lastAssessedAt: daysAgo(4),
    avatarGradient: AVATAR_GRADIENTS[2],
  },
  {
    id: 'stu-5',
    name: 'Ananya Goud',
    teluguName: 'అనన్య గౌడ్',
    classGrade: 5,
    rollNumber: '503',
    gender: 'girl',
    teluguLevel: 3,
    englishLevel: 3,
    lastAssessedAt: daysAgo(1),
    avatarGradient: AVATAR_GRADIENTS[3],
  },
];

export const DEMO_ASSESSMENTS: AssessmentRecord[] = [
  // Kavya Reddy — progressive Telugu & English
  {
    id: 'asmt-101',
    studentId: 'stu-1',
    language: 'telugu',
    passageId: 'te-l3-1',
    passageText:
      'మా ఊరి చివర ఒక పెద్ద చెరువు ఉంది. వర్షాకాలంలో ఆ చెరువు నిండా నీరు చేరుతుంది. చెరువు గట్టున వేప చెట్లు, తాడి చెట్లు ఎత్తుగా పెరిగాయి.',
    passageLevel: 3,
    assessedLevel: 3,
    durationSeconds: 34,
    createdAt: daysAgo(18),
    result: {
      transcript:
        'మా ఊరి చివర ఒక పెద్ద చెరువు ఉంది. వర్షాకాలంలో ఆ చెరువు నిండా నీరు చేరుతుంది. చెరువు గట్టున వేప చెట్లు, తాడి చెట్లు ఎత్తుగా పెరిగాయి.',
      accuracy_percent: 84,
      words_correct_per_minute: 54,
      fluency_score: 4,
      mistakes: [
        { expected: 'వర్షాకాలంలో', spoken: 'వర్షకాలంలో', type: 'mispronounced' },
      ],
      reading_level: 'Paragraph',
      feedback_child: 'చాలా బాగా చదివావు కావ్య! నీ వేగం అద్భుతంగా ఉంది.',
      teacher_note: 'Kavya reads paragraphs smoothly and is ready to move to full Telugu stories.',
      practice_recommendation: ['వర్షాకాలంలో', 'తాడి చెట్లు', 'పెరిగాయి'],
      teacher_intervention: [
        'Introduce Level 4 moral stories with expression practice.',
        'Ask 2 comprehension questions after reading aloud.',
      ],
    },
  },
  {
    id: 'asmt-102',
    studentId: 'stu-1',
    language: 'telugu',
    passageId: 'te-l4-1',
    passageText:
      'ఒక ఎండాకాలం మధ్యాహ్నం ఒక కాకికి విపరీతంగా దాహం వేసింది. నీళ్ళ కోసం ఊరంతా తిరిగినా ఎక్కడా చుక్క నీరు దొరకలేదు. చివరకు ఒక తోటలో దానికి ఒక మట్టి కుండ కనిపించింది. ఆ కుండ అడుగున చాలా కొద్దిగా నీళ్ళు ఉన్నాయి. కాకి ముక్కు ఆ నీళ్ళకు అందలేదు.',
    passageLevel: 4,
    assessedLevel: 4,
    durationSeconds: 42,
    createdAt: daysAgo(1),
    result: {
      transcript:
        'ఒక ఎండాకాలం మధ్యాహ్నం ఒక కాకికి విపరీతంగా దాహం వేసింది. నీళ్ళ కోసం ఊరంతా తిరిగినా ఎక్కడా చుక్క నీరు దొరకలేదు. చివరకు ఒక తోటలో దానికి ఒక మట్టి కుండ కనిపించింది.',
      accuracy_percent: 93,
      words_correct_per_minute: 68,
      fluency_score: 5,
      mistakes: [
        { expected: 'విపరీతంగా', spoken: 'విపరితంగా', type: 'mispronounced' },
      ],
      reading_level: 'Story',
      feedback_child: 'శభాష్ కావ్య! కథను ఎంతో స్పష్టంగా, అందంగా చదివావు!',
      teacher_note: 'Strong independent story reader with natural pacing and expression.',
      practice_recommendation: ['విపరీతంగా', 'మధ్యాహ్నం', 'సంతోషంగా'],
      teacher_intervention: [
        'Pair Kavya as a reading buddy for Class 2 learners during library hour.',
        'Encourage writing a 3-line summary after each story.',
      ],
    },
  },
  {
    id: 'asmt-103',
    studentId: 'stu-1',
    language: 'english',
    passageId: 'en-l3-1',
    passageText:
      'Our government school has a bright reading corner with many colourful storybooks. Every afternoon after lunch, we sit on mats and pick a book to read.',
    passageLevel: 3,
    assessedLevel: 3,
    durationSeconds: 31,
    createdAt: daysAgo(5),
    result: {
      transcript:
        'Our government school has a bright reading corner with many colourful storybooks. Every afternoon after lunch we sit on mats and pick a book to read.',
      accuracy_percent: 86,
      words_correct_per_minute: 55,
      fluency_score: 4,
      mistakes: [
        { expected: 'government', spoken: 'goverment', type: 'mispronounced' },
        { expected: 'colourful', spoken: 'color', type: 'substituted' },
      ],
      reading_level: 'Paragraph',
      feedback_child: 'Wonderful job Kavya! You read English with great confidence!',
      teacher_note: 'Reads English paragraphs clearly; minor hesitation on multi-syllable words.',
      practice_recommendation: ['government', 'colourful', 'afternoon'],
      teacher_intervention: [
        'Break 3-syllable words into clapped chunks (af-ter-noon).',
        'Assign one short English storybook per week.',
      ],
    },
  },

  // Sai Kiran
  {
    id: 'asmt-201',
    studentId: 'stu-2',
    language: 'telugu',
    passageId: 'te-l1-1',
    passageText: 'అమ్మ నాన్న ఇల్లు పండు పాలు నీరు బడి పలక కలం పుస్తకం',
    passageLevel: 1,
    assessedLevel: 1,
    durationSeconds: 26,
    createdAt: daysAgo(15),
    result: {
      transcript: 'అమ్మ నాన్న ఇల్లు పండు పాలు నీరు బడి పలక కలం పుస్తకం',
      accuracy_percent: 72,
      words_correct_per_minute: 28,
      fluency_score: 3,
      mistakes: [
        { expected: 'పుస్తకం', spoken: 'పుతకం', type: 'mispronounced' },
      ],
      reading_level: 'Word',
      feedback_child: 'బాగుంది సాయి కిరణ్! పదాలు బాగా గుర్తుపట్టావు.',
      teacher_note: 'Decodes simple Telugu words well; needs practice with conjunct consonants (ఒత్తులు).',
      practice_recommendation: ['పుస్తకం', 'ఇల్లు', 'పండు'],
      teacher_intervention: [
        'Practice 5 common ottulu (double-consonant) flashcards daily.',
        'Transition to 4-word simple sentences next week.',
      ],
    },
  },
  {
    id: 'asmt-202',
    studentId: 'stu-2',
    language: 'telugu',
    passageId: 'te-l2-1',
    passageText: 'ఇది మా బడి. మా బడి చాలా బాగుంది. నేను రోజూ బడికి వెళ్తాను. మా ఉపాధ్యాయులు బాగా చెబుతారు.',
    passageLevel: 2,
    assessedLevel: 2,
    durationSeconds: 28,
    createdAt: daysAgo(2),
    result: {
      transcript: 'ఇది మా బడి. మా బడి చాలా బాగుంది. నేను రోజూ బడికి వెళ్తాను. మా ఉపాధ్యాయులు బాగా చెబుతారు.',
      accuracy_percent: 78,
      words_correct_per_minute: 39,
      fluency_score: 3,
      mistakes: [
        { expected: 'ఉపాధ్యాయులు', spoken: 'ఉపాదాయులు', type: 'mispronounced' },
        { expected: 'వెళ్తాను', spoken: 'వెలుతాను', type: 'substituted' },
      ],
      reading_level: 'Sentence',
      feedback_child: 'చాలా బాగుంది సాయి కిరణ్! వాక్యాలు చదవడంలో మంచి ప్రగతి సాధించావు.',
      teacher_note: 'Improved from Word to Sentence level; pauses briefly at compound letters.',
      practice_recommendation: ['ఉపాధ్యాయులు', 'వెళ్తాను', 'చాలా బాగుంది'],
      teacher_intervention: [
        'Use echo-reading for longer Telugu sentences during morning assembly.',
        'Practice finger-tracking under each phrase to build smoother flow.',
      ],
    },
  },
  {
    id: 'asmt-203',
    studentId: 'stu-2',
    language: 'english',
    passageId: 'en-l1-1',
    passageText: 'cat dog sun tree book fish ball milk hand star',
    passageLevel: 1,
    assessedLevel: 1,
    durationSeconds: 29,
    createdAt: daysAgo(6),
    result: {
      transcript: 'cat dog sun tre book fis ball milk hand star',
      accuracy_percent: 64,
      words_correct_per_minute: 24,
      fluency_score: 2,
      mistakes: [
        { expected: 'tree', spoken: 'tre', type: 'mispronounced' },
        { expected: 'fish', spoken: 'fis', type: 'mispronounced' },
        { expected: 'star', spoken: '', type: 'skipped' },
      ],
      reading_level: 'Word',
      feedback_child: 'Good try Sai Kiran! You read so many English words nicely.',
      teacher_note: 'Recognises CVC words well; needs phonics support for sh/ee/st blends.',
      practice_recommendation: ['tree', 'fish', 'star'],
      teacher_intervention: [
        'Run a 5-minute phonics sound-blend drill (sh, ee, st) with picture cards.',
        'Have Sai Kiran read 5 sight words aloud to a partner daily.',
      ],
    },
  },

  // Lakshmi Priya (Needs Support)
  {
    id: 'asmt-301',
    studentId: 'stu-3',
    language: 'telugu',
    passageId: 'te-l0-1',
    passageText: 'అ ఆ ఇ ఈ ఉ ఊ క గ చ ట త ప మ ర ల',
    passageLevel: 0,
    assessedLevel: 0,
    durationSeconds: 35,
    createdAt: daysAgo(14),
    result: {
      transcript: 'అ ఆ ఇ ఈ ఉ ఊ క గ చ ట త ప మ ర ల',
      accuracy_percent: 65,
      words_correct_per_minute: 18,
      fluency_score: 2,
      mistakes: [
        { expected: 'ఊ', spoken: 'ఉ', type: 'substituted' },
        { expected: 'ట', spoken: 'త', type: 'substituted' },
      ],
      reading_level: 'Letter',
      feedback_child: 'మంచి ప్రయత్నం లక్ష్మి! అక్షరాలు బాగా చెబుతున్నావు.',
      teacher_note: 'Knows most basic vowels; confuses ట and త.',
      practice_recommendation: ['ఊ', 'ట', 'త'],
      teacher_intervention: [
        'Use tactile sand/slate tracing to contrast ట and త.',
        'Play a quick 3-minute letter recognition game at the start of class.',
      ],
    },
  },
  {
    id: 'asmt-302',
    studentId: 'stu-3',
    language: 'telugu',
    passageId: 'te-l1-2',
    passageText: 'చెట్టు పువ్వు ఆకు వాన ఎండ నది కొండ పక్షి చేప ఆవు',
    passageLevel: 1,
    assessedLevel: 1,
    durationSeconds: 32,
    createdAt: daysAgo(3),
    result: {
      transcript: 'చెట్టు పువ్వు ఆకు వాన ఎండ నది కొండ చేప ఆవు',
      accuracy_percent: 58,
      words_correct_per_minute: 22,
      fluency_score: 2,
      mistakes: [
        { expected: 'పక్షి', spoken: '', type: 'skipped' },
        { expected: 'చెట్టు', spoken: 'చెటు', type: 'mispronounced' },
        { expected: 'కొండ', spoken: 'కొడ', type: 'mispronounced' },
      ],
      reading_level: 'Word',
      feedback_child: 'భేష్ లక్ష్మి ప్రియ! ఇప్పుడు చిన్న పదాలు చదవడం మొదలుపెట్టావు!',
      teacher_note: 'Moved up to Word level; needs guided blending for guninthalu and sunna (ం).',
      practice_recommendation: ['పక్షి', 'చెట్టు', 'కొండ'],
      teacher_intervention: [
        'Group Lakshmi in the Word Builders table for 15 minutes daily.',
        'Use picture-to-word matching cards for everyday Telugu nouns.',
      ],
    },
  },
  {
    id: 'asmt-303',
    studentId: 'stu-3',
    language: 'english',
    passageId: 'en-l0-1',
    passageText: 'A B D E G H K M P R S T W',
    passageLevel: 0,
    assessedLevel: 0,
    durationSeconds: 30,
    createdAt: daysAgo(3),
    result: {
      transcript: 'A B D E H M P R S T',
      accuracy_percent: 46,
      words_correct_per_minute: 14,
      fluency_score: 2,
      mistakes: [
        { expected: 'G', spoken: 'J', type: 'substituted' },
        { expected: 'K', spoken: '', type: 'skipped' },
        { expected: 'W', spoken: 'M', type: 'substituted' },
      ],
      reading_level: 'Letter',
      feedback_child: 'Good effort Lakshmi! Keep singing the ABC letters with a smile!',
      teacher_note: 'Needs extra support identifying G, K, and W in English.',
      practice_recommendation: ['G', 'K', 'W'],
      teacher_intervention: [
        'Seat Lakshmi near the English alphabet wall chart for daily pointing.',
        'Practice 3 target letters (G, K, W) with clay or chalk drawing.',
      ],
    },
  },

  // Raju Naik (Needs Support)
  {
    id: 'asmt-401',
    studentId: 'stu-4',
    language: 'telugu',
    passageId: 'te-l0-1',
    passageText: 'అ ఆ ఇ ఈ ఉ ఊ క గ చ ట త ప మ ర ల',
    passageLevel: 0,
    assessedLevel: 0,
    durationSeconds: 38,
    createdAt: daysAgo(4),
    result: {
      transcript: 'అ ఆ ఇ క గ ప మ ర',
      accuracy_percent: 44,
      words_correct_per_minute: 12,
      fluency_score: 1,
      mistakes: [
        { expected: 'ఈ', spoken: 'ఇ', type: 'substituted' },
        { expected: 'చ', spoken: '', type: 'skipped' },
        { expected: 'ట', spoken: '', type: 'skipped' },
        { expected: 'త', spoken: '', type: 'skipped' },
      ],
      reading_level: 'Letter',
      feedback_child: 'బాగా ప్రయత్నించావు రాజు! రోజూ కొంచెం సాధన చేస్తే త్వరగా నేర్చుకుంటావు.',
      teacher_note: 'Recognizes 6–7 core Telugu letters; needs foundational phonics reinforcement.',
      practice_recommendation: ['ఈ', 'చ', 'త'],
      teacher_intervention: [
        'Give 10 minutes of 1-on-1 vowel/consonant picture card practice.',
        'Focus on 3 new letters per week using song and hand gestures.',
      ],
    },
  },
  {
    id: 'asmt-402',
    studentId: 'stu-4',
    language: 'english',
    passageId: 'en-l0-1',
    passageText: 'A B D E G H K M P R S T W',
    passageLevel: 0,
    assessedLevel: 0,
    durationSeconds: 36,
    createdAt: daysAgo(5),
    result: {
      transcript: 'A B D E M S T',
      accuracy_percent: 38,
      words_correct_per_minute: 10,
      fluency_score: 1,
      mistakes: [
        { expected: 'G', spoken: '', type: 'skipped' },
        { expected: 'H', spoken: '', type: 'skipped' },
        { expected: 'P', spoken: 'B', type: 'substituted' },
        { expected: 'R', spoken: '', type: 'skipped' },
      ],
      reading_level: 'Letter',
      feedback_child: 'Nice start Raju! You know A, B, D, and E so well!',
      teacher_note: 'Beginning English letter recognition; confuses P and B.',
      practice_recommendation: ['P', 'H', 'R'],
      teacher_intervention: [
        'Use phonics sound songs and trace uppercase letters on slate.',
        'Celebrate every 2 new letters mastered with a notebook star.',
      ],
    },
  },

  // Ananya Goud
  {
    id: 'asmt-501',
    studentId: 'stu-5',
    language: 'telugu',
    passageId: 'te-l3-2',
    passageText:
      'మా ప్రభుత్వ పాఠశాల ఆవరణలో అందమైన కూరగాయల తోట ఉంది. ప్రతి శనివారం పిల్లలందరం కలిసి మొక్కలకు నీరు పోస్తాము. మా తోటలో టమాటా, బెండకాయ, గోంగూర బాగా పండుతాయి.',
    passageLevel: 3,
    assessedLevel: 3,
    durationSeconds: 32,
    createdAt: daysAgo(1),
    result: {
      transcript:
        'మా ప్రభుత్వ పాఠశాల ఆవరణలో అందమైన కూరగాయల తోట ఉంది. ప్రతి శనివారం పిల్లలందరం కలిసి మొక్కలకు నీరు పోస్తాము. మా తోటలో టమాటా, బెండకాయ, గోంగూర బాగా పండుతాయి.',
      accuracy_percent: 87,
      words_correct_per_minute: 58,
      fluency_score: 4,
      mistakes: [
        { expected: 'ఆవరణలో', spoken: 'ఆవరనలో', type: 'mispronounced' },
      ],
      reading_level: 'Paragraph',
      feedback_child: 'అద్భుతం అనన్య! చాలా స్పష్టంగా, చక్కగా చదివావు.',
      teacher_note: 'Consistent paragraph reader; ready to advance to Level 4 Telugu stories next session.',
      practice_recommendation: ['ఆవరణలో', 'ప్రభుత్వ', 'పిల్లలందరం'],
      teacher_intervention: [
        'Assess on Level 4 Story next week to confirm level-up.',
        'Encourage expressive voice changes for story dialogues.',
      ],
    },
  },
  {
    id: 'asmt-502',
    studentId: 'stu-5',
    language: 'english',
    passageId: 'en-l3-2',
    passageText:
      'Dark clouds filled the sky above our village after school. Soon, big raindrops began to fall on the dusty road and green neem leaves.',
    passageLevel: 3,
    assessedLevel: 3,
    durationSeconds: 30,
    createdAt: daysAgo(2),
    result: {
      transcript:
        'Dark clouds filled the sky above our village after school. Soon big raindrops began to fall on the dusty road and green neem leaves.',
      accuracy_percent: 82,
      words_correct_per_minute: 50,
      fluency_score: 4,
      mistakes: [
        { expected: 'village', spoken: 'vilage', type: 'mispronounced' },
        { expected: 'dusty', spoken: 'dust', type: 'substituted' },
      ],
      reading_level: 'Paragraph',
      feedback_child: 'Great reading Ananya! Your English voice is clear and steady.',
      teacher_note: 'Solid English paragraph fluency; encourage attention to word endings (-y, -ed).',
      practice_recommendation: ['village', 'dusty', 'filled'],
      teacher_intervention: [
        'Practice word endings (-ed, -ing, -y) on the chalkboard.',
        'Have Ananya read morning weather news aloud in English.',
      ],
    },
  },
];

export function buildDefaultSmartGroups(students: Student[]): SmartGroupSuggestion[] {
  const foundations = students.filter(
    (s) => Math.min(s.teluguLevel, s.englishLevel) <= 1
  );
  const builders = students.filter(
    (s) =>
      Math.max(s.teluguLevel, s.englishLevel) === 2 &&
      Math.min(s.teluguLevel, s.englishLevel) >= 1
  );
  const fluent = students.filter(
    (s) => Math.max(s.teluguLevel, s.englishLevel) >= 3
  );

  const groups: SmartGroupSuggestion[] = [];

  if (foundations.length > 0) {
    groups.push({
      groupId: 'grp-foundations',
      groupNameTe: 'అక్షర మిత్రులు (స్థాయి 0–1)',
      groupNameEn: 'Letter & Word Foundations (L0–L1)',
      levelRange: 'L0 – L1',
      levelIndices: [0, 1],
      studentIds: foundations.map((s) => s.id),
      activityTitleTe: 'అక్షర కార్డుల ఆట & పలక సాధన',
      activityTitleEn: 'Flashcard Sound-Match & Slate Tracing',
      activityDescription:
        'Sit in a small circle with 10 Telugu/English letter-picture cards. Say a sound aloud; children race gently to tap the matching card and trace it on their slates together.',
      durationMinutes: 15,
    });
  }

  if (builders.length > 0) {
    groups.push({
      groupId: 'grp-builders',
      groupNameTe: 'వాక్య శిల్పులు (స్థాయి 2)',
      groupNameEn: 'Sentence Builders (L2)',
      levelRange: 'L2',
      levelIndices: [2],
      studentIds: builders.map((s) => s.id),
      activityTitleTe: 'జంటగా చదువు & పదాల వంతెన',
      activityTitleEn: 'Echo Reading & Word-Card Sentences',
      activityDescription:
        'Give each pair 5 word strips to build a funny village sentence, read it aloud together twice, and underline any tricky ottulu or vowel blends.',
      durationMinutes: 15,
    });
  }

  if (fluent.length > 0) {
    groups.push({
      groupId: 'grp-fluent',
      groupNameTe: 'కథా నక్షత్రాలు (స్థాయి 3–4)',
      groupNameEn: 'Story Stars & Peer Mentors (L3–L4)',
      levelRange: 'L3 – L4',
      levelIndices: [3, 4],
      studentIds: fluent.map((s) => s.id),
      activityTitleTe: 'కథల చర్చ & చిన్న పిల్లలకు తోడు',
      activityTitleEn: 'Expressive Story Circle & Reading Buddies',
      activityDescription:
        'Read a short library story aloud using expressive voices for each character, then ask each other 2 "Why" questions and mentor an L0–L1 friend for 5 minutes.',
      durationMinutes: 20,
    });
  }

  return groups;
}
