import { ArrowSquareOutIcon, CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import type { Model } from '../../data/models';
import { diskNeedGB } from '../../lib/install';
import { Key, Screenshot, ShotSteps, StepShell, Steps, Trouble } from './ui';
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
    checks: (need: number) => [
      { label: `ที่ว่าง ${need} GB`, hint: 'ไดรฟ์ C หรือ D' },
      { label: 'ใช้ Wi-Fi', hint: 'เพื่อความรวดเร็ว' },
      { label: 'เสียบสายชาร์จ', hint: 'กันแบตหมดกลางทาง' },
    ],
    diskHow: 'วิธีดูที่ว่าง',
    diskSteps: [
      'กดไอคอนโฟลเดอร์ (File Explorer) ที่แถบด้านล่างของจอ หรือกด Windows + E',
      'เลือก This PC ที่เมนูด้านซ้าย',
      'ดูตัวเลขใต้ไดรฟ์ C หรือ D (ในภาพไดรฟ์ C ว่าง 12.2 GB, ไดรฟ์ D ว่าง 133 GB)',
    ],
    right: 'โหลดตัวนี้',
    wrong: 'แอปอีกตัว ไม่ใช่ตัวนี้',
    bionicNote: 'หน้าแรกของเว็บ LM Studio ชวนโหลด Bionic ปุ่มด้านบนจะพาไปหน้าดาวน์โหลดตัวที่ถูกโดยตรง',
    open: 'เปิดหน้าดาวน์โหลด LM Studio',
    pickWindows: 'กด Download LM Studio for Windows แล้วรอไฟล์ .exe โหลดเสร็จ',
    shotSource: 'ภาพจาก lmstudio.ai',
    run: 'เปิดไฟล์ที่โหลดมา แล้วกดติดตั้งตามขั้นตอนของโปรแกรม',
    firstOpen: 'เปิด LM Studio แล้วกด Skip for now',
    firstOpenWhy: 'จากนั้นกด Get Started ส่วนโมเดลเราจะโหลดกันในขั้นถัดไป',
    thai: 'ถ้าอยากได้เมนูภาษาไทย',
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
      { symptom: 'ไดรฟ์ C เต็ม', fix: 'เก็บโมเดลไว้ไดรฟ์ D แทน (เปลี่ยนที่แท็บ My Models ของ LM Studio) หรือลบไฟล์ในโฟลเดอร์ Downloads ก่อน' },
    ],
  },
  en: {
    title: 'Install LM Studio',
    lead: 'LM Studio is the app that runs AI models on your computer. It is free for work use.',
    before: 'Check before downloading',
    checks: (need: number) => [
      { label: `${need} GB free`, hint: 'On drive C or D' },
      { label: 'Use Wi-Fi', hint: 'For a faster download' },
      { label: 'Plug in charger', hint: "So the battery won't die" },
    ],
    diskHow: 'How to check free space',
    diskSteps: [
      'Click the folder icon (File Explorer) on the bar at the bottom of the screen, or press Windows + E.',
      'Choose This PC in the menu on the left.',
      'Look at the number under drive C or D (in this picture drive C has 12.2 GB free and drive D has 133 GB).',
    ],
    right: 'Download this one',
    wrong: 'A different app, not this one',
    bionicNote: 'The LM Studio homepage promotes Bionic. The button above goes straight to the right download page.',
    open: 'Open the LM Studio download page',
    pickWindows: 'Click Download LM Studio for Windows and wait for the .exe file to finish downloading.',
    shotSource: 'Image from lmstudio.ai',
    run: 'Open the downloaded file and follow the installer.',
    firstOpen: 'Open LM Studio and click Skip for now.',
    firstOpenWhy: "Then click Get Started. We'll download a model in the next step.",
    thai: 'Menu language',
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
      { symptom: 'Drive C is full', fix: 'Keep models on drive D instead (change it in the My Models tab of LM Studio), or delete files in your Downloads folder first.' },
    ],
  },
};

const DISK_SHOTS = [
  { src: '/screens/install-app/flow01.jpeg', width: 62, height: 62 },
  { src: '/screens/install-app/flow02.jpeg', width: 187, height: 205 },
  { src: '/screens/install-app/flow03.jpeg', width: 687, height: 137 },
];

interface Props {
  model: Model;
  onBack: () => void;
  onNext: () => void;
}

export function InstallApp({ model, onBack, onNext }: Props) {
  const t = T[useLang()];
  const checks = t.checks(diskNeedGB(model.fileGB));

  return (
    <StepShell title={t.title} lead={t.lead} onBack={onBack} onNext={onNext}>
      <h2 className="mt-8 font-semibold">{t.before}</h2>
      {/* เลขใหญ่เรียงแนวนอน คำสั้นๆ ใต้เลข อ่านปราดเดียวจบ */}
      <ol className="mt-4 grid grid-cols-3 gap-4 sm:gap-8">
        {checks.map((c, i) => (
          <li key={c.label}>
            <span className="block text-5xl leading-none font-bold text-accent tabular-nums">{i + 1}</span>
            <p className="mt-3 text-lg leading-snug font-semibold">{c.label}</p>
            <p className="text-sm text-muted">{c.hint}</p>
          </li>
        ))}
      </ol>

      <h3 className="mt-8 font-semibold">{t.diskHow}</h3>
      <ShotSteps shots={DISK_SHOTS.map((shot, i) => ({ ...shot, text: t.diskSteps[i] }))} />

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
            <figure className="mt-3">
              <Screenshot src="/screens/install-app/download.jpeg" width={1222} height={586} alt={t.pickWindows} />
              <figcaption className="mt-1 text-sm text-muted">{t.shotSource}</figcaption>
            </figure>
            {/* หน้าตาเดียวกับปุ่มเลือกในวิซาร์ด: ตัวที่ถูกเหมือนถูกเลือกไว้ ตัวที่ผิดถูกขีดฆ่า */}
            <div className="mt-4 grid max-w-lg gap-2 sm:grid-cols-2">
              <div className="relative rounded-xl border-2 border-accent bg-accent-soft px-4 py-3">
                <CheckCircleIcon size={22} weight="fill" className="absolute top-3 right-3 text-accent" aria-hidden="true" />
                <p className="pr-6 text-lg font-semibold">LM Studio</p>
                <p className="text-sm text-muted">{t.right}</p>
              </div>
              <div className="relative rounded-xl border-2 border-dashed border-line px-4 py-3">
                <XCircleIcon size={22} weight="fill" className="absolute top-3 right-3 text-bad" aria-hidden="true" />
                <p className="pr-6 text-lg font-semibold text-muted line-through decoration-bad decoration-2">LM Studio Bionic</p>
                <p className="text-sm text-muted">{t.wrong}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted">{t.bionicNote}</p>
          </>,
          <p>{t.run}</p>,
          <>
            <p>{t.firstOpen}</p>
            <p className="text-muted">{t.firstOpenWhy}</p>
            <div className="mt-3">
              <Screenshot src="/screens/install-app/first-model.jpeg" width={880} height={710} alt={t.firstOpen} />
            </div>
          </>,
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
