// เนื้อหาหน้าแรก
// tone/tilt ใช้สีกระดาษโน้ตเดียวกับบอร์ดปัญหาด้านบน
import type { Lang } from '../i18n';

const NOTE_LOOK = [
  { tone: 'var(--note-green)', tilt: -1.5 },
  { tone: 'var(--note-purple)', tilt: 1 },
  { tone: 'var(--note-yellow)', tilt: -1 },
];

const PROBLEM_TEXT: Record<Lang, { title: string; body: string }[]> = {
  th: [
    { title: 'เอกสารลับ ส่งขึ้น Cloud ไม่ได้', body: 'AI ออฟไลน์ประมวลผลบนเครื่องคุณ ลองตัดเน็ตแล้วใช้ดูได้เลย' },
    { title: 'ศัพท์อย่าง 7B, Q4, VRAM อ่านแล้วงง', body: 'ตอบคำถามเป็นปุ่ม มีภาพสอนดู RAM และการ์ดจอใน Windows' },
    { title: 'ไม่รู้ว่าตัวไหนเก่งภาษาไทย', body: 'เราทดสอบเองกับเอกสารภาษาไทยที่สร้างขึ้นเพื่อทดสอบ และให้ดูตัวอย่างคำตอบของแต่ละงาน' },
  ],
  en: [
    {
      title: "Confidential files can't go to the cloud",
      body: 'Offline AI runs on your own computer. Turn off the internet and try it yourself.',
    },
    {
      title: 'Terms like 7B, Q4 and VRAM are confusing',
      body: 'Answer with buttons, with pictures showing where to find your RAM and graphics card in Windows.',
    },
    {
      title: "No idea which model is good at Thai",
      body: 'We tested them ourselves on Thai documents written for the test, and you can read sample answers for each task.',
    },
  ],
};

const withLook = (items: { title: string; body: string }[]) => items.map((p, i) => ({ ...NOTE_LOOK[i], ...p }));
export const PROBLEMS = { th: withLook(PROBLEM_TEXT.th), en: withLook(PROBLEM_TEXT.en) };

export const STEPS: Record<Lang, { title: string; body: string }[]> = {
  th: [
    { title: 'เช็กเครื่อง', body: 'ดู RAM และการ์ดจอใน Task Manager' },
    { title: 'รับคำแนะนำ', body: 'โมเดลเดียวที่เหมาะกับเครื่องและงานของคุณ' },
    { title: 'ติดตั้ง LM Studio', body: 'แอปฟรีสำหรับเปิดโมเดลบน Windows' },
    { title: 'โหลดโมเดล', body: 'คัดลอกลิงก์ไปวาง ไม่ต้องค้นเอง' },
    { title: 'ลองกับเอกสารของคุณ', body: 'วางข้อความจากไฟล์ Word แล้วถาม' },
    { title: 'ตัดเน็ตแล้วถามอีกครั้ง', body: 'พิสูจน์เองว่าทำงานออฟไลน์จริง' },
  ],
  en: [
    { title: 'Check your computer', body: 'Find your RAM and graphics card in Task Manager' },
    { title: 'Get a recommendation', body: 'One model that fits your computer and your work' },
    { title: 'Install LM Studio', body: 'A free app for running models on Windows' },
    { title: 'Download the model', body: 'Copy and paste a link, no searching needed' },
    { title: 'Try it on your documents', body: 'Paste text from a Word file and ask' },
    { title: 'Go offline and ask again', body: 'See for yourself that it really works offline' },
  ],
};
