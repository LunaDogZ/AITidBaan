import type { Model } from '../../data/models';
import { downloadMinutes } from '../../lib/install';
import { CopyButton, Key, ScreenshotSlot, StepShell, Steps, Trouble, Warn } from './ui';

interface Props {
  model: Model;
  onBack: () => void;
  onNext: () => void;
}

export function LoadModel({ model, onBack, onNext }: Props) {
  const repo = model.hfUrl.replace('https://huggingface.co/', '');

  return (
    <StepShell
      title={`โหลด ${model.name} ลงเครื่อง`}
      lead="โหลดครั้งเดียว หลังจากนี้ใช้ได้โดยไม่ต้องต่อเน็ต"
      onBack={onBack}
      onNext={onNext}
    >
      <Steps
        items={[
          <>
            <p>คัดลอกลิงก์โมเดล</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <CopyButton text={model.hfUrl} label="คัดลอกลิงก์โมเดล" />
              <code className="min-w-0 text-sm break-all text-muted">{model.hfUrl}</code>
            </div>
          </>,
          <>
            <p>
              ใน LM Studio กดแท็บ Discover (รูปแว่นขยายแถบซ้าย) แล้ววางลิงก์ในช่องค้นหาด้วย <span className="whitespace-nowrap"><Key>Ctrl</Key> + <Key>V</Key></span>
            </p>
            <div className="mt-3">
              <ScreenshotSlot caption="LM Studio > Discover วางลิงก์ในช่องค้นหา" />
            </div>
          </>,
          <>
            <p>เลือกไฟล์ที่ชื่อมีคำว่า Q4_K_M แล้วกด Download</p>
            <p className="text-muted">
              Q4_K_M คือแบบที่บีบให้เล็กลงจนเปิดบนโน้ตบุ๊กได้ แต่ยังตอบได้ดี ไฟล์ {model.fileGB} GB ใช้เวลาประมาณ{' '}
              {downloadMinutes(model.fileGB, 100)}-{downloadMinutes(model.fileGB, 30)} นาที
            </p>
          </>,
          <>
            <p>โหลดเสร็จแล้ว กดเลือกโมเดลที่แถบด้านบนของหน้าแชท แล้วตั้ง Context Length ก่อนกดโหลด</p>
            <div className="mt-3">
              <ScreenshotSlot caption="LM Studio > เลือกโมเดล > ตั้ง Context Length เป็น 8192" />
            </div>
          </>,
        ]}
      />

      <Warn>
        <p className="font-semibold">ตั้ง Context Length เป็น 8192 ทุกครั้งที่โหลดโมเดล</p>
        <p className="mt-1 text-muted">
          Context Length คือความยาวที่ AI จำได้ในแชทหนึ่ง ถ้าน้อยไป เอกสารภาษาไทยแค่ 1-2 หน้าก็ล้น
          แล้ว AI จะอ่านแค่บางท่อน
        </p>
      </Warn>

      {model.tier === 'strong' && (
        <Warn>
          <p className="font-semibold">ปิดเบราว์เซอร์ก่อนใช้โมเดลตัวนี้</p>
          <p className="mt-1 text-muted">
            โมเดลตัวใหญ่ใช้หน่วยความจำมาก ถ้าเปิด Chrome หรือ Firefox ค้างไว้ด้วย เครื่องอาจช้าจนแทบขยับไม่ได้
          </p>
        </Warn>
      )}

      <Trouble
        items={[
          {
            symptom: 'วางลิงก์แล้วไม่เจอโมเดล',
            fix: (
              <>
                พิมพ์ชื่อ <code className="break-all">{repo}</code> ในช่องค้นหาของแท็บ Discover แทน
              </>
            ),
          },
          {
            symptom: 'โหลดค้างหรือหลุดกลางทาง',
            fix: 'เช็กเน็ตแล้วกดโหลดต่อในรายการดาวน์โหลดของ LM Studio ไม่ต้องเริ่มใหม่ทั้งหมด',
          },
          {
            symptom: 'LM Studio ไม่ยอมโหลดโมเดล บอกว่าใหญ่เกินเครื่อง',
            fix: 'ปิดโปรแกรมอื่นแล้วลองใหม่ ถ้ายังไม่ได้ กลับไปเช็กสเปกในขั้นแรกอีกครั้ง ไม่แนะนำให้บังคับโหลด เพราะเครื่องอาจค้าง',
          },
          {
            symptom: 'เห็นคำว่า GGUF ในชื่อไฟล์',
            fix: 'GGUF คือรูปแบบไฟล์โมเดลที่ LM Studio เปิดได้ ไม่ต้องทำอะไรเพิ่ม',
          },
        ]}
      />
    </StepShell>
  );
}
