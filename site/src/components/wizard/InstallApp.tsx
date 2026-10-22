import { useState } from 'react';
import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import type { Model } from '../../data/models';
import { diskNeedGB, downloadMinutes } from '../../lib/install';
import { Choice, Key, ScreenshotSlot, StepShell, Steps, Trouble, Warn } from './ui';
import { useLang } from './lang';

const DOWNLOAD_URL = 'https://lmstudio.ai/download';

const settingsKeys = (
  <span className="whitespace-nowrap">
    <Key>Ctrl</Key> + <Key>,</Key>
  </span>
);

const T = {
  th: {
    title: 'ติดตั้ง LM Studio',
    lead: 'LM Studio คือแอปที่ใช้เปิดโมเดล AI บนเครื่องของคุณ ฟรีสำหรับใช้ในงาน และมีเมนูภาษาไทย',
    before: 'เช็กก่อนโหลด',
    checks: (need: number, fileGB: number, fast: number, slow: number) => [
      {
        label: `ไดรฟ์ C ว่างอย่างน้อย ${need} GB`,
        hint: `ไฟล์โมเดล ${fileGB} GB และเผื่อสำหรับตัวแอป ดูได้ที่ This PC (ไอคอนคอมในหน้าต่างโฟลเดอร์)`,
      },
      { label: 'ต่อเน็ตที่ไม่ใช่เน็ตมือถือแบบจำกัด', hint: `โหลดโมเดลประมาณ ${fast}-${slow} นาที (เน็ตบ้าน 100 ถึง 30 Mbps)` },
      { label: 'เสียบสายชาร์จไว้', hint: 'โหลดและติดตั้งนาน แบตหมดกลางทางต้องเริ่มใหม่' },
    ],
    diskShot: 'This PC > ไดรฟ์ C แสดงพื้นที่ว่าง (Windows 11)',
    warnTitle: 'เลือก "LM Studio" ไม่ใช่ "LM Studio Bionic"',
    warnBody: 'หน้าแรกของเว็บ LM Studio ชวนโหลด Bionic ซึ่งเป็นแอปอีกตัว ให้เข้าผ่านปุ่มด้านล่างที่พาไปหน้าดาวน์โหลดโดยตรง',
    open: 'เปิดหน้าดาวน์โหลด LM Studio',
    pickWindows: 'เลือก Windows แล้วรอไฟล์ .exe โหลดเสร็จ',
    run: 'เปิดไฟล์ที่โหลดมา แล้วกดติดตั้งตามขั้นตอนของโปรแกรม',
    thai: 'เปิด LM Studio ขึ้นมา ถ้าอยากได้เมนูภาษาไทย',
    thaiHow: (
      <>กด {settingsKeys} ไปที่ Language แล้วเลือกภาษาไทย (แปลไว้ไม่ครบ จะเห็นภาษาอังกฤษปนบ้าง)</>
    ),
    trouble: [
      {
        symptom: 'Windows ขึ้นหน้าจอสีฟ้า "Windows protected your PC"',
        fix: 'ถ้าไฟล์โหลดมาจากหน้าดาวน์โหลดด้านบน กด "More info" แล้วกด "Run anyway"',
      },
      { symptom: 'ติดตั้งไปแล้วแต่ได้ LM Studio Bionic', fix: 'ถอนการติดตั้ง Bionic ได้ที่ Settings > Apps แล้วโหลดใหม่จากปุ่มด้านบน' },
      {
        symptom: 'ติดตั้งแล้วเปิดไม่ขึ้น หรือแจ้งว่า CPU ไม่รองรับ',
        fix: 'LM Studio ต้องใช้ CPU ที่รองรับ AVX2 เครื่องที่เก่ามากอาจไม่รองรับ',
      },
      { symptom: 'ไดรฟ์ C เต็ม', fix: 'ลบไฟล์ในโฟลเดอร์ Downloads หรือย้ายรูปและวิดีโอไปไดรฟ์อื่นก่อน' },
    ],
  },
  en: {
    title: 'Install LM Studio',
    lead: 'LM Studio is the app that runs AI models on your computer. It is free for work use.',
    before: 'Check before downloading',
    checks: (need: number, fileGB: number, fast: number, slow: number) => [
      {
        label: `At least ${need} GB free on drive C`,
        hint: `The model file is ${fileGB} GB, plus room for the app. Check under This PC (the computer icon in File Explorer).`,
      },
      {
        label: 'Use an internet connection without a data cap',
        hint: `The model takes about ${fast}-${slow} minutes to download (home internet at 100 to 30 Mbps).`,
      },
      { label: 'Plug in the charger', hint: 'Downloading and installing take a while. If the battery dies you have to start over.' },
    ],
    diskShot: 'This PC > drive C showing free space (Windows 11)',
    warnTitle: 'Choose "LM Studio", not "LM Studio Bionic"',
    warnBody:
      "The LM Studio homepage promotes Bionic, which is a different app. Use the button below, which goes straight to the download page.",
    open: 'Open the LM Studio download page',
    pickWindows: 'Choose Windows and wait for the .exe file to finish downloading.',
    run: 'Open the downloaded file and follow the installer.',
    thai: 'Open LM Studio.',
    thaiHow: <>To change the menu language, press {settingsKeys} and go to Language.</>,
    trouble: [
      {
        symptom: 'Windows shows a blue "Windows protected your PC" screen',
        fix: 'If the file came from the download page above, click "More info" and then "Run anyway".',
      },
      {
        symptom: 'I installed it but got LM Studio Bionic',
        fix: 'Uninstall Bionic in Settings > Apps, then download again using the button above.',
      },
      {
        symptom: "It won't open after installing, or says the CPU is not supported",
        fix: 'LM Studio needs a CPU that supports AVX2. Very old computers may not.',
      },
      { symptom: 'Drive C is full', fix: 'Delete files in your Downloads folder, or move photos and videos to another drive first.' },
    ],
  },
};

interface Props {
  model: Model;
  onBack: () => void;
  onNext: () => void;
}

export function InstallApp({ model, onBack, onNext }: Props) {
  const t = T[useLang()];
  const checks = t.checks(
    diskNeedGB(model.fileGB),
    model.fileGB,
    downloadMinutes(model.fileGB, 100),
    downloadMinutes(model.fileGB, 30),
  );
  const [ticked, setTicked] = useState<boolean[]>(checks.map(() => false));

  return (
    <StepShell title={t.title} lead={t.lead} onBack={onBack} onNext={onNext}>
      <h2 className="mt-8 font-semibold">{t.before}</h2>
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
        <ScreenshotSlot caption={t.diskShot} />
      </div>

      <Warn>
        <p className="font-semibold">{t.warnTitle}</p>
        <p className="mt-1 text-muted">{t.warnBody}</p>
      </Warn>

      <Steps
        items={[
          <>
            <a
              href={DOWNLOAD_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border-2 border-accent px-4 py-2 font-semibold whitespace-nowrap text-accent transition hover:bg-accent-soft max-sm:text-base sm:px-5"
            >
              {t.open} <ArrowSquareOutIcon size={18} aria-hidden="true" />
            </a>
            <p className="mt-2 text-muted">{t.pickWindows}</p>
          </>,
          <p>{t.run}</p>,
          <>
            <p>{t.thai}</p>
            <p className="text-muted">{t.thaiHow}</p>
          </>,
        ]}
      />

      <Trouble items={t.trouble} />
    </StepShell>
  );
}
