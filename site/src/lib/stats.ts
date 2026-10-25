import type { Lang } from '../i18n';

// นับว่าแต่ละขั้นของวิซาร์ดถูกเปิดกี่ครั้ง (ดู docs/stats.md) ส่งแค่เลขขั้นกับภาษา ไม่มีอะไรระบุตัวคน
export type StatStep = 1 | 2 | 3 | 4 | 5 | 6 | 'done';

// จำว่าเครื่องนี้ส่งขั้นไหนไปแล้ว รีโหลดหรือย้อนกลับมาจะได้ไม่นับซ้ำ
const KEY = 'aitidbaan:stats-sent';

// localStorage ใช้ไม่ได้ให้คืน null แล้วไม่ส่ง เพราะจำไม่ได้ว่าส่งแล้ว จะนับซ้ำทุกครั้งที่เปิดขั้น
function sentSteps(): StatStep[] | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return null;
  }
}

// ส่งไม่ได้ก็ไม่เป็นไร ตัวเลขเป็นค่าประมาณอยู่แล้ว ห้ามทำให้วิซาร์ดพัง
export function trackStep(step: StatStep, lang: Lang): void {
  // ตอนพัฒนาและตอนรันเทสต์ไม่ส่ง ตัวเลขจะได้มีแค่คนใช้จริง
  if (import.meta.env.DEV) return;
  const sent = sentSteps();
  if (!sent || sent.includes(step)) return;
  // ใช้ fetch แทน sendBeacon เพื่อรู้ว่า server บันทึกได้จริง (เช่นยังไม่ได้ผูก D1) ถ้าไม่ได้ ครั้งหน้าจะส่งใหม่
  // keepalive ให้ส่งต่อได้แม้ผู้ใช้ปิดหน้าไปก่อน
  fetch('/api/step', { method: 'POST', body: JSON.stringify({ step, lang }), keepalive: true })
    .then((res) => {
      if (res.ok) localStorage.setItem(KEY, JSON.stringify([...(sentSteps() ?? []), step]));
    })
    .catch(() => {});
}
