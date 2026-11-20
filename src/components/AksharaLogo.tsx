import { motion } from 'motion/react';

interface AksharaLogoProps {
  size?: number;
  animateMode?: 'idle' | 'splash' | 'loading';
  showSoundWave?: boolean;
  className?: string;
}

export function AksharaLogo({
  size = 56,
  animateMode = 'idle',
  showSoundWave = true,
  className = '',
}: AksharaLogoProps) {
  const uniqueId = `akshara-grad-${size}-${animateMode}`;
  const width = showSoundWave ? Math.round(size * 1.28) : size;

  const needleAnimate =
    animateMode === 'splash'
      ? { rotate: [-120, 48, -15, 32] }
      : animateMode === 'loading'
        ? { rotate: [-110, 85, -110] }
        : { rotate: 28 };

  const needleTransition =
    animateMode === 'splash'
      ? { duration: 1.5, ease: [0.16, 1, 0.3, 1] as const }
      : animateMode === 'loading'
        ? { duration: 1.7, repeat: Infinity, ease: 'easeInOut' as const }
        : { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <svg
      width={width}
      height={size}
      viewBox={showSoundWave ? '0 0 128 100' : '0 0 100 100'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Akshara Mapan Logo"
    >
      <defs>
        <linearGradient id={uniqueId} x1="10" y1="86" x2="90" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="48%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={`${uniqueId}-wave`} x1="102" y1="26" x2="124" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>

      {/* Soft translucent dial backing */}
      <circle cx="50" cy="50" r="41" fill="white" fillOpacity="0.82" />

      {/* Background gauge track (270-degree arc) */}
      <path
        d="M 21 79 A 41 41 0 1 1 79 79"
        stroke="#E2E8F0"
        strokeWidth="7.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Gradient active gauge ring */}
      <motion.path
        d="M 21 79 A 41 41 0 1 1 79 79"
        stroke={`url(#${uniqueId})`}
        strokeWidth="7.5"
        strokeLinecap="round"
        fill="none"
        initial={animateMode === 'splash' ? { pathLength: 0.15 } : { pathLength: 0.88 }}
        animate={
          animateMode === 'loading'
            ? { pathLength: [0.25, 0.92, 0.25] }
            : { pathLength: 0.88 }
        }
        transition={
          animateMode === 'loading'
            ? { duration: 1.7, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
        }
      />

      {/* Subtle gauge scale ticks */}
      <line x1="17" y1="50" x2="21.5" y2="50" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="17" x2="50" y2="21.5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="83" y1="50" x2="78.5" y2="50" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

      {/* Sweeping gauge needle (pivoted around center 50,50, resting on outer rim) */}
      <motion.g
        style={{ originX: '50px', originY: '50px' }}
        initial={{ rotate: animateMode === 'idle' ? 28 : -120 }}
        animate={needleAnimate}
        transition={needleTransition}
      >
        <path
          d="M 50 13 L 53.5 24 L 46.5 24 Z"
          fill="#FF6B00"
        />
        <circle cx="50" cy="14" r="3.2" fill="#7C3AED" />
      </motion.g>

      {/* Telugu Letter "అ" cleanly centered */}
      <text
        x="50"
        y="63"
        textAnchor="middle"
        fill="#0F172A"
        fontSize="40"
        fontWeight="800"
        fontFamily="'Noto Sans Telugu', sans-serif"
      >
        అ
      </text>

      {/* Small modern sound-wave beside the ring */}
      {showSoundWave && (
        <g>
          <motion.rect
            x="100"
            y="38"
            width="5.5"
            height="24"
            rx="2.75"
            fill={`url(#${uniqueId}-wave)`}
            animate={
              animateMode === 'loading'
                ? { scaleY: [0.65, 1.25, 0.65] }
                : animateMode === 'splash'
                  ? { scaleY: [0.4, 1.15, 1] }
                  : { scaleY: 1 }
            }
            style={{ originY: '50px' }}
            transition={
              animateMode === 'loading'
                ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.7, delay: 0.2 }
            }
          />
          <motion.rect
            x="110"
            y="28"
            width="5.5"
            height="44"
            rx="2.75"
            fill={`url(#${uniqueId})`}
            animate={
              animateMode === 'loading'
                ? { scaleY: [1.1, 0.5, 1.1] }
                : animateMode === 'splash'
                  ? { scaleY: [0.3, 1.1, 1] }
                  : { scaleY: 1 }
            }
            style={{ originY: '50px' }}
            transition={
              animateMode === 'loading'
                ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }
                : { duration: 0.7, delay: 0.35 }
            }
          />
          <motion.rect
            x="120"
            y="41"
            width="5.5"
            height="18"
            rx="2.75"
            fill="#06B6D4"
            animate={
              animateMode === 'loading'
                ? { scaleY: [0.7, 1.35, 0.7] }
                : animateMode === 'splash'
                  ? { scaleY: [0.35, 1.15, 1] }
                  : { scaleY: 1 }
            }
            style={{ originY: '50px' }}
            transition={
              animateMode === 'loading'
                ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
                : { duration: 0.7, delay: 0.5 }
            }
          />
        </g>
      )}
    </svg>
  );
}
