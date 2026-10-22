import type { RatedModel, Task } from '../lib/recommend';
import type { Lang } from '../i18n';

// ผลประเมิน (ratings) และความเร็วในไฟล์นี้เป็นข้อมูลตัวอย่างสำหรับ prototype
// จนกว่าผู้ให้คะแนนจะส่งผลจริงและมี scripts/export_site_data.py (PRD ข้อ 9)
export const SAMPLE_DATA = true;
export const TEST_DATE: Record<Lang, string> = { th: '19-20 ต.ค. 2569', en: '19-20 Oct 2026' };

export interface Model extends RatedModel {
  rawId: string; // โฟลเดอร์ใน results/raw/
  name: string;
  blurb: Record<Lang, string>;
  fileGB: number;
  tokPerSec: number;
  speedKind: 'estimate' | 'measured';
  hfUrl: string; // ลิงก์ GGUF ที่ให้ผู้ใช้วางในช่องค้นหาของ LM Studio (ใช้ไฟล์ Q4_K_M)
}

export const SPEED_KIND: Record<Lang, Record<Model['speedKind'], string>> = {
  th: { estimate: 'ค่าประมาณ', measured: 'ผลวัด' },
  en: { estimate: 'estimated', measured: 'measured' },
};

// เอกสารทดสอบเป็นภาษาไทยทั้งหมด ฉบับอังกฤษจึงบอกว่าเป็นงานภาษาไทย
export const TASKS: Record<Lang, { id: Task; label: string; hint: string }[]> = {
  th: [
    { id: 'summary', label: 'สรุปเอกสาร', hint: 'TOR, ประกาศ HR, รายงานยาว' },
    { id: 'formal', label: 'ปรับเป็นภาษาทางการ', hint: 'แชท LINE เป็นอีเมลลูกค้า' },
    { id: 'spelling', label: 'ตรวจคำผิด', hint: 'อนุญาติ, ศรีษะ, ลายเซ็นต์' },
    { id: 'extraction', label: 'ดึงข้อมูลจากเอกสาร', hint: 'งบประมาณ, กำหนดส่ง, ค่าปรับ' },
    { id: 'translation', label: 'แปลไทย-อังกฤษ', hint: 'อีเมลลูกค้าต่างชาติ' },
    { id: 'minutes', label: 'จัดรายงานการประชุม', hint: 'โน้ตดิบเป็นวาระและมติ' },
  ],
  en: [
    { id: 'summary', label: 'Summarize documents', hint: 'TORs, HR notices, long reports' },
    { id: 'formal', label: 'Rewrite formally', hint: 'LINE chats into client emails' },
    { id: 'spelling', label: 'Check Thai spelling', hint: 'อนุญาติ, ศรีษะ, ลายเซ็นต์' },
    { id: 'extraction', label: 'Extract data', hint: 'Budgets, deadlines, penalties' },
    { id: 'translation', label: 'Translate Thai-English', hint: 'Emails with foreign clients' },
    { id: 'minutes', label: 'Write meeting minutes', hint: 'Raw notes into agenda and resolutions' },
  ],
};

const r = (good: number, minor: number, bad: number) => ({ good, minor, bad });

export const MODELS: Model[] = [
  {
    id: 'typhoon-2.5-4b',
    rawId: 'typhoon2.5-qwen3-4b',
    hfUrl: 'https://huggingface.co/mradermacher/typhoon2.5-qwen3-4b-GGUF',
    name: 'Typhoon 2.5 4B',
    tier: 'small',
    blurb: {
      th: 'โมเดลที่ฝึกภาษาไทยโดยเฉพาะ ตัวเล็ก เปิดบนโน้ตบุ๊กทั่วไปได้',
      en: 'A small model trained specifically for Thai. Runs on an ordinary laptop.',
    },
    fileGB: 2.5,
    tokPerSec: 8,
    speedKind: 'estimate',
    ratings: { summary: r(2, 2, 1), formal: r(3, 2, 0), spelling: r(1, 2, 2), extraction: r(2, 1, 2), translation: r(3, 2, 1), minutes: r(2, 2, 1) },
  },
  {
    id: 'gemma-4-e4b',
    rawId: 'gemma-4-e4b-it',
    hfUrl: 'https://huggingface.co/lmstudio-community/gemma-4-E4B-it-GGUF',
    name: 'Gemma 4 E4B',
    tier: 'small',
    blurb: {
      th: 'โมเดลทั่วไปจาก Google ที่อ่านเขียนภาษาไทยได้ดี',
      en: 'A general model from Google that reads and writes Thai well.',
    },
    fileGB: 5.34,
    tokPerSec: 6.9,
    speedKind: 'measured',
    ratings: { summary: r(3, 2, 0), formal: r(4, 1, 0), spelling: r(4, 1, 0), extraction: r(3, 1, 1), translation: r(5, 1, 0), minutes: r(3, 2, 0) },
  },
  {
    id: 'openthaigpt-1.5-7b',
    rawId: 'openthaigpt1.5-7b-instruct',
    hfUrl: 'https://huggingface.co/openthaigpt/openthaigpt1.5-7b-instruct-GGUF',
    name: 'OpenThaiGPT 1.5 7B',
    tier: 'medium',
    blurb: {
      th: 'โมเดลภาษาไทยขนาดกลาง เหมาะกับเครื่อง RAM 16GB',
      en: 'A mid-size Thai model, a good fit for 16GB of RAM.',
    },
    fileGB: 4.68,
    tokPerSec: 6,
    speedKind: 'estimate',
    ratings: { summary: r(3, 1, 1), formal: r(2, 2, 1), spelling: r(2, 2, 1), extraction: r(3, 1, 1), translation: r(3, 2, 1), minutes: r(2, 2, 1) },
  },
  {
    id: 'typhoon-2.1-12b',
    rawId: 'typhoon2.1-gemma3-12b',
    hfUrl: 'https://huggingface.co/typhoon-ai/typhoon2.1-gemma3-12b-gguf',
    name: 'Typhoon 2.1 Gemma3 12B',
    tier: 'strong',
    blurb: {
      th: 'โมเดลภาษาไทยตัวใหญ่ ต้องใช้การ์ดจอ NVIDIA 8GB ขึ้นไป',
      en: 'A large Thai model. Needs an NVIDIA graphics card with 8GB or more.',
    },
    fileGB: 7.3,
    tokPerSec: 20,
    speedKind: 'estimate',
    ratings: { summary: r(4, 1, 0), formal: r(5, 0, 0), spelling: r(3, 2, 0), extraction: r(4, 1, 0), translation: r(5, 1, 0), minutes: r(4, 1, 0) },
  },
  {
    id: 'qwen-3.5-9b',
    rawId: 'qwen3.5-9b',
    hfUrl: 'https://huggingface.co/lmstudio-community/Qwen3.5-9B-GGUF',
    name: 'Qwen3.5 9B',
    tier: 'strong',
    blurb: {
      th: 'โมเดลทั่วไปที่เก่งงานดึงข้อมูล แต่บางครั้งมีคำจีนแทรก',
      en: 'A general model that is strong at extracting data, but sometimes slips in Chinese words.',
    },
    fileGB: 5.63,
    tokPerSec: 25,
    speedKind: 'estimate',
    ratings: { summary: r(3, 2, 0), formal: r(3, 1, 1), spelling: r(3, 1, 1), extraction: r(4, 1, 0), translation: r(4, 1, 1), minutes: r(3, 1, 1) },
  },
];

export const TIER_LABEL = {
  th: { notEnough: 'ยังไม่พอ', small: 'เครื่องเล็ก', medium: 'เครื่องกลาง', strong: 'เครื่องแรง' },
  en: { notEnough: 'Not enough', small: 'Light machine', medium: 'Mid-range machine', strong: 'Powerful machine' },
} as const;
