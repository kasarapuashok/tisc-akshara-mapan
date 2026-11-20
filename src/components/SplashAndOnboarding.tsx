import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Building2, UserCheck } from 'lucide-react';
import { TeacherProfile } from '../types';
import { AksharaLogo } from './AksharaLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={onFinish}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card flex flex-col items-center rounded-[32px] px-8 py-10 sm:px-12 sm:py-12"
      >
        <AksharaLogo size={104} animateMode="splash" />

        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="font-telugu mt-6 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl"
        >
          అక్షర మాపన్
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-1 bg-gradient-to-r from-[#FF6B00] via-[#7C3AED] to-[#EC4899] bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl"
        >
          Akshara Mapan
        </motion.p>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 space-y-1"
        >
          <p className="font-telugu text-sm font-semibold text-[#0F172A]">
            ప్రతి బిడ్డకు AI చదువు అంచనా
          </p>
          <p className="text-xs font-medium text-[#64748B]">
            AI Reading Assessment for Every Child
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface TeacherOnboardingProps {
  initialProfile?: TeacherProfile | null;
  onSave: (profile: TeacherProfile) => void;
  onCancel?: () => void;
}

export function TeacherOnboarding({
  initialProfile,
  onSave,
  onCancel,
}: TeacherOnboardingProps) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [school, setSchool] = useState(initialProfile?.school || '');
  const [district, setDistrict] = useState(initialProfile?.district || 'Warangal');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !school.trim()) {
      setError('దయచేసి మీ పేరు మరియు పాఠశాల పేరు నమోదు చేయండి / Please enter your name and school.');
      return;
    }
    onSave({
      name: name.trim(),
      school: school.trim(),
      district: district.trim() || 'Telangana',
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
    });
  };

  const handleQuickDemo = () => {
    onSave({
      name: 'Padma Kumari',
      school: 'MPPS Hanamkonda Primary School',
      district: 'Hanamkonda, Telangana',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex min-h-[calc(100vh-48px)] max-w-lg flex-col justify-center px-4 py-8"
    >
      <div className="glass-card rounded-[28px] p-6 sm:p-8">
        <div className="flex items-center gap-3.5">
          <AksharaLogo size={54} animateMode="idle" />
          <div>
            <h1 className="font-telugu text-xl font-extrabold text-[#0F172A]">
              అక్షర మాపన్ స్వాగతం
            </h1>
            <p className="text-xs font-semibold text-[#64748B]">
              Welcome to Akshara Mapan · Telangana Schools
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-[#64748B]">
          <span className="font-telugu block font-semibold text-[#0F172A]">
            ఒక్కసారి మీ పేరు & పాఠశాల వివరాలు నమోదు చేయండి (పాస్‌వర్డ్ అవసరం లేదు).
          </span>
          Enter your name and school once to save assessments locally on this device.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="teacher-name"
              className="mb-1.5 block text-sm font-semibold text-[#0F172A]"
            >
              <span className="font-telugu">ఉపాధ్యాయుని పేరు</span>{' '}
              <span className="text-xs font-medium text-[#64748B]">/ Teacher Name</span>
            </label>
            <div className="relative">
              <UserCheck className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <input
                id="teacher-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Padma Kumari"
                className="min-h-[48px] w-full rounded-[16px] border border-slate-200/80 bg-white/85 py-3 pr-4 pl-10 text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="school-name"
              className="mb-1.5 block text-sm font-semibold text-[#0F172A]"
            >
              <span className="font-telugu">పాఠశాల పేరు</span>{' '}
              <span className="text-xs font-medium text-[#64748B]">/ School Name</span>
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <input
                id="school-name"
                type="text"
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  setError('');
                }}
                placeholder="e.g. MPPS Nalgonda Primary School"
                className="min-h-[48px] w-full rounded-[16px] border border-slate-200/80 bg-white/85 py-3 pr-4 pl-10 text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="district-name"
              className="mb-1.5 block text-sm font-semibold text-[#0F172A]"
            >
              <span className="font-telugu">జిల్లా</span>{' '}
              <span className="text-xs font-medium text-[#64748B]">/ District (Optional)</span>
            </label>
            <input
              id="district-name"
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Warangal, Karimnagar, Nizamabad"
              className="min-h-[46px] w-full rounded-[16px] border border-slate-200/80 bg-white/85 px-4 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-[14px] bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="primary-gradient primary-glow flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[18px] px-6 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-95"
          >
            <span className="font-telugu">ప్రారంభించండి</span>
            <span className="text-sm font-semibold text-white/90">/ Save & Continue</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {!initialProfile && (
            <button
              type="button"
              onClick={handleQuickDemo}
              className="min-h-[44px] flex-1 rounded-[14px] border border-slate-200/80 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#64748B] transition-colors hover:bg-white hover:text-[#0F172A]"
            >
              <span className="font-telugu">డెమో ప్రొఫైల్‌తో చూడండి</span> · Try Demo Teacher
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] flex-1 rounded-[14px] border border-slate-200/80 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#64748B] transition-colors hover:bg-white hover:text-[#0F172A]"
            >
              <span className="font-telugu">రద్దు చేయి</span> · Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
