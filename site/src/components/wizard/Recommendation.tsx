import { useState } from 'react';
import { ArrowRightIcon, CheckCircleIcon, LightbulbIcon, PencilSimpleIcon, WarningCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { goodCount, machineTier, recommend, unsureUpgrades, type MachineAnswers, type Task } from '../../lib/recommend';
import { MODELS, SAMPLE_DATA, SPEED_KIND, TASKS, TEST_DATE, TIER_LABEL } from '../../data/models';
import examples from '../../data/examples.json';
import { renderMd } from '../../lib/markdown';
import type { Lang } from '../../i18n';
import { Trouble } from './ui';
import { useLang } from './lang';

interface Props {
  machine: MachineAnswers;
  tasks: Task[];
  onEdit: () => void;
  // ไปที่คำถามข้อนั้นในขั้นเช็กเครื่อง (0 = RAM, 1 = การ์ดจอ)
  onEditQuestion: (q: number) => void;
  onNext: () => void;
}

const T = {
  th: {
    tierLead: 'จากสเปกที่ตอบ เครื่องของคุณอยู่ระดับ',
    edit: 'เปลี่ยนคำตอบ',
    unsureLabel: { ram: 'RAM', gpu: 'การ์ดจอ' },
    unsureNote: (what: string) =>
      `คุณตอบ "ไม่แน่ใจ" เรื่อง ${what} เราเลยแนะนำแบบปลอดภัยไว้ก่อน ถ้ารู้สเปกจริง อาจได้โมเดลที่เก่งกว่านี้`,
    and: ' และ',
    recheck: { ram: 'เช็ก RAM อีกครั้ง', gpu: 'เช็กการ์ดจออีกครั้ง' },
    fits: 'โมเดลที่เหมาะกับคุณ',
    fileSize: 'ขนาดไฟล์',
    speed: 'ความเร็ว',
    perSec: 'token/วินาที',
    speedHelp: 'token คือชิ้นคำที่ AI พิมพ์ออกมา ยิ่งมากยิ่งตอบเร็ว',
    usable: 'ใช้ได้เลย',
    of: (n: number, total: number) => `${n} จาก ${total} ข้อ`,
    inYourTasks: 'ในงานที่คุณเลือก',
    tested: 'ทดสอบเมื่อ',
    scoresTitle: 'ผลประเมินตามงานที่คุณเลือก',
    sample: 'ข้อมูลตัวอย่าง ผลประเมินจริงจะมาเมื่อผู้ให้คะแนนส่งครบ',
    minor: 'แก้นิดหน่อย',
    bad: 'ใช้ไม่ได้',
    start: 'เริ่มติดตั้ง',
    compare: 'ดูตารางเปรียบเทียบทั้งหมด (เร็วๆ นี้)',
    trouble: [
      { symptom: 'ไม่แน่ใจว่าตอบสเปกถูก', fix: 'กด "เปลี่ยนคำตอบ" ด้านบนเพื่อกลับไปแก้ได้ทุกเมื่อ' },
      {
        symptom: 'อยากเห็นโมเดลตัวอื่นด้วย',
        fix: 'หน้านี้แนะนำตัวเดียวเพื่อไม่ให้ต้องเลือกเอง ถ้าอยากเทียบ ดูได้ที่ตารางเปรียบเทียบทั้งหมด',
      },
    ],
    exampleTitle: (task: string) => `ตัวอย่างคำตอบจริง: ${task}`,
    exampleNote: '',
    showPrompt: 'ดูคำสั่งและเอกสารต้นทาง',
    collapse: 'ย่อคำตอบ',
    expand: 'ดูคำตอบเต็ม',
    notEnoughTitle: 'RAM 4GB ยังไม่พอสำหรับ AI ออฟไลน์',
    notEnoughBody:
      'ตัว Windows ใช้ RAM ไปเกือบหมดแล้ว ถ้าเปิดโมเดลเพิ่ม เครื่องจะช้ามากจนใช้งานไม่ได้ ไม่ใช่ความผิดของคุณ แค่เครื่องรุ่นนี้ยังไม่เหมาะกับงานนี้',
    twoWays: 'ไปต่อได้ 2 ทาง',
    ways: [
      { title: 'ดูผลทดสอบไปก่อน', body: 'อ่านคำตอบจริงของแต่ละโมเดลได้เลย ไม่ต้องติดตั้งอะไร (หน้าผลทดสอบเร็วๆ นี้)' },
      { title: 'ถ้าจะซื้อเครื่องหรือขอเครื่องจากบริษัท', body: 'ขอ RAM อย่างน้อย 8GB ถ้าได้ 16GB จะใช้โมเดลที่เก่งขึ้นได้' },
    ],
  },
  en: {
    tierLead: 'Based on your answers, your computer is a',
    edit: 'Change answers',
    unsureLabel: { ram: 'RAM', gpu: 'graphics card' },
    unsureNote: (what: string) =>
      `You answered "Not sure" for ${what}, so we played it safe. If you find out the real specs, you might get a stronger model.`,
    and: ' and ',
    recheck: { ram: 'Check RAM again', gpu: 'Check graphics card again' },
    fits: 'The model that fits you',
    fileSize: 'File size',
    speed: 'Speed',
    perSec: 'tokens/sec',
    speedHelp: 'A token is a piece of a word the AI types out. Higher means faster answers.',
    usable: 'Usable as-is',
    of: (n: number, total: number) => `${n} of ${total}`,
    inYourTasks: 'in your tasks',
    tested: 'Tested',
    scoresTitle: 'Scores for the tasks you picked',
    sample: 'Sample data. Real scores will come once all graders have submitted.',
    minor: 'Minor fixes',
    bad: 'Unusable',
    start: 'Start installing',
    compare: 'See the full comparison table (coming soon)',
    trouble: [
      { symptom: "I'm not sure my answers are right", fix: 'Click "Change answers" above to go back and fix them at any time.' },
      {
        symptom: 'I want to see other models too',
        fix: 'This page recommends just one so you do not have to choose. To compare, see the full comparison table.',
      },
    ],
    exampleTitle: (task: string) => `Real answer example: ${task}`,
    exampleNote: 'The prompt and answer are in Thai, because this site tests Thai documents.',
    showPrompt: 'Show the prompt and source document',
    collapse: 'Collapse answer',
    expand: 'Show full answer',
    notEnoughTitle: '4GB of RAM is not enough for offline AI',
    notEnoughBody:
      "Windows already uses almost all of it. Opening a model on top would make the computer too slow to use. It's not your fault, this computer just isn't suited to the job yet.",
    twoWays: 'Two ways forward',
    ways: [
      { title: 'Look at the test results first', body: "Read each model's real answers without installing anything (results page coming soon)." },
      { title: 'If you are buying a computer or asking your company for one', body: 'Ask for at least 8GB of RAM. With 16GB you can use a stronger model.' },
    ],
  },
};

const taskLabel = (lang: Lang, t: Task) => TASKS[lang].find((x) => x.id === t)!.label;


export function Recommendation({ machine, tasks, onEdit, onEditQuestion, onNext }: Props) {
  const lang = useLang();
  const t = T[lang];
  const tier = machineTier(machine);
  const model = recommend(machine, tasks, MODELS);

  if (tier === 'notEnough' || !model) return <NotEnough onEdit={onEdit} />;
  const unsure = unsureUpgrades(machine);

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
      <p className="text-muted">{t.tierLead}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-accent-soft px-4 py-1 font-semibold text-accent">{TIER_LABEL[lang][tier]}</span>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          <PencilSimpleIcon size={14} aria-hidden="true" /> {t.edit}
        </button>
      </div>

      {unsure.length > 0 && (
        <div className="mt-5 flex gap-3 rounded-xl bg-accent-soft p-4">
          <LightbulbIcon size={22} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p>{t.unsureNote(unsure.map((k) => t.unsureLabel[k]).join(t.and))}</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              {unsure.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => onEditQuestion(k === 'ram' ? 0 : 1)}
                  className="font-semibold text-accent underline underline-offset-4"
                >
                  {t.recheck[k]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <article className="mt-6 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">{t.fits}</p>
        <h1 id="rec-title" className="mt-1 text-3xl font-bold tracking-tight">
          {model.name}
        </h1>
        <p className="mt-2 text-muted">{model.blurb[lang]}</p>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          <Stat label={t.fileSize} value={`${model.fileGB} GB`} />
          <Stat
            label={t.speed}
            value={`${model.tokPerSec} ${t.perSec}`}
            note={SPEED_KIND[lang][model.speedKind]}
            help={t.speedHelp}
          />
          <Stat label={t.usable} value={t.of(total, count)} note={t.inYourTasks} />
          <Stat label={t.tested} value={TEST_DATE[lang]} />
        </dl>

        <h2 className="mt-8 font-semibold">{t.scoresTitle}</h2>
        {SAMPLE_DATA && (
          <p className="mt-1 text-sm text-minor">{t.sample}</p>
        )}
        <ul className="mt-3 divide-y divide-line">
          {tasks.map((task) => {
            const r = model.ratings[task];
            if (!r) return null;
            return (
              <li key={task} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
                <span className="font-medium">{taskLabel(lang, task)}</span>
                <span className="flex gap-4 text-sm tabular-nums">
                  <span className="inline-flex items-center gap-1 text-good">
                    <CheckCircleIcon size={16} weight="fill" aria-hidden="true" /> {t.usable} {r.good}
                  </span>
                  <span className="inline-flex items-center gap-1 text-minor">
                    <WarningCircleIcon size={16} weight="fill" aria-hidden="true" /> {t.minor} {r.minor}
                  </span>
                  <span className="inline-flex items-center gap-1 text-bad">
                    <XCircleIcon size={16} weight="fill" aria-hidden="true" /> {t.bad} {r.bad}
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
            {t.start} <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </button>
          {/* TODO: ลิงก์ไปหน้าผลทดสอบเต็มเมื่อมีหน้านั้น */}
          <span className="text-sm text-muted">{t.compare}</span>
        </div>
      </article>

      <Trouble items={t.trouble} />
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
      {note && <dd className="text-sm text-muted">{note}</dd>}
    </div>
  );
}

function Example({ task, prompt, answer }: { task: Task; prompt: string; answer: string }) {
  const lang = useLang();
  const t = T[lang];
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8">
      <h2 className="font-semibold">{t.exampleTitle(taskLabel(lang, task))}</h2>
      {t.exampleNote && <p className="mt-1 text-sm text-muted">{t.exampleNote}</p>}
      <details className="mt-3 rounded-xl bg-sunk px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium">{t.showPrompt}</summary>
        <p className="mt-3 whitespace-pre-wrap text-muted" lang="th">
          {prompt}
        </p>
      </details>
      <div className="relative mt-3">
        <div
          id="example-answer"
          lang="th"
          className={`md rounded-xl border border-line p-5 ${open ? '' : 'max-h-72 overflow-hidden'}`}
          dangerouslySetInnerHTML={{ __html: renderMd(answer) }}
        />
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
        {open ? t.collapse : t.expand}
      </button>
    </div>
  );
}

function NotEnough({ onEdit }: { onEdit: () => void }) {
  const t = T[useLang()];
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold">{t.notEnoughTitle}</h1>
      <p className="mt-3 max-w-[60ch] text-muted">{t.notEnoughBody}</p>
      <h2 className="mt-6 font-semibold">{t.twoWays}</h2>
      <ul className="mt-3 space-y-3">
        {t.ways.map((w) => (
          <li key={w.title} className="rounded-xl bg-sunk p-4">
            <p className="font-medium">{w.title}</p>
            <p className="text-sm text-muted">{w.body}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onEdit}
        className="mt-6 inline-flex items-center gap-1 text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        <PencilSimpleIcon size={14} aria-hidden="true" /> {t.edit}
      </button>
    </section>
  );
}
