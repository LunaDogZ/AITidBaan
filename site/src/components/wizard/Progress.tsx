import { CheckIcon } from '@phosphor-icons/react';
import { useLang } from './lang';

const T = {
  th: {
    steps: ['เช็กเครื่อง', 'โมเดลของคุณ', 'ติดตั้งแอป', 'โหลดโมเดล', 'ลองถาม', 'ตัดเน็ต'],
    nav: 'ความคืบหน้า',
    of: (n: number, total: number) => `ขั้นที่ ${n} จาก ${total}`,
  },
  en: {
    steps: ['Check', 'Your model', 'Install', 'Download', 'Try it', 'Offline'],
    nav: 'Progress',
    of: (n: number, total: number) => `Step ${n} of ${total}`,
  },
};

export function Progress({ current }: { current: number }) {
  const t = T[useLang()];
  const STEPS = t.steps;
  return (
    <nav aria-label={t.nav}>
      <p className="text-sm text-muted">{t.of(current, STEPS.length)}</p>
      <ol className="mt-3 grid grid-cols-6 gap-1.5">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const now = n === current;
          return (
            <li key={label} aria-current={now ? 'step' : undefined}>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full bg-accent transition-transform duration-700 ease-[var(--ease-out)] origin-left ${done || now ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </div>
              <span
                className={`mt-2 hidden items-center gap-1 md:flex ${now ? 'font-semibold text-ink' : 'text-muted'}`}
              >
                {done && <CheckIcon size={12} weight="bold" aria-hidden="true" />}
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
