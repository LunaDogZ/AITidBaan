import type { Gpu, Ram, Task, Vram } from './recommend';
import { href, type Lang } from '../i18n';

// ความคืบหน้าของวิซาร์ดที่จำไว้ใน localStorage ของผู้ใช้ (PRD ข้อ 4) ไม่ได้ส่งออกนอกเครื่อง
export interface Progress {
  answers: { ram?: Ram; gpu?: Gpu; vram?: Vram; tasks: Task[] };
  step: number;
  done: boolean;
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
  return { answers, step: v.step, done: v.done === true };
}

const RESUME_LABEL = {
  th: { done: 'ดูการติดตั้งของฉัน', step: (n: string) => `ทำต่อจากขั้น ${n}` },
  en: { done: 'View my setup', step: (n: string) => `Continue from step ${n}` },
};

export function resumeLink(p: Progress | null, lang: Lang): { href: string; label: string } | null {
  if (!p) return null;
  const t = RESUME_LABEL[lang];
  if (p.done) return { href: href(lang, '/wizard'), label: t.done };
  if (p.step < 2) return null;
  return { href: href(lang, `/wizard#step-${p.step}`), label: t.step(CIRCLED[p.step - 1]) };
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
