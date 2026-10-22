import { expect, it } from 'vitest';
import { renderMd } from './markdown';

it('แปลงตาราง markdown ในคำตอบของโมเดลเป็นตาราง HTML', () => {
  expect(renderMd('| หัวข้อ | ค่า |\n|---|---|\n| งบ | 1,960,000 บาท |')).toContain('<td>1,960,000 บาท</td>');
});

it('ตัด HTML ดิบที่อยู่ในคำตอบของโมเดลทิ้ง', () => {
  const html = renderMd('สวัสดี <script>alert(1)</script> <img src=x onerror=alert(1)>');
  expect(html).not.toContain('<script');
  expect(html).not.toContain('<img');
});
