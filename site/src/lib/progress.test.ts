import { describe, expect, it, vi } from 'vitest';
import { isDone, parseProgress, resumeLink, type Progress } from './progress';

// ผลประเมินคงที่ เทสต์จะได้ไม่เปลี่ยนตามเมื่อผลจริงมาแทนข้อมูลตัวอย่าง
// RAM 8GB + สรุปเอกสาร → Typhoon 2.5 4B, RAM 16GB → OpenThaiGPT
vi.mock('../data/ratings.json', async () => ({ default: (await import('../test/ratings.fixture.json')).default }));

const saved: Progress = { answers: { ram: 16, gpu: 'none', tasks: ['summary'] }, step: 4 };
const small: Progress['answers'] = { ram: 8, gpu: 'none', tasks: ['summary'] };

describe('parseProgress', () => {
  it('อ่านค่าที่บันทึกไว้กลับมาได้ครบ', () => {
    expect(parseProgress(JSON.stringify(saved))).toEqual(saved);
    const done = { ...saved, step: 6, doneModel: 'openthaigpt-1.5-7b' };
    expect(parseProgress(JSON.stringify(done))).toEqual(done);
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
    const raw = JSON.stringify({ answers: { ram: 64, gpu: 'amd', vram: 6, tasks: ['summary', 'poem'] }, step: 3 });
    expect(parseProgress(raw)).toEqual({ answers: { vram: 6, tasks: ['summary'] }, step: 3 });
  });

  it('รูปแบบเก่า done: true แปลงเป็นโมเดลที่แนะนำจากคำตอบที่บันทึกไว้', () => {
    expect(parseProgress(JSON.stringify({ answers: small, step: 6, done: true }))?.doneModel).toBe('typhoon-2.5-4b');
    expect(parseProgress(JSON.stringify({ answers: small, step: 6, done: false }))?.doneModel).toBeUndefined();
  });

  it('รูปแบบเก่า done: true แต่คำตอบไม่ครบหรือไม่มีโมเดลแนะนำ ถือว่ายังไม่เสร็จ', () => {
    const noGpu = { answers: { ram: 8, tasks: ['summary'] }, step: 6, done: true };
    expect(parseProgress(JSON.stringify(noGpu))).toEqual({ answers: { ram: 8, tasks: ['summary'] }, step: 6 });
    const ram4 = { answers: { ...small, ram: 4 }, step: 2, done: true };
    expect(parseProgress(JSON.stringify(ram4))?.doneModel).toBeUndefined();
  });

  it('doneModel ที่ไม่ใช่ข้อความถูกตัดทิ้ง', () => {
    expect(parseProgress(JSON.stringify({ ...saved, doneModel: 42 }))).toEqual(saved);
  });
});

describe('isDone', () => {
  it('เสร็จเมื่อโมเดลที่ทำครบตรงกับโมเดลที่แนะนำจากคำตอบปัจจุบัน', () => {
    expect(isDone({ answers: small, step: 6, doneModel: 'typhoon-2.5-4b' })).toBe(true);
  });

  it('เปลี่ยนคำตอบจนได้โมเดลอื่น ไม่ถือว่าเสร็จ', () => {
    expect(isDone({ answers: { ...small, ram: 16 }, step: 6, doneModel: 'typhoon-2.5-4b' })).toBe(false);
  });

  it('คำตอบปัจจุบันไม่มีโมเดลแนะนำ (RAM 4GB) ไม่ถือว่าเสร็จ', () => {
    expect(isDone({ answers: { ...small, ram: 4 }, step: 2, doneModel: 'typhoon-2.5-4b' })).toBe(false);
  });
});

describe('resumeLink', () => {
  it('ทำถึงขั้น 2 ขึ้นไป ได้ลิงก์ทำต่อพร้อมเลขขั้น', () => {
    expect(resumeLink(saved, 'th')).toEqual({ href: '/wizard/#step-4', label: 'ทำต่อจากขั้น ④' });
  });

  it('ทำเสร็จแล้ว ได้ลิงก์ไปดูการติดตั้ง', () => {
    expect(resumeLink({ ...saved, step: 6, doneModel: 'openthaigpt-1.5-7b' }, 'th')).toEqual({
      href: '/wizard/',
      label: 'ดูการติดตั้งของฉัน',
    });
  });

  it('ทำเสร็จกับโมเดลอื่น ถือว่ายังไม่เสร็จ ได้ลิงก์ทำต่อ', () => {
    expect(resumeLink({ ...saved, step: 6, doneModel: 'typhoon-2.5-4b' }, 'th')?.label).toBe('ทำต่อจากขั้น ⑥');
  });

  it('ภาษาอังกฤษ ลิงก์อยู่ใต้ /en/', () => {
    expect(resumeLink(saved, 'en')).toEqual({ href: '/en/wizard/#step-4', label: 'Continue from step ④' });
    expect(resumeLink({ ...saved, doneModel: 'openthaigpt-1.5-7b' }, 'en')?.href).toBe('/en/wizard/');
  });

  it('ขั้นที่บันทึกไว้เกินกว่าที่คำตอบไปถึงได้ ลิงก์ชี้ขั้นที่ไปได้จริง', () => {
    // RAM 4GB ไม่มีโมเดลแนะนำ ไปได้ถึงขั้น ② เท่านั้น
    expect(resumeLink({ answers: { ...small, ram: 4 }, step: 5 }, 'th')).toEqual({
      href: '/wizard/#step-2',
      label: 'ทำต่อจากขั้น ②',
    });
    // คำตอบว่าง (ข้อมูลเสีย) อยู่ขั้น ① ไม่ต้องเปลี่ยนปุ่ม
    expect(resumeLink({ answers: { tasks: [] }, step: 6 }, 'th')).toBeNull();
  });

  it('ยังอยู่ขั้นแรก หรือไม่มีค่า ไม่ต้องเปลี่ยนปุ่ม', () => {
    expect(resumeLink({ ...saved, step: 1 }, 'th')).toBeNull();
    expect(resumeLink(null, 'th')).toBeNull();
  });
});
