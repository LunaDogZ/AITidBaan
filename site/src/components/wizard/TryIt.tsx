import { useState } from 'react';
import type { Task } from '../../lib/recommend';
import { TASKS, type Model } from '../../data/models';
import examples from '../../data/examples.json';
import { CopyButton, Key, StepShell, Steps, Trouble, Warn } from './ui';

interface Props {
  model: Model;
  tasks: Task[];
  onBack: () => void;
  onNext: () => void;
}

const prompts = examples.prompts as Record<Task, string>;

export function TryIt({ model, tasks, onBack, onNext }: Props) {
  const [task, setTask] = useState<Task>(tasks[0]);

  return (
    <StepShell
      title="ลองถามด้วยงานจริง"
      lead="เริ่มจากคำสั่งที่เราใช้ทดสอบก่อน คำตอบที่ได้จะใกล้เคียงกับตัวอย่างที่เห็นบนเว็บ"
      onBack={onBack}
      onNext={onNext}
    >
      {tasks.length > 1 && (
        <div role="tablist" aria-label="งานที่เลือก" className="mt-6 flex flex-wrap gap-2">
          {tasks.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === task}
              onClick={() => setTask(t)}
              className={`rounded-full px-4 py-2 font-semibold transition duration-300 ease-[var(--ease-out)] ${t === task ? 'bg-ink text-surface' : 'bg-sunk text-muted hover:text-ink'}`}
            >
              {TASKS.find((x) => x.id === t)!.label}
            </button>
          ))}
        </div>
      )}

      <Steps
        items={[
          <>
            <p>คัดลอกคำสั่งตัวอย่าง (มีเอกสารต้นทางติดมาด้วยแล้ว)</p>
            <pre
              key={task}
              className="fade-in mt-3 max-h-56 overflow-auto rounded-xl bg-sunk p-4 font-sans text-sm whitespace-pre-wrap text-muted"
            >
              {prompts[task]}
            </pre>
            <div className="mt-3">
              <CopyButton text={prompts[task]} label="คัดลอกคำสั่ง" />
            </div>
          </>,
          <>
            <p>
              ใน LM Studio เปิดแชทใหม่ วางคำสั่งด้วย <span className="whitespace-nowrap"><Key>Ctrl</Key> + <Key>V</Key></span> แล้วกด <Key>Enter</Key>
            </p>
            <p className="text-muted">
              คำตอบจะค่อยๆ พิมพ์ออกมา {model.name} ทำได้ราว {model.tokPerSec} token ต่อวินาที ({model.speedKind})
            </p>
          </>,
          <>
            <p>ลองกับเอกสารของคุณเอง</p>
            <p className="text-muted">
              พิมพ์สิ่งที่อยากให้ทำ แล้วคัดลอกข้อความจากไฟล์ Word มาวางต่อท้าย เช่น "ช่วยสรุปประกาศนี้เป็นข้อๆ"
              ตามด้วยเนื้อหาประกาศ
            </p>
          </>,
        ]}
      />

      <Warn>
        <p className="font-semibold">คัดลอกข้อความมาวาง ดีกว่าแนบไฟล์</p>
        <p className="mt-1 text-muted">
          LM Studio แนบไฟล์ได้ แต่ถ้าเอกสารยาว แอปจะหยิบให้ AI อ่านแค่บางท่อน คำตอบจึงอาจตกหล่นโดยไม่บอก
        </p>
      </Warn>

      <Trouble
        items={[
          {
            symptom: 'แนบไฟล์แล้วคำตอบขาดบางเรื่องไป',
            fix: 'เปิดไฟล์ คัดลอกข้อความทั้งหมด แล้ววางในแชทแทนการแนบ',
          },
          {
            symptom: 'แนบ PDF แล้ว AI บอกว่าไม่มีเนื้อหา',
            fix: 'PDF ที่เป็นภาพสแกนต้องแปลงเป็นข้อความ (OCR) ก่อน AI ถึงจะอ่านได้',
          },
          {
            symptom: 'เครื่องช้ามากหรือค้างระหว่างที่ AI ตอบ',
            fix: 'ปิดเบราว์เซอร์และโปรแกรมอื่นที่ไม่ได้ใช้ แล้วถามใหม่',
          },
          {
            symptom: 'คำตอบไม่เหมือนตัวอย่างบนเว็บเป๊ะ',
            fix: 'เป็นเรื่องปกติ AI ตอบไม่ซ้ำเดิมทุกครั้ง แม้ใช้คำสั่งเดียวกัน',
          },
        ]}
      />
    </StepShell>
  );
}
