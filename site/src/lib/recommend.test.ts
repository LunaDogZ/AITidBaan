import { describe, expect, it } from 'vitest';
import { machineTier, recommend, unsureUpgrades } from './recommend';

describe('machineTier', () => {
  it('RAM 8GB ไม่มีการ์ดจอ NVIDIA = เครื่องเล็ก', () => {
    expect(machineTier({ ram: 8, gpu: 'none' })).toBe('small');
  });

  it('RAM 16GB ขึ้นไป ไม่มีการ์ดจอ NVIDIA = เครื่องกลาง', () => {
    expect(machineTier({ ram: 16, gpu: 'none' })).toBe('medium');
    expect(machineTier({ ram: 32, gpu: 'none' })).toBe('medium');
  });

  it('การ์ดจอ NVIDIA VRAM 8GB ขึ้นไป = เครื่องแรง', () => {
    expect(machineTier({ ram: 16, gpu: 'nvidia', vram: 8 })).toBe('strong');
    expect(machineTier({ ram: 32, gpu: 'nvidia', vram: 12 })).toBe('strong');
  });

  it('NVIDIA แต่ VRAM ต่ำกว่า 8GB ใช้ RAM ตัดสินเหมือนไม่มีการ์ด', () => {
    expect(machineTier({ ram: 16, gpu: 'nvidia', vram: 4 })).toBe('medium');
    expect(machineTier({ ram: 8, gpu: 'nvidia', vram: 6 })).toBe('small');
  });

  it('ไม่แน่ใจเรื่อง RAM ถือว่า 8GB (เครื่องเล็ก ไม่ใช่ทางตัน)', () => {
    expect(machineTier({ ram: 'unsure', gpu: 'none' })).toBe('small');
    expect(machineTier({ ram: 'unsure', gpu: 'nvidia', vram: 12 })).toBe('strong');
  });

  it('ไม่แน่ใจเรื่องการ์ดจอหรือ VRAM ถือว่าไม่มีการ์ดจอ NVIDIA', () => {
    expect(machineTier({ ram: 16, gpu: 'nvidia', vram: 'unsure' })).toBe('medium');
    expect(machineTier({ ram: 16, gpu: 'unsure' })).toBe('medium');
    expect(machineTier({ ram: 8, gpu: 'unsure' })).toBe('small');
  });

  it('RAM 4GB ยังไม่แนะนำ', () => {
    expect(machineTier({ ram: 4, gpu: 'none' })).toBe('notEnough');
    expect(machineTier({ ram: 4, gpu: 'nvidia', vram: 8 })).toBe('notEnough');
  });
});

describe('recommend', () => {
  const models = [
    { id: 'a', tier: 'small', ratings: { spelling: { good: 1, minor: 2, bad: 2 }, summary: { good: 5, minor: 0, bad: 0 } } },
    { id: 'b', tier: 'small', ratings: { spelling: { good: 4, minor: 1, bad: 0 }, summary: { good: 2, minor: 2, bad: 1 } } },
    { id: 'c', tier: 'medium', ratings: { spelling: { good: 5, minor: 0, bad: 0 }, summary: { good: 5, minor: 0, bad: 0 } } },
  ] as const;

  it('เลือกโมเดลในระดับเครื่องเดียวกันที่ได้ "ใช้ได้เลย" มากที่สุดในงานที่ผู้ใช้เลือก', () => {
    expect(recommend({ ram: 8, gpu: 'none' }, ['spelling'], models)?.id).toBe('b');
    expect(recommend({ ram: 8, gpu: 'none' }, ['summary'], models)?.id).toBe('a');
  });

  it('RAM 4GB ไม่แนะนำโมเดลใดเลย', () => {
    expect(recommend({ ram: 4, gpu: 'none' }, ['summary'], models)).toBeNull();
  });
});

describe('unsureUpgrades', () => {
  it('ไม่แน่ใจเรื่อง RAM และเครื่องยังเล็ก: ถ้ารู้จริงอาจขึ้นเป็นเครื่องกลาง', () => {
    expect(unsureUpgrades({ ram: 'unsure', gpu: 'none' })).toEqual(['ram']);
  });

  it('ไม่แน่ใจเรื่องการ์ดจอหรือ VRAM: ถ้ารู้จริงอาจขึ้นเป็นเครื่องแรง', () => {
    expect(unsureUpgrades({ ram: 16, gpu: 'unsure' })).toEqual(['gpu']);
    expect(unsureUpgrades({ ram: 16, gpu: 'nvidia', vram: 'unsure' })).toEqual(['gpu']);
  });

  it('ไม่แน่ใจทั้งสองข้อ บอกทั้งสองข้อ', () => {
    expect(unsureUpgrades({ ram: 'unsure', gpu: 'unsure' })).toEqual(['ram', 'gpu']);
  });

  it('รู้จริงแล้วก็ไม่ได้ดีขึ้น ไม่ต้องบอก', () => {
    // การ์ด 8GB ขึ้นไปเป็นเครื่องแรงอยู่แล้ว RAM จะเท่าไรก็ไม่เปลี่ยน
    expect(unsureUpgrades({ ram: 'unsure', gpu: 'nvidia', vram: 12 })).toEqual([]);
    expect(unsureUpgrades({ ram: 16, gpu: 'none' })).toEqual([]);
  });
});
