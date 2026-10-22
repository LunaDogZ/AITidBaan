import { useRef } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, InfoIcon } from '@phosphor-icons/react';
import type { Gpu, Ram, Task, Vram } from '../../lib/recommend';
import { TASKS } from '../../data/models';
import { toMachine, type Answers } from './answers';
import { Choice, ScreenshotSlot, Trouble } from './ui';
import { useLang } from './lang';

const T = {
  th: {
    orMore: 'ขึ้นไป',
    unsure: 'ไม่แน่ใจ',
    gpu: { nvidia: 'มี', nvidiaHint: 'เห็นคำว่า NVIDIA', none: 'ไม่มี', noneHint: 'หรือเห็นแต่ AMD / Intel' },
    unsureNote: 'ไม่เป็นไร เราจะแนะนำแบบปลอดภัยไว้ก่อน ถ้ารู้สเปกทีหลัง กลับมาเปลี่ยนได้',
    question: (n: number) => `คำถาม ${n} จาก 3`,
    ramTitle: 'เครื่องของคุณมี RAM เท่าไร',
    ramHow: 'กด Ctrl + Shift + Esc เพื่อเปิด Task Manager แล้วไปที่แท็บ Performance เลือก Memory ดูตัวเลขมุมขวาบน',
    ramNote: 'ถ้าเห็นตัวเลขอย่าง 15.8GB ให้เลือก 16GB เพราะ Windows กันหน่วยความจำไว้ใช้เองบางส่วน',
    gpuTitle: 'ในแท็บ Performance มีคำว่า NVIDIA ไหม',
    gpuHow: 'ดูที่รายการด้านซ้าย ส่วนที่ขึ้นต้นด้วย GPU',
    gpuLegend: 'การ์ดจอ NVIDIA',
    gpuNoneNote: 'ถ้าเห็นแต่ AMD หรือ Intel ใช้ได้ แต่จะคำนวณเหมือนเครื่องที่ไม่มีการ์ดจอแยก',
    vramLegend: 'Dedicated GPU memory (VRAM หรือหน่วยความจำของการ์ดจอ) เท่าไร',
    tasksTitle: 'อยากให้ AI ช่วยงานแบบไหน',
    tasksLead: 'เลือกได้หลายข้อ เราจะดูผลทดสอบของงานที่คุณเลือก',
    tasksLegend: 'งานที่ใช้',
    back: 'ย้อนกลับ',
    done: 'ทำเสร็จแล้ว ไปต่อ',
    next: 'ถัดไป',
    trouble: [
      { symptom: 'กด Ctrl + Shift + Esc แล้วได้หน้าต่างเล็กๆ ไม่มีแท็บ', fix: 'กด "More details" ที่มุมซ้ายล่างของหน้าต่าง' },
      {
        symptom: 'ไม่เห็นรายการ GPU ในแท็บ Performance',
        fix: 'เลือก "ไม่แน่ใจ" ไปก่อนได้ เราจะคำนวณแบบเครื่องที่ไม่มีการ์ดจอแยก',
      },
    ],
  },
  en: {
    orMore: 'or more',
    unsure: 'Not sure',
    gpu: { nvidia: 'Yes', nvidiaHint: 'I see the word NVIDIA', none: 'No', noneHint: 'Or I only see AMD / Intel' },
    unsureNote: "That's fine. We'll play it safe for now, and you can come back and change it once you know.",
    question: (n: number) => `Question ${n} of 3`,
    ramTitle: 'How much RAM does your computer have?',
    ramHow: 'Press Ctrl + Shift + Esc to open Task Manager, go to the Performance tab, choose Memory, and look at the number in the top right.',
    ramNote: 'If you see something like 15.8GB, choose 16GB. Windows reserves a little memory for itself.',
    gpuTitle: 'Does the Performance tab show the word NVIDIA?',
    gpuHow: 'Look at the list on the left, at the entries starting with GPU.',
    gpuLegend: 'NVIDIA graphics card',
    gpuNoneNote: "AMD or Intel is fine, but we'll treat it like a computer without a separate graphics card.",
    vramLegend: 'How much Dedicated GPU memory (VRAM, the graphics card memory) does it have?',
    tasksTitle: 'What do you want AI to help with?',
    tasksLead: "Pick as many as you like. We'll look at the test results for those tasks.",
    tasksLegend: 'Tasks',
    back: 'Back',
    done: 'Done, next',
    next: 'Next',
    trouble: [
      {
        symptom: 'Ctrl + Shift + Esc opens a small window with no tabs',
        fix: 'Click "More details" in the bottom left of the window.',
      },
      {
        symptom: "There's no GPU entry in the Performance tab",
        fix: 'Choose "Not sure" for now. We\'ll treat it like a computer without a separate graphics card.',
      },
    ],
  },
};

interface Props {
  answers: Answers;
  onChange: (a: Answers) => void;
  question: number;
  onQuestion: (q: number) => void;
  onDone: () => void;
}

export function CheckMachine({ answers, onChange, question: q, onQuestion: setQ, onDone }: Props) {
  const lang = useLang();
  const t = T[lang];
  const RAM: { value: Ram; label: string }[] = [
    { value: 4, label: '4GB' },
    { value: 8, label: '8GB' },
    { value: 16, label: '16GB' },
    { value: 32, label: `32GB ${t.orMore}` },
    { value: 'unsure', label: t.unsure },
  ];
  const GPU: { value: Gpu; label: string; hint?: string }[] = [
    { value: 'nvidia', label: t.gpu.nvidia, hint: t.gpu.nvidiaHint },
    { value: 'none', label: t.gpu.none, hint: t.gpu.noneHint },
    { value: 'unsure', label: t.unsure },
  ];
  const VRAM: { value: Vram; label: string }[] = [
    { value: 4, label: '4GB' },
    { value: 6, label: '6GB' },
    { value: 8, label: '8GB' },
    { value: 12, label: `12GB ${t.orMore}` },
    { value: 'unsure', label: t.unsure },
  ];
  // จำคำถามก่อนหน้าไว้ เพื่อเลือกทิศทางที่คำถามใหม่เลื่อนเข้ามา
  const prevQ = useRef(q);
  const direction = q >= prevQ.current ? 'slide-next' : 'slide-prev';
  prevQ.current = q;
  const set = (patch: Partial<Answers>) => onChange({ ...answers, ...patch });
  const toggleTask = (t: Task) =>
    set({ tasks: answers.tasks.includes(t) ? answers.tasks.filter((x) => x !== t) : [...answers.tasks, t] });

  const canNext = [
    answers.ram !== undefined,
    toMachine(answers) !== null,
    answers.tasks.length > 0,
  ][q];
  const last = q === 2;

  return (
    <section aria-labelledby="q-title">
      {/* กรอบสูงคงที่ ปุ่มด้านล่างจะได้ไม่ขยับเวลาเปลี่ยนคำถาม */}
      <div className="flex min-h-[680px] flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">{t.question(q + 1)}</p>

        <div key={q} className={`${direction} flex-1`}>
          {q === 0 && (
            <>
              <h1 id="q-title" className="mt-1 text-3xl leading-snug font-bold">
                {t.ramTitle}
              </h1>
              <p className="mt-2 text-lg text-muted">{t.ramHow}</p>
              <div className="mt-4">
                <ScreenshotSlot caption="Task Manager > Performance > Memory (Windows 11)" />
              </div>
              <p className="mt-3 flex gap-2 text-sm text-muted">
                <InfoIcon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                {t.ramNote}
              </p>
              <fieldset className="mt-5">
                <legend className="sr-only">RAM</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {RAM.map((o) => (
                    <Choice
                      key={o.value}
                      type="radio"
                      name="ram"
                      label={o.label}
                      checked={answers.ram === o.value}
                      onChange={() => set({ ram: o.value })}
                    />
                  ))}
                </div>
              </fieldset>
              {answers.ram === 'unsure' && <p className="mt-3 text-sm text-muted">{t.unsureNote}</p>}
            </>
          )}

          {q === 1 && (
            <>
              <h1 id="q-title" className="mt-1 text-3xl leading-snug font-bold">
                {t.gpuTitle}
              </h1>
              <p className="mt-2 text-lg text-muted">{t.gpuHow}</p>
              <div className="mt-4">
                <ScreenshotSlot caption="Task Manager > Performance > GPU (Windows 11)" />
              </div>
              <fieldset className="mt-5">
                <legend className="sr-only">{t.gpuLegend}</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {GPU.map((o) => (
                    <Choice
                      key={o.value}
                      type="radio"
                      name="gpu"
                      label={o.label}
                      hint={o.hint}
                      checked={answers.gpu === o.value}
                      onChange={() => set({ gpu: o.value, vram: o.value === 'nvidia' ? answers.vram : undefined })}
                    />
                  ))}
                </div>
              </fieldset>
              {answers.gpu === 'none' && (
                <p className="mt-3 text-sm text-muted">{t.gpuNoneNote}</p>
              )}
              {answers.gpu === 'unsure' && <p className="mt-3 text-sm text-muted">{t.unsureNote}</p>}
              {answers.gpu === 'nvidia' && (
                <fieldset className="fade-in mt-6">
                  <legend className="font-semibold">{t.vramLegend}</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {VRAM.map((o) => (
                      <Choice
                        key={o.value}
                        type="radio"
                        name="vram"
                        label={o.label}
                        checked={answers.vram === o.value}
                        onChange={() => set({ vram: o.value })}
                      />
                    ))}
                  </div>
                </fieldset>
              )}
            </>
          )}

          {q === 2 && (
            <>
              <h1 id="q-title" className="mt-1 text-3xl leading-snug font-bold">
                {t.tasksTitle}
              </h1>
              <p className="mt-2 text-lg text-muted">{t.tasksLead}</p>
              <fieldset className="mt-5">
                <legend className="sr-only">{t.tasksLegend}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TASKS[lang].map((task) => (
                    <Choice
                      key={task.id}
                      type="checkbox"
                      name="tasks"
                      label={task.label}
                      hint={task.hint}
                      checked={answers.tasks.includes(task.id)}
                      onChange={() => toggleTask(task.id)}
                    />
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </div>

        {/* ปุ่มติดขอบล่างของจอเสมอ แม้การ์ดจะสูงกว่าจอ (จอเล็ก หรือตอนมีคำถาม VRAM เพิ่ม) */}
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex items-center justify-between gap-4 rounded-b-2xl border-t border-line bg-surface/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:-mb-8 sm:px-8">
          {q > 0 ? (
            <button
              type="button"
              onClick={() => setQ(q - 1)}
              className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-ink"
            >
              <ArrowLeftIcon size={18} aria-hidden="true" /> {t.back}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={!canNext}
            onClick={() => (last ? onDone() : setQ(q + 1))}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {last ? t.done : t.next} <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Trouble items={t.trouble} />
    </section>
  );
}
