import { useRef } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, InfoIcon } from '@phosphor-icons/react';
import type { Gpu, Ram, Task, Vram } from '../../lib/recommend';
import { TASKS } from '../../data/models';
import { toMachine, type Answers } from './answers';
import { Choice, Screenshot, ShotSteps, Trouble } from './ui';
import { useLang } from './lang';

const T = {
  th: {
    orMore: 'ขึ้นไป',
    unsure: 'ไม่แน่ใจ',
    gpu: { nvidia: 'มี', nvidiaHint: 'เห็น NVIDIA หรือ AMD Radeon RX', none: 'ไม่มี', noneHint: 'หรือเห็นแต่ Intel / AMD Radeon Graphics' },
    unsureNote: 'ไม่เป็นไร เราจะแนะนำแบบปลอดภัยไว้ก่อน ถ้ารู้สเปกทีหลัง กลับมาเปลี่ยนได้',
    question: (n: number) => `คำถาม ${n} จาก 3`,
    ramTitle: 'เครื่องของคุณมี RAM เท่าไร',
    ramSteps: [
      'คลิกขวาที่แถบด้านล่างของจอ (taskbar) แล้วเลือก Task Manager หรือกด Ctrl + Shift + Esc',
      'เลือก Performance ที่เมนูด้านซ้าย',
      'เลือก Memory แล้วดูตัวเลขมุมขวาบน (ในภาพคือ 16.0 GB)',
    ],
    ramNote: 'ถ้าเห็นตัวเลขอย่าง 15.8GB ให้เลือก 16GB เพราะ Windows กันหน่วยความจำไว้ใช้เองบางส่วน',
    gpuTitle: 'ในแท็บ Performance มีการ์ดจอ NVIDIA หรือ AMD Radeon ไหม',
    gpuHow: 'ดูที่รายการด้านซ้าย ส่วนที่ขึ้นต้นด้วย GPU ถ้ามี NVIDIA หรือ AMD Radeon RX ให้คลิกเข้าไปดู Dedicated GPU memory ด้านล่าง (ในภาพคือ 4.0 GB)',
    gpuLegend: 'การ์ดจอแยก NVIDIA หรือ AMD',
    gpuNoneNote: 'ถ้าเห็นแต่ Intel หรือ AMD Radeon Graphics นั่นคือการ์ดจอในตัว ใช้ได้ แต่จะคำนวณเหมือนเครื่องที่ไม่มีการ์ดจอแยก',
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
        symptom: 'เห็น AMD Radeon Graphics แต่ไม่มีเลขรุ่น RX',
        fix: 'นั่นคือการ์ดจอในตัวของ CPU ให้เลือก "ไม่มี"',
      },
      {
        symptom: 'ไม่เห็นรายการ GPU ในแท็บ Performance',
        fix: 'เลือก "ไม่แน่ใจ" ไปก่อนได้ เราจะคำนวณแบบเครื่องที่ไม่มีการ์ดจอแยก',
      },
    ],
  },
  en: {
    orMore: 'or more',
    unsure: 'Not sure',
    gpu: { nvidia: 'Yes', nvidiaHint: 'I see NVIDIA or AMD Radeon RX', none: 'No', noneHint: 'Or I only see Intel / AMD Radeon Graphics' },
    unsureNote: "That's fine. We'll play it safe for now, and you can come back and change it once you know.",
    question: (n: number) => `Question ${n} of 3`,
    ramTitle: 'How much RAM does your computer have?',
    ramSteps: [
      'Right-click the bar at the bottom of the screen (taskbar) and choose Task Manager, or press Ctrl + Shift + Esc.',
      'Choose Performance in the menu on the left.',
      'Choose Memory and look at the number in the top right (16.0 GB in this picture).',
    ],
    ramNote: 'If you see something like 15.8GB, choose 16GB. Windows reserves a little memory for itself.',
    gpuTitle: 'Does the Performance tab show an NVIDIA or AMD Radeon graphics card?',
    gpuHow: 'Look at the list on the left, at the entries starting with GPU. If one says NVIDIA or AMD Radeon RX, click it and look for Dedicated GPU memory near the bottom (4.0 GB in this picture).',
    gpuLegend: 'Separate NVIDIA or AMD graphics card',
    gpuNoneNote: "Intel or AMD Radeon Graphics is built into the CPU. That's fine, but we'll treat it like a computer without a separate graphics card.",
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
        symptom: 'I see AMD Radeon Graphics with no RX model number',
        fix: 'That\'s the graphics built into the CPU. Choose "No".',
      },
      {
        symptom: "There's no GPU entry in the Performance tab",
        fix: 'Choose "Not sure" for now. We\'ll treat it like a computer without a separate graphics card.',
      },
    ],
  },
};

const RAM_SHOTS = [
  { src: '/screens/check-machine/flow01.jpeg', width: 687, height: 213 },
  { src: '/screens/check-machine/flow02.jpeg', width: 305, height: 475 },
  { src: '/screens/check-machine/flow03.jpeg', width: 1917, height: 1018 },
];

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
              <ShotSteps shots={RAM_SHOTS.map((shot, i) => ({ ...shot, text: t.ramSteps[i] }))} />
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
                <Screenshot src="/screens/check-machine/gpu.jpeg" width={1917} height={1018} alt={t.gpuHow} />
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
