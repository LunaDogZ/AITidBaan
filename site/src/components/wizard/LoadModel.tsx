import type { Model } from '../../data/models';
import { downloadMinutes } from '../../lib/install';
import { CopyButton, Key, ScreenshotSlot, StepShell, Steps, Trouble, Warn } from './ui';
import { useLang } from './lang';

const pasteKeys = (
  <span className="whitespace-nowrap">
    <Key>Ctrl</Key> + <Key>V</Key>
  </span>
);

const T = {
  th: {
    title: (name: string) => `โหลด ${name} ลงเครื่อง`,
    lead: 'โหลดครั้งเดียว หลังจากนี้ใช้ได้โดยไม่ต้องต่อเน็ต',
    copy: 'คัดลอกลิงก์โมเดล',
    paste: <>ใน LM Studio กดแท็บ Discover (รูปแว่นขยายแถบซ้าย) แล้ววางลิงก์ในช่องค้นหาด้วย {pasteKeys}</>,
    pasteShot: 'LM Studio > Discover วางลิงก์ในช่องค้นหา',
    pick: 'เลือกไฟล์ที่ชื่อมีคำว่า Q4_K_M แล้วกด Download',
    q4: (fileGB: number, fast: number, slow: number) =>
      `Q4_K_M คือแบบที่บีบให้เล็กลงจนเปิดบนโน้ตบุ๊กได้ แต่ยังตอบได้ดี ไฟล์ ${fileGB} GB ใช้เวลาประมาณ ${fast}-${slow} นาที`,
    load: 'โหลดเสร็จแล้ว กดเลือกโมเดลที่แถบด้านบนของหน้าแชท แล้วตั้ง Context Length ก่อนกดโหลด',
    loadShot: 'LM Studio > เลือกโมเดล > ตั้ง Context Length เป็น 8192',
    ctxTitle: 'ตั้ง Context Length เป็น 8192 ทุกครั้งที่โหลดโมเดล',
    ctxBody:
      'Context Length คือความยาวที่ AI จำได้ในแชทหนึ่ง ถ้าน้อยไป เอกสารภาษาไทยแค่ 1-2 หน้าก็ล้น แล้ว AI จะอ่านแค่บางท่อน',
    bigTitle: 'ปิดเบราว์เซอร์ก่อนใช้โมเดลตัวนี้',
    bigBody: 'โมเดลตัวใหญ่ใช้หน่วยความจำมาก ถ้าเปิด Chrome หรือ Firefox ค้างไว้ด้วย เครื่องอาจช้าจนแทบขยับไม่ได้',
    trouble: (repo: string) => [
      {
        symptom: 'วางลิงก์แล้วไม่เจอโมเดล',
        fix: (
          <>
            พิมพ์ชื่อ <code className="break-all">{repo}</code> ในช่องค้นหาของแท็บ Discover แทน
          </>
        ),
      },
      { symptom: 'โหลดค้างหรือหลุดกลางทาง', fix: 'เช็กเน็ตแล้วกดโหลดต่อในรายการดาวน์โหลดของ LM Studio ไม่ต้องเริ่มใหม่ทั้งหมด' },
      {
        symptom: 'LM Studio ไม่ยอมโหลดโมเดล บอกว่าใหญ่เกินเครื่อง',
        fix: 'ปิดโปรแกรมอื่นแล้วลองใหม่ ถ้ายังไม่ได้ กลับไปเช็กสเปกในขั้นแรกอีกครั้ง ไม่แนะนำให้บังคับโหลด เพราะเครื่องอาจค้าง',
      },
      { symptom: 'เห็นคำว่า GGUF ในชื่อไฟล์', fix: 'GGUF คือรูปแบบไฟล์โมเดลที่ LM Studio เปิดได้ ไม่ต้องทำอะไรเพิ่ม' },
    ],
  },
  en: {
    title: (name: string) => `Download ${name}`,
    lead: 'You download it once. After that it works without the internet.',
    copy: 'Copy model link',
    paste: <>In LM Studio, open the Discover tab (the magnifying glass on the left) and paste the link into the search box with {pasteKeys}.</>,
    pasteShot: 'LM Studio > Discover, link pasted in the search box',
    pick: 'Choose the file with Q4_K_M in its name and click Download.',
    q4: (fileGB: number, fast: number, slow: number) =>
      `Q4_K_M is a version compressed enough to run on a laptop while still answering well. The ${fileGB} GB file takes about ${fast}-${slow} minutes.`,
    load: 'When it finishes, pick the model from the bar at the top of the chat screen, and set Context Length before loading it.',
    loadShot: 'LM Studio > select model > set Context Length to 8192',
    ctxTitle: 'Set Context Length to 8192 every time you load the model',
    ctxBody:
      'Context Length is how much the AI can remember in one chat. If it is too small, even 1-2 pages of Thai text overflow and the AI only reads part of it.',
    bigTitle: 'Close your browser before using this model',
    bigBody: 'Large models use a lot of memory. With Chrome or Firefox open too, the computer can slow to a crawl.',
    trouble: (repo: string) => [
      {
        symptom: 'Pasting the link finds nothing',
        fix: (
          <>
            Type <code className="break-all">{repo}</code> into the Discover search box instead.
          </>
        ),
      },
      {
        symptom: 'The download stalls or drops',
        fix: "Check your internet, then resume it from LM Studio's download list. No need to start over.",
      },
      {
        symptom: 'LM Studio refuses to load the model, saying it is too big',
        fix: 'Close other programs and try again. If that fails, go back and recheck your specs in step one. Forcing it to load is not recommended, as the computer may freeze.',
      },
      { symptom: 'The file name says GGUF', fix: 'GGUF is the model file format LM Studio opens. Nothing else to do.' },
    ],
  },
};

interface Props {
  model: Model;
  onBack: () => void;
  onNext: () => void;
}

export function LoadModel({ model, onBack, onNext }: Props) {
  const t = T[useLang()];
  const repo = model.hfUrl.replace('https://huggingface.co/', '');

  return (
    <StepShell title={t.title(model.name)} lead={t.lead} onBack={onBack} onNext={onNext}>
      <Steps
        items={[
          <>
            <p>{t.copy}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <CopyButton text={model.hfUrl} label={t.copy} />
              <code className="min-w-0 text-sm break-all text-muted">{model.hfUrl}</code>
            </div>
          </>,
          <>
            <p>{t.paste}</p>
            <div className="mt-3">
              <ScreenshotSlot caption={t.pasteShot} />
            </div>
          </>,
          <>
            <p>{t.pick}</p>
            <p className="text-muted">
              {t.q4(model.fileGB, downloadMinutes(model.fileGB, 100), downloadMinutes(model.fileGB, 30))}
            </p>
          </>,
          <>
            <p>{t.load}</p>
            <div className="mt-3">
              <ScreenshotSlot caption={t.loadShot} />
            </div>
          </>,
        ]}
      />

      <Warn>
        <p className="font-semibold">{t.ctxTitle}</p>
        <p className="mt-1 text-muted">{t.ctxBody}</p>
      </Warn>

      {model.tier === 'strong' && (
        <Warn>
          <p className="font-semibold">{t.bigTitle}</p>
          <p className="mt-1 text-muted">{t.bigBody}</p>
        </Warn>
      )}

      <Trouble items={t.trouble(repo)} />
    </StepShell>
  );
}
