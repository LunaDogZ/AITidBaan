import { useState } from 'react';
import { ArrowRightIcon, CheckCircleIcon, PencilSimpleIcon, WarningCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { goodCount, machineTier, recommend, type MachineAnswers, type Task } from '../../lib/recommend';
import { MODELS, SAMPLE_DATA, TASKS, TEST_DATE, TIER_LABEL } from '../../data/models';
import examples from '../../data/examples.json';
import { Trouble } from './ui';

interface Props {
  machine: MachineAnswers;
  tasks: Task[];
  onEdit: () => void;
  onNext: () => void;
}

const taskLabel = (t: Task) => TASKS.find((x) => x.id === t)!.label;

// คำตอบดิบเป็น markdown ตัดเครื่องหมายที่อ่านแล้วรกออก แสดงเป็นข้อความธรรมดา
const plain = (s: string) => s.replace(/\*\*/g, '').replace(/^#{1,6}[ \t]+/gm, '');

export function Recommendation({ machine, tasks, onEdit, onNext }: Props) {
  const tier = machineTier(machine);
  const model = recommend(machine, tasks, MODELS);

  if (tier === 'notEnough' || !model) return <NotEnough onEdit={onEdit} />;

  const exampleTask = tasks[0];
  const answer = (examples.answers as Record<string, Record<Task, string>>)[model.rawId][exampleTask];
  const prompt = (examples.prompts as Record<Task, string>)[exampleTask];
  const total = goodCount(model, tasks);
  const count = tasks.reduce((n, t) => {
    const r = model.ratings[t];
    return n + (r ? r.good + r.minor + r.bad : 0);
  }, 0);

  return (
    <section aria-labelledby="rec-title">
      <p className="text-muted">จากสเปกที่ตอบ เครื่องของคุณอยู่ระดับ</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-accent-soft px-4 py-1 font-semibold text-accent">{TIER_LABEL[tier]}</span>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          <PencilSimpleIcon size={14} aria-hidden="true" /> เปลี่ยนคำตอบ
        </button>
      </div>

      <article className="mt-6 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">โมเดลที่เหมาะกับคุณ</p>
        <h1 id="rec-title" className="mt-1 text-3xl font-bold tracking-tight">
          {model.name}
        </h1>
        <p className="mt-2 text-muted">{model.blurb}</p>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          <Stat label="ขนาดไฟล์" value={`${model.fileGB} GB`} />
          <Stat
            label="ความเร็ว"
            value={`${model.tokPerSec} token/วินาที`}
            note={model.speedKind}
            help="token คือชิ้นคำที่ AI พิมพ์ออกมา ยิ่งมากยิ่งตอบเร็ว"
          />
          <Stat label="ใช้ได้เลย" value={`${total} จาก ${count} ข้อ`} note="ในงานที่คุณเลือก" />
          <Stat label="ทดสอบเมื่อ" value={TEST_DATE} />
        </dl>

        <h2 className="mt-8 font-semibold">ผลประเมินตามงานที่คุณเลือก</h2>
        {SAMPLE_DATA && (
          <p className="mt-1 text-sm text-minor">ข้อมูลตัวอย่าง ผลประเมินจริงจะมาเมื่อผู้ให้คะแนนส่งครบ</p>
        )}
        <ul className="mt-3 divide-y divide-line">
          {tasks.map((t) => {
            const r = model.ratings[t];
            if (!r) return null;
            return (
              <li key={t} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
                <span className="font-medium">{taskLabel(t)}</span>
                <span className="flex gap-4 text-sm tabular-nums">
                  <span className="inline-flex items-center gap-1 text-good">
                    <CheckCircleIcon size={16} weight="fill" aria-hidden="true" /> ใช้ได้เลย {r.good}
                  </span>
                  <span className="inline-flex items-center gap-1 text-minor">
                    <WarningCircleIcon size={16} weight="fill" aria-hidden="true" /> แก้นิดหน่อย {r.minor}
                  </span>
                  <span className="inline-flex items-center gap-1 text-bad">
                    <XCircleIcon size={16} weight="fill" aria-hidden="true" /> ใช้ไม่ได้ {r.bad}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        <Example task={exampleTask} prompt={prompt} answer={answer} />

        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.98]"
          >
            เริ่มติดตั้ง <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </button>
          {/* TODO: ลิงก์ไปหน้าผลทดสอบเต็มเมื่อมีหน้านั้น */}
          <span className="text-sm text-muted">ดูตารางเปรียบเทียบทั้งหมด (เร็วๆ นี้)</span>
        </div>
      </article>

      <Trouble
        items={[
          {
            symptom: 'ไม่แน่ใจว่าตอบสเปกถูก',
            fix: 'กด "เปลี่ยนคำตอบ" ด้านบนเพื่อกลับไปแก้ได้ทุกเมื่อ',
          },
          {
            symptom: 'อยากเห็นโมเดลตัวอื่นด้วย',
            fix: 'หน้านี้แนะนำตัวเดียวเพื่อไม่ให้ต้องเลือกเอง ถ้าอยากเทียบ ดูได้ที่ตารางเปรียบเทียบทั้งหมด',
          },
        ]}
      />
    </section>
  );
}

function Stat({ label, value, note, help }: { label: string; value: string; note?: string; help?: string }) {
  return (
    <div className="bg-surface p-4">
      <dt className="text-sm text-muted" title={help}>
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
      {note && <dd className="text-xs text-muted">{note}</dd>}
    </div>
  );
}

function Example({ task, prompt, answer }: { task: Task; prompt: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8">
      <h2 className="font-semibold">ตัวอย่างคำตอบจริง: {taskLabel(task)}</h2>
      <details className="mt-3 rounded-xl bg-sunk px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium">ดูคำสั่งและเอกสารต้นทาง</summary>
        <p className="mt-3 whitespace-pre-wrap text-muted">{prompt}</p>
      </details>
      <div className="relative mt-3">
        <p
          id="example-answer"
          className={`whitespace-pre-wrap rounded-xl border border-line p-4 text-[15px] ${open ? '' : 'max-h-56 overflow-hidden'}`}
        >
          {plain(answer)}
        </p>
        {!open && (
          <div className="pointer-events-none absolute inset-x-px bottom-px h-20 rounded-b-xl bg-gradient-to-t from-surface to-transparent" />
        )}
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="example-answer"
        onClick={() => setOpen(!open)}
        className="mt-2 text-sm font-semibold text-accent underline underline-offset-4"
      >
        {open ? 'ย่อคำตอบ' : 'ดูคำตอบเต็ม'}
      </button>
    </div>
  );
}

function NotEnough({ onEdit }: { onEdit: () => void }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold">RAM 4GB ยังไม่พอสำหรับ AI ออฟไลน์</h1>
      <p className="mt-3 max-w-[60ch] text-muted">
        ตัว Windows ใช้ RAM ไปเกือบหมดแล้ว ถ้าเปิดโมเดลเพิ่ม เครื่องจะช้ามากจนใช้งานไม่ได้ ไม่ใช่ความผิดของคุณ
        แค่เครื่องรุ่นนี้ยังไม่เหมาะกับงานนี้
      </p>
      <h2 className="mt-6 font-semibold">ไปต่อได้ 2 ทาง</h2>
      <ul className="mt-3 space-y-3">
        <li className="rounded-xl bg-sunk p-4">
          <p className="font-medium">ดูผลทดสอบไปก่อน</p>
          <p className="text-sm text-muted">อ่านคำตอบจริงของแต่ละโมเดลได้เลย ไม่ต้องติดตั้งอะไร (หน้าผลทดสอบเร็วๆ นี้)</p>
        </li>
        <li className="rounded-xl bg-sunk p-4">
          <p className="font-medium">ถ้าจะซื้อเครื่องหรือขอเครื่องจากบริษัท</p>
          <p className="text-sm text-muted">ขอ RAM อย่างน้อย 8GB ถ้าได้ 16GB จะใช้โมเดลที่เก่งขึ้นได้</p>
        </li>
      </ul>
      <button
        type="button"
        onClick={onEdit}
        className="mt-6 inline-flex items-center gap-1 text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        <PencilSimpleIcon size={14} aria-hidden="true" /> เปลี่ยนคำตอบ
      </button>
    </section>
  );
}
