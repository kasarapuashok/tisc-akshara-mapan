import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function normalizeAudioMimeType(rawMime: string | undefined): string {
  if (!rawMime) return 'audio/webm';
  const base = rawMime.split(';')[0].trim().toLowerCase();
  const allowed = new Set([
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    'audio/x-m4a',
  ]);
  return allowed.has(base) ? base : 'audio/webm';
}

const LEVEL_NAMES = ['Letter', 'Word', 'Sentence', 'Paragraph', 'Story'] as const;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Voice-based AI Reading Assessment endpoint
  app.post('/api/assess', async (req, res) => {
    try {
      const ai = createGeminiClient();
      if (!ai) {
        res.status(500).json({
          error: 'API_KEY_MISSING',
          messageEn: 'Gemini API key is not configured on the server.',
          messageTe: 'సర్వర్‌లో Gemini API కీ సెట్ చేయబడలేదు.',
        });
        return;
      }

      const {
        audioBase64,
        mimeType,
        passageText,
        language,
        studentClass,
        passageLevel,
        durationSeconds,
        studentName,
      } = req.body as {
        audioBase64?: string;
        mimeType?: string;
        passageText?: string;
        language?: 'telugu' | 'english';
        studentClass?: number;
        passageLevel?: number;
        durationSeconds?: number;
        studentName?: string;
      };

      if (!audioBase64 || !passageText || !language) {
        res.status(400).json({
          error: 'INVALID_REQUEST',
          messageEn: 'Missing audio recording, passage text, or language.',
          messageTe: 'ఆడియో రికార్డింగ్ లేదా పాఠం వివరాలు లోపించాయి.',
        });
        return;
      }

      const cleanMime = normalizeAudioMimeType(mimeType);
      const safeDuration = Math.max(1, Number(durationSeconds) || 10);
      const levelIdx = Math.min(4, Math.max(0, Number(passageLevel) || 0));
      const levelLabel = LEVEL_NAMES[levelIdx];
      const langDisplay = language === 'telugu' ? 'Telugu (తెలుగు)' : 'English';

      const systemInstruction = `You are a warm, experienced, encouraging primary-school reading specialist supporting teachers in Telangana government schools (Classes 1 to 5) using ASER-style reading assessment.
Carefully listen to the child's audio recording and transcribe exactly what the child read aloud in ${langDisplay}.
Compare the child's spoken reading word-by-word (or letter-by-letter for Level 0) against the target passage.
Be fair and child-friendly: accept natural regional Telangana pronunciation accents as correct when the right word/letter is clearly intended; only flag genuine skips, substitutions, or clear mispronunciations.
If the audio is mostly silent, unintelligible, or has no reading attempt, set accuracy_percent to 0, words_correct_per_minute to 0, fluency_score to 1, and gently encourage the child to try again loudly near the microphone.
Always compute words_correct_per_minute realistically based on the number of correctly read words/letters divided by (${safeDuration} / 60).
Choose reading_level from strictly one of: "Letter", "Word", "Sentence", "Paragraph", "Story", reflecting the level demonstrated (typically the passage level "${levelLabel}" if accuracy >= 60%, or one level lower if struggling, or higher if effortless).
Write feedback_child as a short, joyful, encouraging 1-sentence message in ${language === 'telugu' ? 'warm simple Telugu' : 'warm simple English'} addressed kindly to the child.
Write teacher_note in 1-2 crisp, practical sentences in English.
Provide exactly 3 specific items in practice_recommendation (actual letters, words, or short phrases from the passage or matching level in ${langDisplay}).
Provide 2-3 specific, low-resource Telangana classroom actions in teacher_intervention (in English, clear and actionable).`;

      const userPrompt = `Child Name: ${studentName || 'Student'}
Class: Class ${studentClass || 3}
Language: ${langDisplay}
Target Passage Level: Level ${levelIdx} (${levelLabel})
Recording Duration: ${safeDuration} seconds
Target Passage Text:
"""
${passageText}
"""

Listen to the attached audio and return the strict JSON reading assessment.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: cleanMime,
                data: audioBase64,
              },
            },
            { text: userPrompt },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: {
                type: Type.STRING,
                description: 'Exact transcription of what the child read aloud in the test language.',
              },
              accuracy_percent: {
                type: Type.NUMBER,
                description: 'Reading accuracy percentage from 0 to 100.',
              },
              words_correct_per_minute: {
                type: Type.NUMBER,
                description: 'Correct words or letters read per minute (integer >= 0).',
              },
              fluency_score: {
                type: Type.INTEGER,
                description: 'Fluency rating from 1 (halting) to 5 (smooth and expressive).',
              },
              mistakes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    expected: { type: Type.STRING },
                    spoken: { type: Type.STRING },
                    type: {
                      type: Type.STRING,
                      enum: ['skipped', 'substituted', 'mispronounced'],
                    },
                  },
                  required: ['expected', 'spoken', 'type'],
                },
                description: 'List of word or letter reading mistakes.',
              },
              reading_level: {
                type: Type.STRING,
                enum: ['Letter', 'Word', 'Sentence', 'Paragraph', 'Story'],
                description: 'Assessed ASER reading level.',
              },
              feedback_child: {
                type: Type.STRING,
                description: 'Short encouraging line for the child in the test language.',
              },
              teacher_note: {
                type: Type.STRING,
                description: '1-2 concise lines of diagnostic insight in English for the teacher.',
              },
              practice_recommendation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 3 specific letters, words, or short sentences to practise.',
              },
              teacher_intervention: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 concrete classroom actions for the teacher.',
              },
            },
            required: [
              'transcript',
              'accuracy_percent',
              'words_correct_per_minute',
              'fluency_score',
              'mistakes',
              'reading_level',
              'feedback_child',
              'teacher_note',
              'practice_recommendation',
              'teacher_intervention',
            ],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('Empty response from Gemini model.');
      }

      const parsed = JSON.parse(rawText);

      // Sanitize bounds cleanly
      const sanitized = {
        transcript: typeof parsed.transcript === 'string' ? parsed.transcript : '',
        accuracy_percent: Math.min(100, Math.max(0, Math.round(Number(parsed.accuracy_percent) || 0))),
        words_correct_per_minute: Math.max(0, Math.round(Number(parsed.words_correct_per_minute) || 0)),
        fluency_score: Math.min(5, Math.max(1, Math.round(Number(parsed.fluency_score) || 1))),
        mistakes: Array.isArray(parsed.mistakes)
          ? parsed.mistakes.slice(0, 25).map((m: Record<string, unknown>) => ({
              expected: String(m.expected ?? ''),
              spoken: String(m.spoken ?? ''),
              type:
                m.type === 'skipped' || m.type === 'substituted' || m.type === 'mispronounced'
                  ? m.type
                  : 'mispronounced',
            }))
          : [],
        reading_level: LEVEL_NAMES.includes(parsed.reading_level)
          ? parsed.reading_level
          : levelLabel,
        feedback_child:
          typeof parsed.feedback_child === 'string' && parsed.feedback_child.trim()
            ? parsed.feedback_child.trim()
            : language === 'telugu'
              ? 'చాలా మంచి ప్రయత్నం! నువ్వు ఇంకా బాగా చదవగలవు!'
              : 'Great effort! Keep reading aloud with a big smile!',
        teacher_note:
          typeof parsed.teacher_note === 'string' && parsed.teacher_note.trim()
            ? parsed.teacher_note.trim()
            : 'Continue regular guided reading practice matched to this level.',
        practice_recommendation: Array.isArray(parsed.practice_recommendation)
          ? parsed.practice_recommendation.map(String).filter(Boolean).slice(0, 4)
          : [],
        teacher_intervention: Array.isArray(parsed.teacher_intervention)
          ? parsed.teacher_intervention.map(String).filter(Boolean).slice(0, 4)
          : [],
      };

      res.json({ result: sanitized });
    } catch (error) {
      console.error('Error in /api/assess:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown assessment error';
      res.status(502).json({
        error: 'ASSESSMENT_FAILED',
        messageEn: 'Could not score the audio right now. Please check your connection and try again.',
        messageTe: 'ఇప్పుడు ఆడియోను అంచనా వేయలేకపోయాము. దయచేసి మళ్ళీ ప్రయత్నించండి.',
        details: errMsg,
      });
    }
  });

  // AI Smart Classroom Groups endpoint
  app.post('/api/smart-groups', async (req, res) => {
    try {
      const ai = createGeminiClient();
      if (!ai) {
        res.status(500).json({
          error: 'API_KEY_MISSING',
          messageEn: 'Gemini API key is not configured on the server.',
          messageTe: 'సర్వర్‌లో Gemini API కీ సెట్ చేయబడలేదు.',
        });
        return;
      }

      const { students, language } = req.body as {
        students?: Array<{
          id: string;
          name: string;
          classGrade: number;
          teluguLevel: number;
          englishLevel: number;
        }>;
        language?: 'telugu' | 'english';
      };

      if (!Array.isArray(students) || students.length === 0) {
        res.status(400).json({
          error: 'NO_STUDENTS',
          messageEn: 'Add at least one student to generate smart groups.',
          messageTe: 'గ్రూపుల కోసం కనీసం ఒక విద్యార్థిని చేర్చండి.',
        });
        return;
      }

      const focusLang = language === 'english' ? 'English' : 'Telugu';
      const studentSummary = students
        .map(
          (s) =>
            `- id:${s.id} | ${s.name} (Class ${s.classGrade}) | Telugu: L${s.teluguLevel} | English: L${s.englishLevel}`
        )
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Group these Telangana primary school students into 2 to 3 balanced reading-level groups focused on ${focusLang} reading (using every student id exactly once) and recommend ONE joyful, zero-cost classroom activity per group using slate, chalk, flashcards, or storybooks.\n\nStudents:\n${studentSummary}`,
        config: {
          systemInstruction:
            'You are an expert primary pedagogy mentor for Telangana government schools (FLN / NIPUN Bharat). Return concise, practical, encouraging bilingual group titles (Telugu + English) and one concrete classroom activity per group.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              groups: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    groupId: { type: Type.STRING },
                    groupNameTe: { type: Type.STRING },
                    groupNameEn: { type: Type.STRING },
                    levelRange: { type: Type.STRING },
                    levelIndices: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER },
                    },
                    studentIds: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    activityTitleTe: { type: Type.STRING },
                    activityTitleEn: { type: Type.STRING },
                    activityDescription: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                  },
                  required: [
                    'groupId',
                    'groupNameTe',
                    'groupNameEn',
                    'levelRange',
                    'levelIndices',
                    'studentIds',
                    'activityTitleTe',
                    'activityTitleEn',
                    'activityDescription',
                    'durationMinutes',
                  ],
                },
              },
            },
            required: ['groups'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      const parsed = JSON.parse(rawText);
      res.json({ groups: Array.isArray(parsed.groups) ? parsed.groups : [] });
    } catch (error) {
      console.error('Error in /api/smart-groups:', error);
      res.status(502).json({
        error: 'SMART_GROUPS_FAILED',
        messageEn: 'Could not refresh AI classroom groups right now. Please retry.',
        messageTe: 'స్మార్ట్ గ్రూపులను రూపొందించలేకపోయాము. మళ్ళీ ప్రయత్నించండి.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Akshara Mapan server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
