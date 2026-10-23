// เว็บมี 2 ภาษา: ไทยอยู่ที่ราก (/, /wizard) อังกฤษอยู่ใต้ /en/
// ข้อความแต่ละส่วนเก็บเป็น { th, en } ไว้ในไฟล์ที่ใช้ ตัวอย่างงานทดสอบ (examples.json) คงเป็นภาษาไทยทั้งสองภาษา
export type Lang = 'th' | 'en';
export const LANGS: Lang[] = ['th', 'en'];

// getStaticPaths ของหน้าใน src/pages/[...lang]/ (lang ว่าง = ภาษาไทยที่ราก)
export const langPaths = () => [{ params: { lang: undefined } }, { params: { lang: 'en' } }];
export const langOf = (param: string | undefined): Lang => (param === 'en' ? 'en' : 'th');

// path ของหน้าเดียวกันในภาษานั้น: href('en', '/wizard#step-1') = '/en/wizard#step-1'
export const href = (lang: Lang, path: string) => (lang === 'th' ? path : `/en${path === '/' ? '/' : path}`);

// path ของหน้านี้ในอีกภาษา (ใช้กับปุ่มเปลี่ยนภาษา)
export const switchPath = (pathname: string, to: Lang) => href(to, pathname.replace(/^\/en(?=\/|$)/, '') || '/');

// <link rel="alternate" hreflang> ต้องเป็น URL เต็ม และมี x-default สำหรับภาษาอื่น (ใช้หน้าภาษาไทย)
export const alternates = (pathname: string, site: URL) => [
  ...LANGS.map((l) => ({ hreflang: l, href: new URL(switchPath(pathname, l), site).href })),
  { hreflang: 'x-default', href: new URL(switchPath(pathname, 'th'), site).href },
];
