import { expect, it, vi } from 'vitest';
import { recommend } from '../lib/recommend';
import { MODELS } from './models';

// ให้ Gemma 4 E4B ได้คะแนนดีที่สุด
vi.mock('./ratings.json', async () => {
  const fixture = (await import('../test/ratings.fixture.json')).default;
  const gemmaBest = { ratings: { summary: { good: 5, minor: 0, bad: 0 } }, trapFail: false };
  const otgWorse = { ratings: { summary: { good: 3, minor: 1, bad: 1 } }, trapFail: false };
  const models = { ...fixture.models, 'gemma-4-e4b-it': gemmaBest, 'openthaigpt1.5-7b-instruct': otgWorse };
  return { default: { ...fixture, models } };
});

it('เครื่อง RAM 8GB ได้ Gemma 4 E4B ถ้าทำงานที่เลือกได้ดีที่สุด (อยู่ระดับเล็กพร้อมคำเตือนเรื่อง RAM)', () => {
  expect(recommend({ ram: 8, gpu: 'none' }, ['summary'], MODELS)?.id).toBe('gemma-4-e4b');
});

it('เครื่อง RAM 16GB ยังได้ Gemma 4 E4B ถ้าทำงานที่เลือกได้ดีที่สุด', () => {
  expect(recommend({ ram: 16, gpu: 'none' }, ['summary'], MODELS)?.id).toBe('gemma-4-e4b');
});
