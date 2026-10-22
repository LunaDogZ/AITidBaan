import { ArrowCounterClockwiseIcon, ArrowRightIcon, CheckCircleIcon } from '@phosphor-icons/react';

const STEP_NAME = ['เช็กเครื่อง', 'โมเดลของคุณ', 'ติดตั้ง LM Studio', 'โหลดโมเดล', 'ลองถาม', 'ตัดเน็ต'];
const CIRCLED = '①②③④⑤⑥';

interface Props {
  step: number;
  done: boolean;
  modelName?: string;
  onContinue: () => void;
  onRestart: () => void;
}

// ผู้ใช้กลับมาที่วิซาร์ดหลังออกไปติดตั้งหรือโหลดโมเดล (PRD ข้อ 4)
export function Resume({ step, done, modelName, onContinue, onRestart }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      {done ? (
        <>
          <CheckCircleIcon size={40} weight="fill" className="text-good" aria-hidden="true" />
          <h1 className="mt-3 text-3xl leading-snug font-bold">คุณติดตั้งเสร็จแล้ว</h1>
          <p className="mt-2 text-lg text-muted">
            เครื่องนี้มี {modelName ?? 'โมเดล'} อยู่ใน LM Studio แล้ว เปิดแอป เลือกโมเดล แล้วถามได้เลย
          </p>
        </>
      ) : (
        <>
          <p className="text-muted">ยินดีต้อนรับกลับมา</p>
          <h1 className="mt-1 text-3xl leading-snug font-bold">
            คุณทำถึงขั้น {CIRCLED[step - 1]} {STEP_NAME[step - 1]}
          </h1>
          {modelName && <p className="mt-2 text-lg text-muted">โมเดลที่แนะนำให้คุณคือ {modelName}</p>}
        </>
      )}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold whitespace-nowrap text-accent-ink transition hover:brightness-110 active:scale-[0.98]"
        >
          {done ? 'ดูวิธีถามอีกครั้ง' : 'ทำต่อ'} <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-ink"
        >
          <ArrowCounterClockwiseIcon size={18} aria-hidden="true" /> เริ่มใหม่
        </button>
      </div>
      <p className="mt-6 text-sm text-muted">เว็บจำความคืบหน้าไว้ในเบราว์เซอร์นี้เท่านั้น ไม่ได้ส่งไปที่ไหน</p>
    </section>
  );
}
