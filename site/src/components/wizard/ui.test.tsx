// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { CopyButton } from './ui';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

async function clickCopy() {
  const el = document.createElement('div');
  document.body.append(el);
  act(() => createRoot(el).render(<CopyButton text="https://example.com" label="คัดลอกลิงก์โมเดล" />));
  await act(async () => el.querySelector('button')!.click());
  return el.textContent;
}

it('คัดลอกสำเร็จ ขึ้นว่าคัดลอกแล้ว', async () => {
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  expect(await clickCopy()).toContain('คัดลอกแล้ว');
});

it('clipboard reject ขึ้นว่าคัดลอกไม่ได้ ไม่ใช่ปุ่มนิ่งเฉย', async () => {
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
  expect(await clickCopy()).toContain('คัดลอกไม่ได้');
});

it('ไม่มี navigator.clipboard ขึ้นว่าคัดลอกไม่ได้', async () => {
  vi.stubGlobal('navigator', {});
  expect(await clickCopy()).toContain('คัดลอกไม่ได้');
});
