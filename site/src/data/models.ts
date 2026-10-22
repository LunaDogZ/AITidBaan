import type { RatedModel, Task } from '../lib/recommend';

// ผลประเมิน (ratings) และความเร็วในไฟล์นี้เป็นข้อมูลตัวอย่างสำหรับ prototype
// จนกว่าผู้ให้คะแนนจะส่งผลจริงและมี scripts/export_site_data.py (PRD ข้อ 9)
export const SAMPLE_DATA = true;
export const TEST_DATE = '19-20 ต.ค. 2569';

export interface Model extends RatedModel {
  rawId: string; // โฟลเดอร์ใน results/raw/
  name: string;
  blurb: string;
  fileGB: number;
  tokPerSec: number;
  speedKind: 'ค่าประมาณ' | 'ผลวัด';
  hfUrl: string; // ลิงก์ GGUF ที่ให้ผู้ใช้วางในช่องค้นหาของ LM Studio (ใช้ไฟล์ Q4_K_M)
}

export const TASKS: { id: Task; label: string; hint: string }[] = [
  { id: 'summary', label: 'สรุปเอกสาร', hint: 'TOR, ประกาศ HR, รายงานยาว' },
  { id: 'formal', label: 'ปรับเป็นภาษาทางการ', hint: 'แชท LINE เป็นอีเมลลูกค้า' },
  { id: 'spelling', label: 'ตรวจคำผิด', hint: 'อนุญาติ, ศรีษะ, ลายเซ็นต์' },
  { id: 'extraction', label: 'ดึงข้อมูลจากเอกสาร', hint: 'งบประมาณ, กำหนดส่ง, ค่าปรับ' },
  { id: 'translation', label: 'แปลไทย-อังกฤษ', hint: 'อีเมลลูกค้าต่างชาติ' },
  { id: 'minutes', label: 'จัดรายงานการประชุม', hint: 'โน้ตดิบเป็นวาระและมติ' },
];

const r = (good: number, minor: number, bad: number) => ({ good, minor, bad });

export const MODELS: Model[] = [
  {
    id: 'typhoon-2.5-4b',
    rawId: 'typhoon2.5-qwen3-4b',
    hfUrl: 'https://huggingface.co/mradermacher/typhoon2.5-qwen3-4b-GGUF',
    name: 'Typhoon 2.5 4B',
    tier: 'small',
    blurb: 'โมเดลที่ฝึกภาษาไทยโดยเฉพาะ ตัวเล็ก เปิดบนโน้ตบุ๊กทั่วไปได้',
    fileGB: 2.5,
    tokPerSec: 8,
    speedKind: 'ค่าประมาณ',
    ratings: { summary: r(2, 2, 1), formal: r(3, 2, 0), spelling: r(1, 2, 2), extraction: r(2, 1, 2), translation: r(3, 2, 1), minutes: r(2, 2, 1) },
  },
  {
    id: 'gemma-4-e4b',
    rawId: 'gemma-4-e4b-it',
    hfUrl: 'https://huggingface.co/lmstudio-community/gemma-4-E4B-it-GGUF',
    name: 'Gemma 4 E4B',
    tier: 'small',
    blurb: 'โมเดลทั่วไปจาก Google ที่อ่านเขียนภาษาไทยได้ดี',
    fileGB: 5.34,
    tokPerSec: 6.9,
    speedKind: 'ผลวัด',
    ratings: { summary: r(3, 2, 0), formal: r(4, 1, 0), spelling: r(4, 1, 0), extraction: r(3, 1, 1), translation: r(5, 1, 0), minutes: r(3, 2, 0) },
  },
  {
    id: 'openthaigpt-1.5-7b',
    rawId: 'openthaigpt1.5-7b-instruct',
    hfUrl: 'https://huggingface.co/openthaigpt/openthaigpt1.5-7b-instruct-GGUF',
    name: 'OpenThaiGPT 1.5 7B',
    tier: 'medium',
    blurb: 'โมเดลภาษาไทยขนาดกลาง เหมาะกับเครื่อง RAM 16GB',
    fileGB: 4.68,
    tokPerSec: 6,
    speedKind: 'ค่าประมาณ',
    ratings: { summary: r(3, 1, 1), formal: r(2, 2, 1), spelling: r(2, 2, 1), extraction: r(3, 1, 1), translation: r(3, 2, 1), minutes: r(2, 2, 1) },
  },
  {
    id: 'typhoon-2.1-12b',
    rawId: 'typhoon2.1-gemma3-12b',
    hfUrl: 'https://huggingface.co/typhoon-ai/typhoon2.1-gemma3-12b-gguf',
    name: 'Typhoon 2.1 Gemma3 12B',
    tier: 'strong',
    blurb: 'โมเดลภาษาไทยตัวใหญ่ ต้องใช้การ์ดจอ NVIDIA 8GB ขึ้นไป',
    fileGB: 7.3,
    tokPerSec: 20,
    speedKind: 'ค่าประมาณ',
    ratings: { summary: r(4, 1, 0), formal: r(5, 0, 0), spelling: r(3, 2, 0), extraction: r(4, 1, 0), translation: r(5, 1, 0), minutes: r(4, 1, 0) },
  },
  {
    id: 'qwen-3.5-9b',
    rawId: 'qwen3.5-9b',
    hfUrl: 'https://huggingface.co/lmstudio-community/Qwen3.5-9B-GGUF',
    name: 'Qwen3.5 9B',
    tier: 'strong',
    blurb: 'โมเดลทั่วไปที่เก่งงานดึงข้อมูล แต่บางครั้งมีคำจีนแทรก',
    fileGB: 5.63,
    tokPerSec: 25,
    speedKind: 'ค่าประมาณ',
    ratings: { summary: r(3, 2, 0), formal: r(3, 1, 1), spelling: r(3, 1, 1), extraction: r(4, 1, 0), translation: r(4, 1, 1), minutes: r(3, 1, 1) },
  },
];

export const TIER_LABEL = {
  notEnough: 'ยังไม่พอ',
  small: 'เครื่องเล็ก',
  medium: 'เครื่องกลาง',
  strong: 'เครื่องแรง',
} as const;
