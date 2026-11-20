import { useEffect, useState } from 'react';
import { animate } from 'motion/react';

interface CountUpNumberProps {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function CountUpNumber({
  value,
  suffix = '',
  decimals = 0,
  duration = 0.85,
  className = '',
}: CountUpNumberProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplay(latest);
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();

  return (
    <span className={`tabular-nums ${className}`}>
      {formatted}
      {suffix}
    </span>
  );
}
