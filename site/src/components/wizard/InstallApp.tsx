import { useState } from 'react';
import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import type { Model } from '../../data/models';
import { diskNeedGB, downloadMinutes } from '../../lib/install';
import { Choice, Key, ScreenshotSlot, StepShell, Steps, Trouble, Warn } from './ui';

const DOWNLOAD_URL = 'https://lmstudio.ai/download';

interface Props {
  model: Model;
  onBack: () => void;
  onNext: () => void;
}

export function InstallApp({ model, onBack, onNext }: Props) {
  const need = diskNeedGB(model.fileGB);
  const fast = downloadMinutes(model.fileGB, 100);
  const slow = downloadMinutes(model.fileGB, 30);
  const checks = [
    {
      label: `ไดรฟ์ C ว่างอย่างน้อย ${need} GB`,
      hint: `ไฟล์โมเดล ${model.fileGB} GB และเผื่อสำหรับตัวแอป ดูได้ที่ This PC (ไอคอนคอมในหน้าต่างโฟลเดอร์)`,
    },
    {
      label: 'ต่อเน็ตที่ไม่ใช่เน็ตมือถือแบบจำกัด',
      hint: `โหลดโมเดลประมาณ ${fast}-${slow} นาที (เน็ตบ้าน 100 ถึง 30 Mbps)`,
    },
    { label: 'เสียบสายชาร์จไว้', hint: 'โหลดและติดตั้งนาน แบตหมดกลางทางต้องเริ่มใหม่' },
  ];
  const [ticked, setTicked] = useState<boolean[]>(checks.map(() => false));

  return (
    <StepShell
      title="ติดตั้ง LM Studio"
      lead="LM Studio คือแอปที่ใช้เปิดโมเดล AI บนเครื่องของคุณ ฟรีสำหรับใช้ในงาน และมีเมนูภาษาไทย"
      onBack={onBack}
      onNext={onNext}
    >
      <h2 className="mt-8 font-semibold">เช็กก่อนโหลด</h2>
      <div className="mt-3 grid gap-2">
        {checks.map((c, i) => (
          <Choice
            key={c.label}
            type="checkbox"
            name="before-install"
            label={c.label}
            hint={c.hint}
            checked={ticked[i]}
            onChange={() => setTicked(ticked.map((t, j) => (j === i ? !t : t)))}
          />
        ))}
      </div>
      <div className="mt-4">
        <ScreenshotSlot caption="This PC > ไดรฟ์ C แสดงพื้นที่ว่าง (Windows 11)" />
      </div>

      <Warn>
        <p className="font-semibold">เลือก "LM Studio" ไม่ใช่ "LM Studio Bionic"</p>
        <p className="mt-1 text-muted">
          หน้าแรกของเว็บ LM Studio ชวนโหลด Bionic ซึ่งเป็นแอปอีกตัว ให้เข้าผ่านปุ่มด้านล่างที่พาไปหน้าดาวน์โหลดโดยตรง
        </p>
      </Warn>

      <Steps
        items={[
          <>
            <a
              href={DOWNLOAD_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border-2 border-accent px-5 py-2 font-semibold text-accent transition hover:bg-accent-soft"
            >
              เปิดหน้าดาวน์โหลด LM Studio <ArrowSquareOutIcon size={18} aria-hidden="true" />
            </a>
            <p className="mt-2 text-muted">เลือก Windows แล้วรอไฟล์ .exe โหลดเสร็จ</p>
          </>,
          <p>เปิดไฟล์ที่โหลดมา แล้วกดติดตั้งตามขั้นตอนของโปรแกรม</p>,
          <>
            <p>เปิด LM Studio ขึ้นมา ถ้าอยากได้เมนูภาษาไทย</p>
            <p className="text-muted">
              กด <span className="whitespace-nowrap"><Key>Ctrl</Key> + <Key>,</Key></span> ไปที่ Language แล้วเลือกภาษาไทย (แปลไว้ไม่ครบ จะเห็นภาษาอังกฤษปนบ้าง)
            </p>
          </>,
        ]}
      />

      <Trouble
        items={[
          {
            symptom: 'Windows ขึ้นหน้าจอสีฟ้า "Windows protected your PC"',
            fix: 'ถ้าไฟล์โหลดมาจากหน้าดาวน์โหลดด้านบน กด "More info" แล้วกด "Run anyway"',
          },
          {
            symptom: 'ติดตั้งไปแล้วแต่ได้ LM Studio Bionic',
            fix: 'ถอนการติดตั้ง Bionic ได้ที่ Settings > Apps แล้วโหลดใหม่จากปุ่มด้านบน',
          },
          {
            symptom: 'ติดตั้งแล้วเปิดไม่ขึ้น หรือแจ้งว่า CPU ไม่รองรับ',
            fix: 'LM Studio ต้องใช้ CPU ที่รองรับ AVX2 เครื่องที่เก่ามากอาจไม่รองรับ',
          },
          {
            symptom: 'ไดรฟ์ C เต็ม',
            fix: 'ลบไฟล์ในโฟลเดอร์ Downloads หรือย้ายรูปและวิดีโอไปไดรฟ์อื่นก่อน',
          },
        ]}
      />
    </StepShell>
  );
}
