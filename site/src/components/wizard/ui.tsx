import { useState, type ReactNode } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretDownIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  ImageIcon,
  WarningIcon,
} from '@phosphor-icons/react';

interface StepShellProps {
  title: string;
  lead: ReactNode;
  children: ReactNode;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

// กรอบของขั้น ③-⑥ ใช้แถบปุ่มติดขอบล่างแบบเดียวกับขั้นเช็กเครื่อง
export function StepShell({ title, lead, children, onBack, onNext, nextLabel = 'ทำเสร็จแล้ว ไปต่อ' }: StepShellProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h1 className="text-3xl leading-snug font-bold">{title}</h1>
      <div className="mt-2 text-lg text-muted">{lead}</div>
      <div className="flex-1">{children}</div>
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 flex items-center justify-between gap-4 rounded-b-2xl border-t border-line bg-surface/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:-mb-8 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-ink"
        >
          <ArrowLeftIcon size={18} aria-hidden="true" /> <span className="max-sm:sr-only">ย้อนกลับ</span>
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold whitespace-nowrap text-accent-ink transition hover:brightness-110 active:scale-[0.98]"
          >
            {nextLabel} <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

// ขั้นตอนย่อยที่มีเลขกำกับ ของในรายการขยับเข้าจอทีละชิ้น
export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-6 space-y-4">
      {items.map((it, i) => (
        <li
          key={i}
          className="fade-in flex gap-4"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-1">{it}</div>
        </li>
      ))}
    </ol>
  );
}

// คำเตือนสำคัญที่ต้องอยู่ในเนื้อหาหลัก ไม่พับไว้ใน "ติดปัญหา?"
export function Warn({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex gap-3 rounded-xl border border-minor/40 bg-minor-soft p-4">
      <WarningIcon size={22} weight="fill" className="mt-0.5 shrink-0 text-minor" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition duration-300 ease-[var(--ease-out)] active:scale-[0.98] ${copied ? 'bg-good text-white' : 'bg-accent text-accent-ink hover:brightness-110'}`}
    >
      {copied ? <CheckIcon size={18} weight="bold" aria-hidden="true" /> : <CopyIcon size={18} aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'คัดลอกแล้ว' : label}</span>
    </button>
  );
}

export function Key({ children }: { children: ReactNode }) {
  return <kbd className="rounded-md border border-line bg-sunk px-1.5 py-0.5 font-sans text-[0.9em]">{children}</kbd>;
}

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
