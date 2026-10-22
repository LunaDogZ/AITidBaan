import { useState } from 'react';
import { ConfettiIcon } from '@phosphor-icons/react';
import { ScreenshotSlot, StepShell, Steps, Trouble } from './ui';

interface Props {
  onBack: () => void;
}

export function GoOffline({ onBack }: Props) {
  const [done, setDone] = useState(false);

  return (
    <StepShell
      title="ตัดเน็ตแล้วลองถามอีกครั้ง"
      lead="ขั้นนี้พิสูจน์ด้วยตาตัวเองว่า AI ประมวลผลบนเครื่องคุณ ไม่ได้ส่งเอกสารไปที่ไหน"
      onBack={onBack}
      onNext={done ? undefined : () => setDone(true)}
      nextLabel="AI ยังตอบได้"
    >
      <Steps
        items={[
          <>
            <p>ปิด Wi-Fi หรือถอดสาย LAN</p>
            <p className="text-muted">กดไอคอนเน็ตที่มุมขวาล่างของจอ แล้วกดปิด Wi-Fi หรือเปิดโหมดเครื่องบิน</p>
            <div className="mt-3">
              <ScreenshotSlot caption="แถบมุมขวาล่าง > ปิด Wi-Fi (Windows 11)" />
            </div>
          </>,
          <p>ลองเปิดเว็บไหนก็ได้ ให้แน่ใจว่าเข้าไม่ได้แล้ว</p>,
          <p>กลับไปที่ LM Studio แล้วถามอะไรก็ได้อีกครั้ง</p>,
        ]}
      />

      {done && (
        <div className="fade-in mt-8 rounded-2xl bg-good-soft p-6 text-center">
          <ConfettiIcon size={40} weight="duotone" className="mx-auto text-good" aria-hidden="true" />
          <p className="mt-3 text-2xl font-bold">เครื่องของคุณมี AI ออฟไลน์แล้ว</p>
          <p className="mx-auto mt-2 max-w-[48ch] text-muted">
            เปิด Wi-Fi กลับได้เลย ครั้งหน้าแค่เปิด LM Studio เลือกโมเดล แล้วถามได้ทันที ไม่ต้องโหลดอะไรอีก
          </p>
          <a href="/" className="mt-5 inline-block font-semibold text-accent underline underline-offset-4">
            กลับหน้าแรก
          </a>
        </div>
      )}

      <Trouble
        items={[
          {
            symptom: 'ตัดเน็ตแล้ว AI ไม่ตอบ',
            fix: 'เช็กว่าแถบด้านบนของแชทยังมีโมเดลที่โหลดไว้อยู่ ถ้าไม่มี ให้เลือกโมเดลใหม่ (ไม่ต้องใช้เน็ต) แล้วตั้ง Context Length 8192 เหมือนเดิม',
          },
          {
            symptom: 'เปิด LM Studio ตอนต่อเน็ตแล้วแอปเช็กอัปเดต',
            fix: 'เป็นเรื่องปกติ ตอนเช็กอัปเดตแอปส่งแค่เวอร์ชันแอป ระบบปฏิบัติการ และ IP ไม่ได้ส่งแชทหรือเอกสารของคุณ',
          },
          {
            symptom: 'เห็นฟีเจอร์ค้นเว็บหรือโมเดลบนคลาวด์ในแอป',
            fix: 'ไม่ต้องเปิดใช้ ฟีเจอร์พวกนี้ต้องจ่ายเงินและจะส่งข้อมูลออกไปนอกเครื่อง',
          },
        ]}
      />
    </StepShell>
  );
}
