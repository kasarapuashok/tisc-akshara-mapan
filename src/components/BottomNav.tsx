import { motion } from 'motion/react';
import { BarChart3, Home, Mic, Users } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const NAV_ITEMS: Array<{
  id: NavTab;
  labelTe: string;
  labelEn: string;
  icon: typeof Home;
}> = [
  { id: 'home', labelTe: 'హోమ్', labelEn: 'Home', icon: Home },
  { id: 'students', labelTe: 'విద్యార్థులు', labelEn: 'Students', icon: Users },
  { id: 'assess', labelTe: 'అంచనా', labelEn: 'Assess', icon: Mic },
  { id: 'insights', labelTe: 'విశ్లేషణ', labelEn: 'Insights', icon: BarChart3 },
];

export function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-24px)] max-w-[440px] -translate-x-1/2"
    >
      <div className="glass-nav grid grid-cols-4 items-center gap-1 rounded-full p-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex min-h-[52px] flex-col items-center justify-center rounded-full px-1 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="primary-gradient absolute inset-0 rounded-full shadow-md shadow-[#FF6B00]/25"
                />
              )}
              <Icon
                className={`relative z-10 h-[19px] w-[19px] transition-colors ${
                  isActive ? 'text-white' : 'text-[#64748B]'
                }`}
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span
                className={`font-telugu relative z-10 mt-0.5 text-[11px] leading-tight font-bold whitespace-nowrap transition-colors ${
                  isActive ? 'text-white' : 'text-[#0F172A]'
                }`}
              >
                {item.labelTe}
              </span>
              <span
                className={`relative z-10 text-[9.5px] leading-none font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'text-white/90' : 'text-[#64748B]'
                }`}
              >
                {item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
