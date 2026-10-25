// Cloudflare Pages Function: POST /api/step บวกยอดว่าขั้นของวิซาร์ดถูกเปิดกี่ครั้งต่อวัน (ดู docs/stats.md)
// ห้ามอ่านหรือบันทึก IP และ header ใดๆ เก็บแค่วัน ภาษา และขั้น

// ใช้แค่ส่วนนี้ของ D1 จึงประกาศเองแทนการลง @cloudflare/workers-types
interface D1 {
  prepare(sql: string): { bind(...values: unknown[]): { run(): Promise<unknown> } };
}

interface Context {
  request: Request;
  env: { STATS: D1 };
}

const STEPS: unknown[] = [1, 2, 3, 4, 5, 6, 'done'];
const LANGS: unknown[] = ['th', 'en'];

// วันตามเวลาไทย (UTC+7) ยอดจะได้ตัดรอบตอนเที่ยงคืนของคนใช้ส่วนใหญ่
function thaiDay(): string {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  let v: any;
  try {
    v = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof v !== 'object' || v === null || !STEPS.includes(v.step) || !LANGS.includes(v.lang)) {
    return new Response(null, { status: 400 });
  }
  await env.STATS.prepare(
    `INSERT INTO step_counts (day, lang, step, count) VALUES (?, ?, ?, 1)
     ON CONFLICT (day, lang, step) DO UPDATE SET count = count + 1`,
  )
    .bind(thaiDay(), v.lang, String(v.step))
    .run();
  return new Response(null, { status: 204 });
}
