import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import reactRenderer from '@astrojs/react/server.js';
import { expect, it } from 'vitest';
import TaskShowcase from './TaskShowcase.astro';

// Gemma 4 E4B อยู่ระดับเล็ก (ย้ายกลับ 25 ต.ค. 2569) หัวข้อต้องบอกระดับตาม models.ts ไม่ใช่ระดับเดิม
it.each([
  ['th', 'เครื่องเล็ก', 'เครื่องกลาง'],
  ['en', 'light machine', 'mid-range machine'],
] as const)('หัวข้อตัวอย่างคำตอบบอกระดับเครื่องของโมเดลตามจริง (%s)', async (lang, tier, stale) => {
  const container = await AstroContainer.create();
  // ไอคอนเป็นคอมโพเนนต์ React
  container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
  const html = await container.renderToString(TaskShowcase, { props: { lang } });
  expect(html).toContain(tier);
  expect(html).not.toContain(stale);
});
