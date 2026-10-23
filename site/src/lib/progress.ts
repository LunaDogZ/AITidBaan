import { recommend, type Gpu, type Ram, type Task, type Vram } from './recommend';
import { href, type Lang } from '../i18n';
import { MODELS } from '../data/models';
import { toMachine } from '../components/wizard/answers';

// ความคืบหน้าของวิซาร์ดที่จำไว้ใน localStorage ของผู้ใช้ (PRD ข้อ 4) ไม่ได้ส่งออกนอกเครื่อง
export interface Progress {
  answers: { ram?: Ram; gpu?: Gpu; vram?: Vram; tasks: Task[] };
  step: number;
  // id ของโมเดลที่ทำครบขั้น ⑥ ถ้าคำตอบเปลี่ยนจนได้โมเดลอื่น ถือว่ายังไม่เสร็จ (ดู isDone)
  doneModel?: string;
}

const KEY = 'aitidbaan:wizard';
const RAMS: unknown[] = [4, 8, 16, 32, 'unsure'];
const GPUS: unknown[] = ['nvidia', 'none', 'unsure'];
const VRAMS: unknown[] = [4, 6, 8, 12, 'unsure'];
const TASKS: unknown[] = ['summary', 'formal', 'spelling', 'extraction', 'translation', 'minutes'];
const CIRCLED = '①②③④⑤⑥';

// ค่าที่อ่านมาอาจเสียหรือมาจากเว็บเวอร์ชันเก่า คำตอบที่ไม่รู้จักให้ตัดทิ้ง ผู้ใช้แค่ต้องตอบข้อนั้นใหม่
export function parseProgress(raw: string | null): Progress | null {
  let v: any;
  try {
    v = JSON.parse(raw ?? '');
  } catch {
    return null;
  }
  if (typeof v !== 'object' || v === null) return null;
  if (!Number.isInteger(v.step) || v.step < 1 || v.step > 6) return null;
  const a = v.answers ?? {};
  const answers: Progress['answers'] = {
    tasks: Array.isArray(a.tasks) ? a.tasks.filter((t: unknown) => TASKS.includes(t)) : [],
  };
  if (RAMS.includes(a.ram)) answers.ram = a.ram;
  if (GPUS.includes(a.gpu)) answers.gpu = a.gpu;
  if (VRAMS.includes(a.vram)) answers.vram = a.vram;
  const p: Progress = { answers, step: v.step };
  // รูปแบบเก่าเก็บ done: true ถือว่าเสร็จกับโมเดลที่แนะนำจากคำตอบที่บันทึกไว้ตอนนั้น
  const doneModel = typeof v.doneModel === 'string' ? v.doneModel : v.done === true ? recommendedId(answers) : undefined;
  if (doneModel) p.doneModel = doneModel;
  return p;
}

export function recommendedId(answers: Progress['answers']): string | undefined {
  const machine = toMachine(answers);
  return machine ? recommend(machine, answers.tasks, MODELS)?.id : undefined;
}

// ขั้นไกลสุดที่คำตอบนี้ไปถึงได้: ตอบไม่ครบอยู่ขั้น ① ไม่มีโมเดลแนะนำ (RAM 4GB) อยู่ขั้น ② ที่เหลือไปได้ถึง ⑥
export function maxStep(answers: Progress['answers']): number {
  if (!toMachine(answers) || answers.tasks.length === 0) return 1;
  return recommendedId(answers) ? 6 : 2;
}

// ขั้นที่บันทึกไว้อาจเกินที่คำตอบไปถึงได้ (ข้อมูลเสียหรือมาจากเวอร์ชันเก่า) ใช้ขั้นที่ไปได้จริง
export function reachableStep(p: Progress): number {
  return Math.min(p.step, maxStep(p.answers));
}

// เสร็จก็ต่อเมื่อโมเดลที่ทำครบตรงกับโมเดลที่แนะนำจากคำตอบตอนนี้ คำตอบที่ไม่มีโมเดลแนะนำ (RAM 4GB) ไม่มีวันเสร็จ
export function isDone(p: Progress): boolean {
  return p.doneModel !== undefined && p.doneModel === recommendedId(p.answers);
}

const RESUME_LABEL = {
  th: { done: 'ดูการติดตั้งของฉัน', step: (n: string) => `ทำต่อจากขั้น ${n}` },
  en: { done: 'View my setup', step: (n: string) => `Continue from step ${n}` },
};

export function resumeLink(p: Progress | null, lang: Lang): { href: string; label: string } | null {
  if (!p) return null;
  const t = RESUME_LABEL[lang];
  if (isDone(p)) return { href: href(lang, '/wizard'), label: t.done };
  const step = reachableStep(p);
  if (step < 2) return null;
  return { href: href(lang, `/wizard#step-${step}`), label: t.step(CIRCLED[step - 1]) };
}

// localStorage อาจใช้ไม่ได้ (โหมดไม่ระบุตัวตนบางแบบ หรือปิด cookie) ให้เว็บทำงานต่อได้เหมือนไม่มีค่าที่จำไว้
export function loadProgress(): Progress | null {
  try {
    return parseProgress(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
