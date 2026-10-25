// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Recommendation } from './Recommendation';

// ให้ Gemma 4 E4B ชนะงานสรุป ทั้งเครื่อง 8GB และ 16GB จะได้ตัวนี้
vi.mock('../../data/ratings.json', async () => {
  const fixture = (await import('../../test/ratings.fixture.json')).default;
  const gemmaBest = { ratings: { summary: { good: 5, minor: 0, bad: 0 } }, trapFail: false };
  const otgWorse = { ratings: { summary: { good: 3, minor: 1, bad: 1 } }, trapFail: false };
  const models = { ...fixture.models, 'gemma-4-e4b-it': gemmaBest, 'openthaigpt1.5-7b-instruct': otgWorse };
  return { default: { ...fixture, models } };
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const noop = () => {};

function render(ram: 8 | 16) {
  const el = document.createElement('div');
  const root = createRoot(el);
  act(() =>
    root.render(
      <Recommendation machine={{ ram, gpu: 'none' }} tasks={['summary']} onEdit={noop} onEditQuestion={noop} onNext={noop} />,
    ),
  );
  const text = el.textContent ?? '';
  act(() => root.unmount());
  return text;
}

it.each([
  [8, true],
  [16, false],
] as const)('Gemma 4 E4B บนเครื่อง RAM %sGB เตือนเรื่อง RAM: %s', (ram, warn) => {
  const text = render(ram);
  expect(text).toContain('Gemma 4 E4B');
  expect(text.includes('ใช้ RAM เกือบเต็มเครื่อง 8GB')).toBe(warn);
});
