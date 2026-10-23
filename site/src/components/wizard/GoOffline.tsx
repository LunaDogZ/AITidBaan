import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ConfettiIcon } from '@phosphor-icons/react';
import { href } from '../../i18n';
import { Screenshot, StepShell, Steps, Trouble } from './ui';
import { useLang } from './lang';

interface Props {
  done: boolean;
  onDone: () => void;
  onBack: () => void;
}

const T = {
  th: {
    title: 'ตัดเน็ตแล้วลองถามอีกครั้ง',
    lead: 'ขั้นนี้พิสูจน์ด้วยตาตัวเองว่า AI ประมวลผลบนเครื่องคุณ ไม่ได้ส่งเอกสารไปที่ไหน',
    stillWorks: 'AI ยังตอบได้',
    off: 'ปิด Wi-Fi หรือถอดสาย LAN',
    offHow: 'กดไอคอน Wi-Fi มุมขวาล่างของจอ แล้วกดปุ่ม Wi-Fi',
    before: 'กดตรงนี้',
    after: 'ปิดแล้ว ปุ่มเป็นสีเทา',
    check: 'ลองเปิดเว็บไหนก็ได้ ให้แน่ใจว่าเข้าไม่ได้แล้ว',
    ask: 'กลับไปที่ LM Studio แล้วถามอะไรก็ได้อีกครั้ง',
    doneTitle: 'เครื่องของคุณมี AI ออฟไลน์แล้ว',
    doneBody: 'เปิด Wi-Fi กลับได้เลย ครั้งหน้าแค่เปิด LM Studio เลือกโมเดล แล้วถามได้ทันที ไม่ต้องโหลดอะไรอีก',
    home: 'กลับหน้าแรก',
    trouble: [
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
    ],
  },
  en: {
    title: 'Go offline and ask again',
    lead: 'This step lets you see for yourself that the AI runs on your computer and sends your documents nowhere.',
    stillWorks: 'The AI still answers',
    off: 'Turn off Wi-Fi or unplug the network cable',
    offHow: 'Click the Wi-Fi icon in the bottom right of the screen, then click the Wi-Fi button.',
    before: 'Click here',
    after: 'Off: the button turns grey',
    check: 'Try opening any website to make sure it no longer loads.',
    ask: 'Go back to LM Studio and ask anything again.',
    doneTitle: 'Your computer now has offline AI',
    doneBody:
      'You can turn Wi-Fi back on. Next time, just open LM Studio, pick the model, and ask right away. Nothing more to download.',
    home: 'Back to home',
    trouble: [
      {
        symptom: 'The AI stops answering when offline',
        fix: 'Check that the bar at the top of the chat still shows a loaded model. If not, pick the model again (no internet needed) and set Context Length to 8192 as before.',
      },
      {
        symptom: 'LM Studio checks for updates when opened online',
        fix: 'That is normal. The update check only sends the app version, your operating system, and your IP address, not your chats or documents.',
      },
      {
        symptom: 'I see web search or cloud model features in the app',
        fix: 'No need to turn them on. Those features are paid and send data off your computer.',
      },
    ],
  },
};

// พลุยิงจากซ้ายและขวาสลับกันราว 3 วินาที (ไม่ยิงถ้าผู้ใช้ตั้งลดการเคลื่อนไหว)
// เก็บตัวจับเวลาไว้ เพื่อไม่ให้ยิงซ้อนเมื่อกดซ้ำ และหยุดได้เมื่อออกจากขั้นนี้
let timer: ReturnType<typeof setInterval> | undefined;

function stopFireworks() {
  clearInterval(timer);
  confetti.reset();
}

function fireworks() {
  stopFireworks();
  const end = Date.now() + 3000;
  timer = setInterval(() => {
    if (Date.now() > end) return clearInterval(timer);
    for (const x of [0.1 + Math.random() * 0.2, 0.7 + Math.random() * 0.2]) {
      confetti({
        particleCount: 40,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
        origin: { x, y: Math.random() * 0.3 + 0.1 },
        disableForReducedMotion: true,
      });
    }
  }, 250);
}

export function GoOffline({ done, onDone, onBack }: Props) {
  const lang = useLang();
  const t = T[lang];
  useEffect(() => stopFireworks, []);
  return (
    <StepShell
      title={t.title}
      lead={t.lead}
      onBack={onBack}
      onNext={
        done
          ? undefined
          : () => {
              fireworks();
              onDone();
            }
      }
      nextLabel={t.stillWorks}
    >
      <Steps
        items={[
          <>
            <p>{t.off}</p>
            <p className="text-muted">{t.offHow}</p>
            {/* ก่อนและหลังปิดวางคู่กัน ให้เทียบเองว่าปิดสำเร็จ */}
            <div className="mt-3 grid max-w-xl grid-cols-2 gap-3">
              <figure>
                <Screenshot src="/screens/go-offline/wifi-on.jpeg" width={462} height={567} alt={t.offHow} />
                <figcaption className="mt-1 text-sm text-muted">{t.before}</figcaption>
              </figure>
              <figure>
                <Screenshot src="/screens/go-offline/wifi-off.jpeg" width={477} height={575} alt={t.after} />
                <figcaption className="mt-1 text-sm text-muted">{t.after}</figcaption>
              </figure>
            </div>
          </>,
          <p>{t.check}</p>,
          <p>{t.ask}</p>,
        ]}
      />

      {done && (
        <div className="fade-in mt-8 rounded-2xl bg-good-soft p-6 text-center">
          <ConfettiIcon size={40} weight="duotone" className="mx-auto text-good" aria-hidden="true" />
          <p className="mt-3 text-2xl font-bold">{t.doneTitle}</p>
          <p className="mx-auto mt-2 max-w-[48ch] text-muted">{t.doneBody}</p>
          <a href={href(lang, '/')} className="mt-5 inline-block font-semibold text-accent underline underline-offset-4">
            {t.home}
          </a>
        </div>
      )}

      <Trouble items={t.trouble} />
    </StepShell>
  );
}
