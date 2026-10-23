import { afterEach, expect, it, vi } from 'vitest';
import { copyText } from './clipboard';

afterEach(() => vi.unstubAllGlobals());

it('คัดลอกสำเร็จ ได้ true', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  expect(await copyText('abc')).toBe(true);
  expect(writeText).toHaveBeenCalledWith('abc');
});

it('เบราว์เซอร์ไม่ยอมให้คัดลอก (reject) ได้ false ไม่โยน error', async () => {
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
  expect(await copyText('abc')).toBe(false);
});

it('ไม่มี navigator.clipboard (หน้าไม่ใช่ https) ได้ false ไม่โยน error', async () => {
  vi.stubGlobal('navigator', {});
  expect(await copyText('abc')).toBe(false);
});
