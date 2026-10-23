import { describe, expect, it } from 'vitest';
import { alternates, href, switchPath } from './i18n';

describe('href', () => {
  it('ภาษาไทยอยู่ที่ราก ภาษาอังกฤษอยู่ใต้ /en', () => {
    expect(href('th', '/wizard#step-1')).toBe('/wizard/#step-1');
    expect(href('en', '/wizard#step-1')).toBe('/en/wizard/#step-1');
    expect(href('th', '/wizard')).toBe('/wizard/');
    expect(href('en', '/')).toBe('/en/');
  });
});

describe('switchPath', () => {
  it('ได้หน้าเดียวกันในอีกภาษา', () => {
    expect(switchPath('/', 'en')).toBe('/en/');
    expect(switchPath('/wizard/', 'en')).toBe('/en/wizard/');
    expect(switchPath('/en/', 'th')).toBe('/');
    expect(switchPath('/en', 'th')).toBe('/');
    expect(switchPath('/en/wizard/', 'th')).toBe('/wizard/');
  });
});

describe('alternates', () => {
  it('ลิงก์ hreflang เป็น URL เต็มจาก site และมี x-default ชี้หน้าภาษาไทย', () => {
    const site = new URL('https://aitidbaan.pages.dev');
    expect(alternates('/en/wizard/', site)).toEqual([
      { hreflang: 'th', href: 'https://aitidbaan.pages.dev/wizard/' },
      { hreflang: 'en', href: 'https://aitidbaan.pages.dev/en/wizard/' },
      { hreflang: 'x-default', href: 'https://aitidbaan.pages.dev/wizard/' },
    ]);
    expect(alternates('/', site)[1].href).toBe('https://aitidbaan.pages.dev/en/');
  });
});
