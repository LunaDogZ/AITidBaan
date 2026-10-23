import type { Model } from '../../data/models';
import { downloadMinutes } from '../../lib/install';
import { CopyButton, Key, Screenshot, StepShell, Steps, Trouble, Warn } from './ui';
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
    paste: <>ใน LM Studio กด Model Search แล้ววางลิงก์ด้วย {pasteKeys}</>,
    pick: 'เช็กว่าเป็น Q4_K_M แล้วกด Download',
    notQ4: 'ถ้าไม่ใช่ กดลูกศรตรงชื่อไฟล์แล้วเลือก Q4_K_M',
    sample: 'ภาพตัวอย่างจาก OpenThaiGPT ชื่อและขนาดไฟล์ของคุณจะต่างไป',
    q4: (fileGB: number, fast: number, slow: number) =>
      `Q4_K_M คือแบบที่บีบให้เล็กลงจนเปิดบนโน้ตบุ๊กได้ แต่ยังตอบได้ดี ไฟล์ ${fileGB} GB ใช้เวลาประมาณ ${fast}-${slow} นาที`,
    close: 'รอจนปุ่มขึ้นว่า Use in New Chat แล้วกดกากบาทปิดหน้าต่าง',
    newChat: 'กด New chat',
    choose: 'กด Pick a model แล้วเลือกโมเดลที่โหลดมา',
    context: 'ตั้งความยาวบริบท (Context Length) เป็น 8192 แล้วกดโหลดโมเดล',
    contextWhy: 'ตั้งทุกครั้งที่โหลด ถ้าน้อยกว่านี้ เอกสารแค่ 1-2 หน้าก็ล้น',
    bigTitle: 'ปิดเบราว์เซอร์ก่อนใช้โมเดลตัวนี้',
    bigBody: 'โมเดลตัวใหญ่ใช้หน่วยความจำมาก ถ้าเปิด Chrome หรือ Firefox ค้างไว้ด้วย เครื่องอาจช้าจนแทบขยับไม่ได้',
    trouble: (repo: string) => [
      {
        symptom: 'วางลิงก์แล้วไม่เจอโมเดล',
        fix: (
          <>
            พิมพ์ชื่อ <code className="break-all">{repo}</code> ในช่องค้นหาของ Model Search แทน
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
    paste: <>In LM Studio, click Model Search and paste the link with {pasteKeys}.</>,
    pick: 'Check it says Q4_K_M, then click Download.',
    notQ4: 'If not, click the arrows next to the file name and pick Q4_K_M.',
    sample: 'Example showing OpenThaiGPT. Your model name and file size will differ.',
    q4: (fileGB: number, fast: number, slow: number) =>
      `Q4_K_M is a version compressed enough to run on a laptop while still answering well. The ${fileGB} GB file takes about ${fast}-${slow} minutes.`,
    close: 'Wait until the button says Use in New Chat, then close the window with the X.',
    newChat: 'Click New chat.',
    choose: 'Click Pick a model and choose the model you downloaded.',
    context: 'Set Context Length to 8192 and click Load Model.',
    contextWhy: 'Do this every time. Any lower and even 1-2 pages of text overflow.',
    bigTitle: 'Close your browser before using this model',
    bigBody: 'Large models use a lot of memory. With Chrome or Firefox open too, the computer can slow to a crawl.',
    trouble: (repo: string) => [
      {
        symptom: 'Pasting the link finds nothing',
        fix: (
          <>
            Type <code className="break-all">{repo}</code> into the Model Search box instead.
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

const SHOT_MODEL_ID = 'openthaigpt-1.5-7b';

const shot = (name: string, width: number, height: number, alt: string) => (
  <div className="mt-3">
    <Screenshot src={`/screens/load-model/${name}.jpeg`} width={width} height={height} alt={alt} />
  </div>
);

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
            {shot('search', 302, 417, 'Model Search')}
          </>,
          <>
            <p>{t.pick}</p>
            <p className="text-muted">{t.notQ4}</p>
            <p className="text-muted">
              {t.q4(model.fileGB, downloadMinutes(model.fileGB, 100), downloadMinutes(model.fileGB, 30))}
            </p>
            {shot('download', 1344, 765, t.pick)}
            {/* ภาพทุกขั้นแคปจาก OpenThaiGPT แต่ใช้ร่วมกับทุกโมเดล */}
            {model.id !== SHOT_MODEL_ID && <p className="mt-1 text-sm text-muted">{t.sample}</p>}
          </>,
          <>
            <p>{t.close}</p>
            {shot('done', 791, 192, 'Use in New Chat')}
            {shot('close', 1353, 777, t.close)}
          </>,
          <>
            <p>{t.newChat}</p>
            {shot('new-chat', 820, 300, t.newChat)}
          </>,
          <>
            <p>{t.choose}</p>
            {shot('pick', 520, 255, t.choose)}
          </>,
          <>
            <p>{t.context}</p>
            <p className="text-muted">{t.contextWhy}</p>
            {shot('context', 1013, 488, t.context)}
          </>,
        ]}
      />

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
