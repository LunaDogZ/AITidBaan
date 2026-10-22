import { useState } from 'react';
import type { Task } from '../../lib/recommend';
import { SPEED_KIND, TASKS, type Model } from '../../data/models';
import examples from '../../data/examples.json';
import { CopyButton, Key, StepShell, Steps, Trouble, Warn } from './ui';
import { useLang } from './lang';

interface Props {
  model: Model;
  tasks: Task[];
  onBack: () => void;
  onNext: () => void;
}

// คำสั่งทดสอบเป็นภาษาไทยทั้งสองภาษา ผู้ใช้คัดลอกไปถามแล้วเทียบกับตัวอย่างบนเว็บได้
const prompts = examples.prompts as Record<Task, string>;

const pasteKeys = (
  <span className="whitespace-nowrap">
    <Key>Ctrl</Key> + <Key>V</Key>
  </span>
);

const T = {
  th: {
    title: 'ลองถามด้วยงานจริง',
    lead: 'เริ่มจากคำสั่งที่เราใช้ทดสอบก่อน คำตอบที่ได้จะใกล้เคียงกับตัวอย่างที่เห็นบนเว็บ',
    tabs: 'งานที่เลือก',
    copyPrompt: 'คัดลอกคำสั่งตัวอย่าง (มีเอกสารต้นทางติดมาด้วยแล้ว)',
    copy: 'คัดลอกคำสั่ง',
    ask: (
      <>
        ใน LM Studio เปิดแชทใหม่ วางคำสั่งด้วย {pasteKeys} แล้วกด <Key>Enter</Key>
      </>
    ),
    speed: (name: string, tps: number, kind: string) =>
      `คำตอบจะค่อยๆ พิมพ์ออกมา ${name} ทำได้ราว ${tps} token ต่อวินาที (${kind})`,
    own: 'ลองกับเอกสารของคุณเอง',
    ownHow:
      'พิมพ์สิ่งที่อยากให้ทำ แล้วคัดลอกข้อความจากไฟล์ Word มาวางต่อท้าย เช่น "ช่วยสรุปประกาศนี้เป็นข้อๆ" ตามด้วยเนื้อหาประกาศ',
    warnTitle: 'คัดลอกข้อความมาวาง ดีกว่าแนบไฟล์',
    warnBody: 'LM Studio แนบไฟล์ได้ แต่ถ้าเอกสารยาว แอปจะหยิบให้ AI อ่านแค่บางท่อน คำตอบจึงอาจตกหล่นโดยไม่บอก',
    trouble: [
      { symptom: 'แนบไฟล์แล้วคำตอบขาดบางเรื่องไป', fix: 'เปิดไฟล์ คัดลอกข้อความทั้งหมด แล้ววางในแชทแทนการแนบ' },
      { symptom: 'แนบ PDF แล้ว AI บอกว่าไม่มีเนื้อหา', fix: 'PDF ที่เป็นภาพสแกนต้องแปลงเป็นข้อความ (OCR) ก่อน AI ถึงจะอ่านได้' },
      { symptom: 'เครื่องช้ามากหรือค้างระหว่างที่ AI ตอบ', fix: 'ปิดเบราว์เซอร์และโปรแกรมอื่นที่ไม่ได้ใช้ แล้วถามใหม่' },
      { symptom: 'คำตอบไม่เหมือนตัวอย่างบนเว็บเป๊ะ', fix: 'เป็นเรื่องปกติ AI ตอบไม่ซ้ำเดิมทุกครั้ง แม้ใช้คำสั่งเดียวกัน' },
    ],
  },
  en: {
    title: 'Try it with real work',
    lead: 'Start with the prompt we used for testing. Your answer should be close to the example on this site.',
    tabs: 'Your tasks',
    copyPrompt: 'Copy the sample prompt (the source document is already included). It is in Thai, like our tests.',
    copy: 'Copy prompt',
    ask: (
      <>
        In LM Studio, start a new chat, paste the prompt with {pasteKeys}, and press <Key>Enter</Key>.
      </>
    ),
    speed: (name: string, tps: number, kind: string) =>
      `The answer types itself out gradually. ${name} manages about ${tps} tokens per second (${kind}).`,
    own: 'Try it with your own documents',
    ownHow:
      'Type what you want done, then paste the text from your Word file after it. For example, "Summarize this notice as bullet points" followed by the notice.',
    warnTitle: 'Paste the text instead of attaching the file',
    warnBody:
      'LM Studio can attach files, but for long documents it only hands the AI some parts, so answers can silently miss things.',
    trouble: [
      { symptom: 'I attached a file and the answer left things out', fix: 'Open the file, copy all the text, and paste it into the chat instead.' },
      {
        symptom: 'I attached a PDF and the AI says it is empty',
        fix: 'Scanned PDFs are images. They need to be converted to text (OCR) before the AI can read them.',
      },
      { symptom: 'The computer is very slow or freezes while the AI answers', fix: 'Close your browser and any programs you are not using, then ask again.' },
      { symptom: "The answer isn't exactly like the example on this site", fix: 'That is normal. AI never answers exactly the same way twice, even with the same prompt.' },
    ],
  },
};

export function TryIt({ model, tasks, onBack, onNext }: Props) {
  const lang = useLang();
  const t = T[lang];
  const [task, setTask] = useState<Task>(tasks[0]);

  return (
    <StepShell title={t.title} lead={t.lead} onBack={onBack} onNext={onNext}>
      {tasks.length > 1 && (
        <div role="tablist" aria-label={t.tabs} className="mt-6 flex flex-wrap gap-2">
          {tasks.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === task}
              onClick={() => setTask(id)}
              className={`rounded-full px-4 py-2 font-semibold transition duration-300 ease-[var(--ease-out)] ${id === task ? 'bg-ink text-surface' : 'bg-sunk text-muted hover:text-ink'}`}
            >
              {TASKS[lang].find((x) => x.id === id)!.label}
            </button>
          ))}
        </div>
      )}

      <Steps
        items={[
          <>
            <p>{t.copyPrompt}</p>
            <pre
              key={task}
              lang="th"
              className="fade-in mt-3 max-h-56 overflow-auto rounded-xl bg-sunk p-4 font-sans text-sm whitespace-pre-wrap text-muted"
            >
              {prompts[task]}
            </pre>
            <div className="mt-3">
              <CopyButton text={prompts[task]} label={t.copy} />
            </div>
          </>,
          <>
            <p>{t.ask}</p>
            <p className="text-muted">{t.speed(model.name, model.tokPerSec, SPEED_KIND[lang][model.speedKind])}</p>
          </>,
          <>
            <p>{t.own}</p>
            <p className="text-muted">{t.ownHow}</p>
          </>,
        ]}
      />

      <Warn>
        <p className="font-semibold">{t.warnTitle}</p>
        <p className="mt-1 text-muted">{t.warnBody}</p>
      </Warn>

      <Trouble items={t.trouble} />
    </StepShell>
  );
}
