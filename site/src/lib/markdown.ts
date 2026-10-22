import { Marked } from 'marked';

// คำตอบของโมเดลเป็น markdown (ตาราง, list, ตัวหนา) แปลงเป็น HTML เพื่อแสดงผล
// ตัด HTML ดิบทิ้ง เพราะข้อความมาจากโมเดล ไม่ใช่จากเรา
const md = new Marked({ gfm: true, breaks: true, renderer: { html: () => '' } });

export function renderMd(text: string): string {
  return md.parse(text, { async: false });
}
