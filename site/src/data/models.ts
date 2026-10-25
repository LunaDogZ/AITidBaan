import type { RatedModel, Task } from '../lib/recommend';
import type { Lang } from '../i18n';
import ratingsFile from './ratings.json';

// ผลประเมินอยู่ใน ratings.json ซึ่ง scripts/export_site_data.py เขียนทับเมื่อผู้ให้คะแนนส่งผลจริง (PRD ข้อ 9)
// ระหว่างรอยังเป็นข้อมูลตัวอย่าง ("sample": true)
const RATINGS = ratingsFile as { sample: boolean; models: Record<string, Pick<Model, 'ratings' | 'trapFail'>> };
export const SAMPLE_DATA = RATINGS.sample;
export const TEST_DATE: Record<Lang, string> = { th: '19-20 ต.ค. 2569', en: '19-20 Oct 2026' };

export interface Model extends RatedModel {
  rawId: string; // โฟลเดอร์ใน results/raw/
  name: string;
  blurb: Record<Lang, string>;
  fileGB: number;
  tokPerSec: number;
  speedKind: 'estimate' | 'measured';
  hfUrl: string; // ลิงก์ GGUF ที่ให้ผู้ใช้วางในช่องค้นหาของ LM Studio (ใช้ไฟล์ Q4_K_M)
  trapFail: boolean; // ได้ "ใช้ไม่ได้" ในข้อหลอก คือเคยแต่งข้อมูลที่ไม่มีในเอกสาร
  tightOnSmall?: boolean; // อยู่ระดับเครื่องเล็กแต่ใช้ RAM เกือบเต็มเครื่อง 8GB ต้องเตือนให้ปิดโปรแกรมอื่น
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

const MODEL_INFO: Omit<Model, 'ratings' | 'trapFail'>[] = [
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
  },
  {
    id: 'gemma-4-e4b',
    rawId: 'gemma-4-e4b-it',
    hfUrl: 'https://huggingface.co/lmstudio-community/gemma-4-E4B-it-GGUF',
    name: 'Gemma 4 E4B',
    // ไฟล์ 5.34GB ใช้ RAM จริง ~5.9GB รวม Windows เกินเครื่อง 8GB เล็กน้อย แต่ผลประเมินดีกว่า Typhoon 2.5 4B มาก
    // ผู้ใช้เลือกให้อยู่ระดับเล็กพร้อมคำเตือน (25 ต.ค. 2569)
    tier: 'small',
    tightOnSmall: true,
    blurb: {
      th: 'โมเดลทั่วไปจาก Google ที่อ่านเขียนภาษาไทยได้ดี',
      en: 'A general model from Google that reads and writes Thai well.',
    },
    fileGB: 5.34,
    tokPerSec: 6.9,
    speedKind: 'measured',
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
  },
  {
    id: 'typhoon-2.1-12b',
    rawId: 'typhoon2.1-gemma3-12b',
    hfUrl: 'https://huggingface.co/typhoon-ai/typhoon2.1-gemma3-12b-gguf',
    name: 'Typhoon 2.1 Gemma3 12B',
    tier: 'strong',
    blurb: {
      th: 'โมเดลภาษาไทยตัวใหญ่ ต้องใช้การ์ดจอแยก NVIDIA หรือ AMD 8GB ขึ้นไป',
      en: 'A large Thai model. Needs a separate NVIDIA or AMD graphics card with 8GB or more.',
    },
    fileGB: 7.3,
    tokPerSec: 20,
    speedKind: 'estimate',
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
  },
];

export const MODELS: Model[] = MODEL_INFO.map((m) => {
  const r = RATINGS.models[m.rawId];
  if (!r) throw new Error(`ratings.json ไม่มีผลประเมินของ ${m.rawId}`);
  return { ...m, ...r };
});

export const TIER_LABEL = {
  th: { notEnough: 'ยังไม่พอ', small: 'เครื่องเล็ก', medium: 'เครื่องกลาง', strong: 'เครื่องแรง' },
  en: { notEnough: 'Not enough', small: 'Light machine', medium: 'Mid-range machine', strong: 'Powerful machine' },
} as const;
