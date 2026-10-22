import { ArrowLeftIcon, ArrowRightIcon, InfoIcon } from '@phosphor-icons/react';
import type { Gpu, Ram, Task, Vram } from '../../lib/recommend';
import { TASKS } from '../../data/models';
import { toMachine, type Answers } from './answers';
import { Choice, ScreenshotSlot, Trouble } from './ui';

const RAM: { value: Ram; label: string }[] = [
  { value: 4, label: '4GB' },
  { value: 8, label: '8GB' },
  { value: 16, label: '16GB' },
  { value: 32, label: '32GB ขึ้นไป' },
  { value: 'unsure', label: 'ไม่แน่ใจ' },
];

const GPU: { value: Gpu; label: string; hint?: string }[] = [
  { value: 'nvidia', label: 'มี', hint: 'เห็นคำว่า NVIDIA' },
  { value: 'none', label: 'ไม่มี', hint: 'หรือเห็นแต่ AMD / Intel' },
  { value: 'unsure', label: 'ไม่แน่ใจ' },
];

const VRAM: { value: Vram; label: string }[] = [
  { value: 4, label: '4GB' },
  { value: 6, label: '6GB' },
  { value: 8, label: '8GB' },
  { value: 12, label: '12GB ขึ้นไป' },
  { value: 'unsure', label: 'ไม่แน่ใจ' },
];

const UNSURE_NOTE = 'ไม่เป็นไร เราจะแนะนำแบบปลอดภัยไว้ก่อน ถ้ารู้สเปกทีหลัง กลับมาเปลี่ยนได้';

interface Props {
  answers: Answers;
  onChange: (a: Answers) => void;
  question: number;
  onQuestion: (q: number) => void;
  onDone: () => void;
}

export function CheckMachine({ answers, onChange, question: q, onQuestion: setQ, onDone }: Props) {
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
        <p className="text-sm text-muted">คำถาม {q + 1} จาก 3</p>

        <div key={q} className="fade-in flex-1">
          {q === 0 && (
            <>
              <h1 id="q-title" className="mt-1 text-2xl font-bold">
                เครื่องของคุณมี RAM เท่าไร
              </h1>
              <p className="mt-2 text-muted">
                กด Ctrl + Shift + Esc เพื่อเปิด Task Manager แล้วไปที่แท็บ Performance เลือก Memory
                ดูตัวเลขมุมขวาบน
              </p>
              <div className="mt-4">
                <ScreenshotSlot caption="Task Manager > Performance > Memory (Windows 11)" />
              </div>
              <p className="mt-3 flex gap-2 text-sm text-muted">
                <InfoIcon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                ถ้าเห็นตัวเลขอย่าง 15.8GB ให้เลือก 16GB เพราะ Windows กันหน่วยความจำไว้ใช้เองบางส่วน
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
              {answers.ram === 'unsure' && <p className="mt-3 text-sm text-muted">{UNSURE_NOTE}</p>}
            </>
          )}

          {q === 1 && (
            <>
              <h1 id="q-title" className="mt-1 text-2xl font-bold">
                ในแท็บ Performance มีคำว่า NVIDIA ไหม
              </h1>
              <p className="mt-2 text-muted">ดูที่รายการด้านซ้าย ส่วนที่ขึ้นต้นด้วย GPU</p>
              <div className="mt-4">
                <ScreenshotSlot caption="Task Manager > Performance > GPU (Windows 11)" />
              </div>
              <fieldset className="mt-5">
                <legend className="sr-only">การ์ดจอ NVIDIA</legend>
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
                <p className="mt-3 text-sm text-muted">
                  ถ้าเห็นแต่ AMD หรือ Intel ใช้ได้ แต่จะคำนวณเหมือนเครื่องที่ไม่มีการ์ดจอแยก
                </p>
              )}
              {answers.gpu === 'unsure' && <p className="mt-3 text-sm text-muted">{UNSURE_NOTE}</p>}
              {answers.gpu === 'nvidia' && (
                <fieldset className="fade-in mt-6">
                  <legend className="font-semibold">
                    Dedicated GPU memory (VRAM หรือหน่วยความจำของการ์ดจอ) เท่าไร
                  </legend>
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
              <h1 id="q-title" className="mt-1 text-2xl font-bold">
                อยากให้ AI ช่วยงานแบบไหน
              </h1>
              <p className="mt-2 text-muted">เลือกได้หลายข้อ เราจะดูผลทดสอบของงานที่คุณเลือก</p>
              <fieldset className="mt-5">
                <legend className="sr-only">งานที่ใช้</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TASKS.map((t) => (
                    <Choice
                      key={t.id}
                      type="checkbox"
                      name="tasks"
                      label={t.label}
                      hint={t.hint}
                      checked={answers.tasks.includes(t.id)}
                      onChange={() => toggleTask(t.id)}
                    />
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          {q > 0 ? (
            <button
              type="button"
              onClick={() => setQ(q - 1)}
              className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-ink"
            >
              <ArrowLeftIcon size={18} aria-hidden="true" /> ย้อนกลับ
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
            {last ? 'ทำเสร็จแล้ว ไปต่อ' : 'ถัดไป'} <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Trouble
        items={[
          {
            symptom: 'กด Ctrl + Shift + Esc แล้วได้หน้าต่างเล็กๆ ไม่มีแท็บ',
            fix: 'กด "More details" ที่มุมซ้ายล่างของหน้าต่าง',
          },
          {
            symptom: 'ไม่เห็นรายการ GPU ในแท็บ Performance',
            fix: 'เลือก "ไม่แน่ใจ" ไปก่อนได้ เราจะคำนวณแบบเครื่องที่ไม่มีการ์ดจอแยก',
          },
        ]}
      />
    </section>
  );
}
