import { ArrowCounterClockwiseIcon, ArrowRightIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useLang } from './lang';

const CIRCLED = '①②③④⑤⑥';
const T = {
  th: {
    stepNames: ['เช็กเครื่อง', 'โมเดลของคุณ', 'ติดตั้ง LM Studio', 'โหลดโมเดล', 'ลองถาม', 'ตัดเน็ต'],
    doneTitle: 'คุณติดตั้งเสร็จแล้ว',
    doneBody: (model: string) => `เครื่องนี้มี ${model} อยู่ใน LM Studio แล้ว เปิดแอป เลือกโมเดล แล้วถามได้เลย`,
    aModel: 'โมเดล',
    welcome: 'ยินดีต้อนรับกลับมา',
    reached: (n: string, name: string) => `คุณทำถึงขั้น ${n} ${name}`,
    recommended: (model: string) => `โมเดลที่แนะนำให้คุณคือ ${model}`,
    again: 'ดูวิธีถามอีกครั้ง',
    continue: 'ทำต่อ',
    restart: 'เริ่มใหม่',
    privacy: 'เว็บจำความคืบหน้าไว้ในเบราว์เซอร์นี้เท่านั้น ไม่ได้ส่งไปที่ไหน',
  },
  en: {
    stepNames: ['Check computer', 'Your model', 'Install LM Studio', 'Download model', 'Try it', 'Go offline'],
    doneTitle: "You're all set up",
    doneBody: (model: string) => `${model} is already in LM Studio on this computer. Open the app, pick the model, and ask away.`,
    aModel: 'Your model',
    welcome: 'Welcome back',
    reached: (n: string, name: string) => `You got to step ${n}: ${name}`,
    recommended: (model: string) => `Your recommended model is ${model}`,
    again: 'See how to ask again',
    continue: 'Continue',
    restart: 'Start over',
    privacy: 'Your progress is saved only in this browser and is never sent anywhere.',
  },
};

interface Props {
  step: number;
  done: boolean;
  modelName?: string;
  onContinue: () => void;
  onRestart: () => void;
}

// ผู้ใช้กลับมาที่วิซาร์ดหลังออกไปติดตั้งหรือโหลดโมเดล (PRD ข้อ 4)
export function Resume({ step, done, modelName, onContinue, onRestart }: Props) {
  const t = T[useLang()];
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      {done ? (
        <>
          <CheckCircleIcon size={40} weight="fill" className="text-good" aria-hidden="true" />
          <h1 className="mt-3 text-3xl leading-snug font-bold">{t.doneTitle}</h1>
          <p className="mt-2 text-lg text-muted">{t.doneBody(modelName ?? t.aModel)}</p>
        </>
      ) : (
        <>
          <p className="text-muted">{t.welcome}</p>
          <h1 className="mt-1 text-3xl leading-snug font-bold">{t.reached(CIRCLED[step - 1], t.stepNames[step - 1])}</h1>
          {modelName && <p className="mt-2 text-lg text-muted">{t.recommended(modelName)}</p>}
        </>
      )}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold whitespace-nowrap text-accent-ink transition hover:brightness-110 active:scale-[0.98]"
        >
          {done ? t.again : t.continue} <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-ink"
        >
          <ArrowCounterClockwiseIcon size={18} aria-hidden="true" /> {t.restart}
        </button>
      </div>
      <p className="mt-6 text-sm text-muted">{t.privacy}</p>
    </section>
  );
}
