import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import reactRenderer from '@astrojs/react/server.js';
import { expect, it } from 'vitest';
import TaskShowcase from './TaskShowcase.astro';

// Gemma 4 E4B อยู่ระดับกลาง (RAM 16GB) หัวข้อต้องไม่บอกว่าเป็นโมเดลสำหรับโน้ตบุ๊กทั่วไป
it.each([
  ['th', 'เครื่องกลาง', 'โน้ตบุ๊กทั่วไป'],
  ['en', 'mid-range machine', 'ordinary laptop'],
] as const)('หัวข้อตัวอย่างคำตอบบอกระดับเครื่องของโมเดลตามจริง (%s)', async (lang, tier, stale) => {
  const container = await AstroContainer.create();
  // ไอคอนเป็นคอมโพเนนต์ React
  container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
  const html = await container.renderToString(TaskShowcase, { props: { lang } });
  expect(html).toContain(tier);
  expect(html).not.toContain(stale);
});
