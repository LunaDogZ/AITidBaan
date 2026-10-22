import { CheckIcon } from '@phosphor-icons/react';

const STEPS = ['เช็กเครื่อง', 'โมเดลของคุณ', 'ติดตั้ง LM Studio', 'โหลดโมเดล', 'ลองถาม', 'ตัดเน็ต'];

export function Progress({ current }: { current: number }) {
  return (
    <nav aria-label="ความคืบหน้า">
      <p className="text-sm text-muted">
        ขั้นที่ {current} จาก {STEPS.length}
      </p>
      <ol className="mt-3 grid grid-cols-6 gap-1.5">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const now = n === current;
          return (
            <li key={label} aria-current={now ? 'step' : undefined}>
              <div className={`h-1.5 rounded-full ${done || now ? 'bg-accent' : 'bg-line'}`} />
              <span
                className={`mt-2 hidden items-center gap-1 text-xs md:flex ${now ? 'font-semibold text-ink' : 'text-muted'}`}
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
