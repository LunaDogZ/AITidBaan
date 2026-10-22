import { describe, expect, it } from 'vitest';
import { parseProgress, resumeLink, type Progress } from './progress';

const saved: Progress = { answers: { ram: 16, gpu: 'none', tasks: ['summary'] }, step: 4, done: false };

describe('parseProgress', () => {
  it('อ่านค่าที่บันทึกไว้กลับมาได้ครบ', () => {
    expect(parseProgress(JSON.stringify(saved))).toEqual(saved);
  });

  it('ไม่มีค่า หรือ JSON เสีย ได้ null', () => {
    expect(parseProgress(null)).toBeNull();
    expect(parseProgress('{oops')).toBeNull();
    expect(parseProgress('"text"')).toBeNull();
  });

  it('ขั้นนอกช่วง 1-6 ได้ null', () => {
    expect(parseProgress(JSON.stringify({ ...saved, step: 7 }))).toBeNull();
    expect(parseProgress(JSON.stringify({ ...saved, step: 2.5 }))).toBeNull();
  });

  it('ค่าคำตอบที่ไม่รู้จัก (เช่นจากเวอร์ชันเก่า) ถูกตัดทิ้ง แต่ขั้นยังอยู่', () => {
    const raw = JSON.stringify({ answers: { ram: 64, gpu: 'amd', vram: 6, tasks: ['summary', 'poem'] }, step: 3, done: false });
    expect(parseProgress(raw)).toEqual({ answers: { vram: 6, tasks: ['summary'] }, step: 3, done: false });
  });
});

describe('resumeLink', () => {
  it('ทำถึงขั้น 2 ขึ้นไป ได้ลิงก์ทำต่อพร้อมเลขขั้น', () => {
    expect(resumeLink(saved, 'th')).toEqual({ href: '/wizard#step-4', label: 'ทำต่อจากขั้น ④' });
  });

  it('ทำเสร็จแล้ว ได้ลิงก์ไปดูการติดตั้ง', () => {
    expect(resumeLink({ ...saved, step: 6, done: true }, 'th')).toEqual({ href: '/wizard', label: 'ดูการติดตั้งของฉัน' });
  });

  it('ภาษาอังกฤษ ลิงก์อยู่ใต้ /en/', () => {
    expect(resumeLink(saved, 'en')).toEqual({ href: '/en/wizard#step-4', label: 'Continue from step ④' });
    expect(resumeLink({ ...saved, done: true }, 'en')?.href).toBe('/en/wizard');
  });

  it('ยังอยู่ขั้นแรก หรือไม่มีค่า ไม่ต้องเปลี่ยนปุ่ม', () => {
    expect(resumeLink({ ...saved, step: 1 }, 'th')).toBeNull();
    expect(resumeLink(null, 'th')).toBeNull();
  });
});
