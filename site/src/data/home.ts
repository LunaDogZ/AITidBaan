import { CloudSlashIcon, QuestionIcon, TranslateIcon } from '@phosphor-icons/react/dist/ssr';

// เนื้อหาหน้าแรก
export const PROBLEMS = [
  {
    icon: CloudSlashIcon,
    title: 'เอกสารลับ ส่งขึ้น Cloud ไม่ได้',
    body: 'AI ออฟไลน์ประมวลผลบนเครื่องคุณ ลองตัดเน็ตแล้วใช้ดูได้เลย',
  },
  {
    icon: TranslateIcon,
    title: 'ศัพท์อย่าง 7B, Q4, VRAM อ่านแล้วงง',
    body: 'ตอบคำถามเป็นปุ่ม มีภาพสอนดูสเปกใน Windows ทุกขั้น',
  },
  {
    icon: QuestionIcon,
    title: 'ไม่รู้ว่าตัวไหนเก่งภาษาไทย',
    body: 'เราทดสอบกับงานเอกสารออฟฟิศภาษาไทยเอง และให้ดูคำตอบจริงทุกข้อ',
  },
];

export const STEPS = [
  { title: 'เช็กเครื่อง', body: 'ดู RAM และการ์ดจอใน Task Manager' },
  { title: 'รับคำแนะนำ', body: 'โมเดลเดียวที่เหมาะกับเครื่องและงานของคุณ' },
  { title: 'ติดตั้ง LM Studio', body: 'แอปฟรีสำหรับเปิดโมเดลบน Windows' },
  { title: 'โหลดโมเดล', body: 'คัดลอกลิงก์ไปวาง ไม่ต้องค้นเอง' },
  { title: 'ลองกับเอกสารของคุณ', body: 'วางข้อความจากไฟล์ Word แล้วถาม' },
  { title: 'ตัดเน็ตแล้วถามอีกครั้ง', body: 'พิสูจน์เองว่าทำงานออฟไลน์จริง' },
];
