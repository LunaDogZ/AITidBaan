import type { ReactNode } from 'react';
import { CaretDownIcon, CheckCircleIcon, ImageIcon } from '@phosphor-icons/react';

interface ChoiceProps {
  type: 'radio' | 'checkbox';
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}

export function Choice({ type, name, checked, onChange, label, hint }: ChoiceProps) {
  return (
    <label className="group relative flex cursor-pointer flex-col justify-center rounded-xl border-2 border-line bg-surface px-4 py-3.5 transition duration-300 ease-[var(--ease-out)] has-checked:border-accent has-checked:bg-accent-soft hover:-translate-y-0.5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent hover:border-accent active:scale-[0.99]">
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      <CheckCircleIcon
        weight="fill"
        size={22}
        aria-hidden="true"
        className="absolute top-3 right-3 scale-50 text-accent opacity-0 transition duration-300 ease-[var(--ease-out)] group-has-checked:scale-100 group-has-checked:opacity-100"
      />
      <span className="pr-6 text-lg font-semibold">{label}</span>
      {hint && <span className="text-sm text-muted">{hint}</span>}
    </label>
  );
}

export function ScreenshotSlot({ caption }: { caption: string }) {
  // TODO: ใส่ภาพแคปจริงจาก Windows 10 และ 11 (PRD ข้อ 9)
  return (
    <div className="flex aspect-[16/4] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-sunk px-4 text-center text-sm text-muted">
      <ImageIcon size={28} aria-hidden="true" />
      <span>ภาพแคปหน้าจอ: {caption}</span>
    </div>
  );
}

export function Trouble({ items }: { items: { symptom: string; fix: ReactNode }[] }) {
  return (
    <details className="group mt-6 rounded-xl border border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold">
        ติดปัญหา?
        <CaretDownIcon size={18} className="transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <dl className="space-y-4 border-t border-line px-4 py-4">
        {items.map((it) => (
          <div key={it.symptom}>
            <dt className="font-medium">{it.symptom}</dt>
            <dd className="text-muted">{it.fix}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
