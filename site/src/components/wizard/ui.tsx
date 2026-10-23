import { useState, type ReactNode } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretDownIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  ExclamationMarkIcon,
  LifebuoyIcon,
} from '@phosphor-icons/react';
import { useLang } from './lang';

const T = {
  th: {
    next: 'ทำเสร็จแล้ว ไปต่อ',
    back: 'ย้อนกลับ',
    copied: 'คัดลอกแล้ว',
    trouble: 'ติดปัญหา?',
    troubleCount: (n: number) => `${n} เรื่องที่เจอบ่อย`,
  },
  en: {
    next: 'Done, next',
    back: 'Back',
    copied: 'Copied',
    trouble: 'Stuck?',
    troubleCount: (n: number) => `${n} common issues`,
  },
};

interface StepShellProps {
  title: string;
  lead: ReactNode;
  children: ReactNode;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

// ขั้น ③-⑥ เป็นหน้าคู่มือที่อ่านยาว วางบนพื้นหน้าโดยไม่มีกรอบการ์ด (ไม่ให้เป็นกล่องซ้อนกล่อง)
// แถบปุ่มติดขอบล่างของจอเหมือนขั้นเช็กเครื่อง
export function StepShell({ title, lead, children, onBack, onNext, nextLabel }: StepShellProps) {
  const t = T[useLang()];
  return (
    <div className="flex flex-col">
      <h1 className="text-[2.1rem] leading-tight font-bold tracking-tight text-balance sm:text-4xl">{title}</h1>
      <div className="mt-3 max-w-[56ch] text-lg text-muted">{lead}</div>
      <div className="flex-1">{children}</div>
      <div className="sticky bottom-0 -mx-4 mt-10 flex items-center justify-between gap-4 border-t border-line bg-bg/90 px-4 py-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-ink"
        >
          <ArrowLeftIcon size={18} aria-hidden="true" /> <span className="max-sm:sr-only">{t.back}</span>
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold whitespace-nowrap text-accent-ink transition hover:brightness-110 active:scale-[0.98]"
          >
            {nextLabel ?? t.next} <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

// ขั้นตอนย่อยที่มีเลขกำกับ ของในรายการขยับเข้าจอทีละชิ้น
export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-8">
      {items.map((it, i) => (
        <li
          key={i}
          className="fade-in group relative flex gap-5 pb-8 last:pb-0"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
        >
          {/* เส้นต่อวงกลมเลข ให้อ่านเป็นลำดับเดียวกัน */}
          <span className="absolute top-11 bottom-2 left-[1.0625rem] w-0.5 rounded-full bg-line group-last:hidden" aria-hidden="true" />
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-ink tabular-nums">
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
    // วงกลมขนาดเดียวกับเลขใน Steps อ่านเป็นภาษาภาพเดียวกัน ไม่ทำเป็นกล่องพื้นสี
    <div className="mt-8 flex gap-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-minor text-white">
        <ExclamationMarkIcon size={20} weight="bold" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pt-1">{children}</div>
    </div>
  );
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const t = T[useLang()];
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
      <span aria-live="polite">{copied ? t.copied : label}</span>
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

export function Screenshot({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className="h-auto max-h-96 w-auto max-w-full rounded-xl border border-line"
    />
  );
}

// ขั้นตอนพร้อมภาพแคปทีละขั้น (ข้อความแต่ละขั้นใช้เป็น alt ของภาพด้วย)
export function ShotSteps({ shots }: { shots: { src: string; width: number; height: number; text: string }[] }) {
  return (
    <ol className="mt-4 space-y-5">
      {shots.map(({ text, ...shot }, i) => (
        <li key={shot.src}>
          <p className="text-lg text-muted">
            <span className="font-semibold text-ink">{i + 1}.</span> {text}
          </p>
          <div className="mt-2">
            <Screenshot {...shot} alt={text} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Trouble({ items }: { items: { symptom: string; fix: ReactNode }[] }) {
  const t = T[useLang()];
  return (
    <details className="group mt-8 rounded-2xl bg-sunk">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-4 transition-colors hover:bg-line/50">
        <LifebuoyIcon size={24} className="shrink-0 text-accent" aria-hidden="true" />
        <span className="font-semibold">{t.trouble}</span>
        <span className="text-muted">{t.troubleCount(items.length)}</span>
        <CaretDownIcon
          size={18}
          className="ml-auto transition-transform duration-500 ease-[var(--ease-out)] group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <dl className="fade-in divide-y divide-line px-5 pb-2">
        {items.map((it) => (
          <div key={it.symptom} className="py-4">
            <dt className="font-semibold">{it.symptom}</dt>
            <dd className="mt-1 max-w-[60ch] text-muted">{it.fix}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
