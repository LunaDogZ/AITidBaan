// เทสต์อยู่ที่นี่ ไม่อยู่ใน functions/ เพราะ Cloudflare Pages จะเอาทุกไฟล์ในนั้นไปทำเป็น route
import { describe, expect, it } from 'vitest';
import { onRequestPost } from '../../functions/api/step';

// D1 ปลอม: จำคำสั่งกับค่าที่ bind ไว้ แทนการเขียนลงฐานข้อมูลจริง
function fakeD1() {
  const runs: { sql: string; values: unknown[] }[] = [];
  const db = {
    prepare: (sql: string) => ({
      bind: (...values: unknown[]) => ({
        run: async () => {
          runs.push({ sql, values });
        },
      }),
    }),
  };
  return { db, runs };
}

async function post(body: string) {
  const { db, runs } = fakeD1();
  const request = new Request('https://aitidbaan.pages.dev/api/step', { method: 'POST', body });
  const res = await onRequestPost({ request, env: { STATS: db } });
  return { status: res.status, runs };
}

describe('POST /api/step', () => {
  it('บวกยอดของขั้นนั้นในวันนั้นหนึ่งครั้ง', async () => {
    const { status, runs } = await post(JSON.stringify({ step: 3, lang: 'en' }));
    expect(status).toBe(204);
    expect(runs).toHaveLength(1);
    expect(runs[0].sql).toMatch(/ON CONFLICT.*count = count \+ 1/s);
    expect(runs[0].values).toEqual([expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), 'en', '3']);
  });

  it('นับ "done" (กดติดตั้งเสร็จในขั้น ⑥)', async () => {
    const { status, runs } = await post(JSON.stringify({ step: 'done', lang: 'th' }));
    expect(status).toBe(204);
    expect(runs[0].values.slice(1)).toEqual(['th', 'done']);
  });

  it.each([
    ['ไม่ใช่ JSON', 'hello'],
    ['ขั้นเกิน 6', JSON.stringify({ step: 7, lang: 'th' })],
    ['ขั้นเป็นข้อความ', JSON.stringify({ step: '3', lang: 'th' })],
    ['ภาษาที่ไม่มี', JSON.stringify({ step: 1, lang: 'jp' })],
    ['ไม่มีภาษา', JSON.stringify({ step: 1 })],
    ['ไม่ใช่ object', 'null'],
  ])('ค่าผิด (%s) ได้ 400 และไม่เขียนอะไรลง D1', async (_, body) => {
    const { status, runs } = await post(body);
    expect(status).toBe(400);
    expect(runs).toHaveLength(0);
  });
});
