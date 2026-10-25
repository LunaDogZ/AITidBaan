// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackStep } from './stats';

let fetchMock: ReturnType<typeof vi.fn>;
const sent = () => fetchMock.mock.calls.map(([url, init]) => [url, JSON.parse(init.body)]);
const ok = () => Promise.resolve(new Response(null, { status: 204 }));
// รอให้ fetch ตอบและบันทึกลง localStorage เสร็จ
const settle = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  localStorage.clear();
  fetchMock = vi.fn(ok);
  vi.stubGlobal('fetch', fetchMock);
  // เทสต์เป็นโหมด dev ซึ่งปกติไม่ส่ง ปิดไว้เพื่อดูว่าตอนเว็บจริงส่งอะไรออกไป
  vi.stubEnv('DEV', false);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('trackStep', () => {
  it('ส่งขั้นกับภาษาไปที่ /api/step ขั้นละครั้งเดียว แม้รีโหลดหรือย้อนกลับมา', async () => {
    trackStep(1, 'th');
    await settle();
    trackStep(2, 'th');
    await settle();
    trackStep(1, 'th');
    trackStep('done', 'en');
    await settle();
    trackStep('done', 'en');
    expect(sent()).toEqual([
      ['/api/step', { step: 1, lang: 'th' }],
      ['/api/step', { step: 2, lang: 'th' }],
      ['/api/step', { step: 'done', lang: 'en' }],
    ]);
  });

  it('ไม่ส่งตอนพัฒนาบน localhost (npm run dev)', async () => {
    vi.stubEnv('DEV', true);
    trackStep(1, 'th');
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('server ไม่ได้บันทึก (เช่นยังไม่ได้ผูก D1) หรือเน็ตหลุด ให้ส่งใหม่ได้ครั้งหน้า', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    trackStep(3, 'th');
    await settle();
    trackStep(3, 'th');
    await settle();
    trackStep(3, 'th');
    await settle();
    trackStep(3, 'th');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('localStorage ใช้ไม่ได้ ไม่ส่งเลย เพราะจะนับซ้ำทุกครั้งที่เปิดขั้น', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    trackStep(1, 'th');
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
