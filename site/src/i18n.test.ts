import { describe, expect, it } from 'vitest';
import { href, switchPath } from './i18n';

describe('href', () => {
  it('ภาษาไทยอยู่ที่ราก ภาษาอังกฤษอยู่ใต้ /en', () => {
    expect(href('th', '/wizard#step-1')).toBe('/wizard#step-1');
    expect(href('en', '/wizard#step-1')).toBe('/en/wizard#step-1');
    expect(href('en', '/')).toBe('/en/');
  });
});

describe('switchPath', () => {
  it('ได้หน้าเดียวกันในอีกภาษา', () => {
    expect(switchPath('/', 'en')).toBe('/en/');
    expect(switchPath('/wizard', 'en')).toBe('/en/wizard');
    expect(switchPath('/en/', 'th')).toBe('/');
    expect(switchPath('/en', 'th')).toBe('/');
    expect(switchPath('/en/wizard', 'th')).toBe('/wizard');
  });
});
