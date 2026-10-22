import { describe, expect, it } from 'vitest';
import { diskNeedGB, downloadMinutes } from './install';

describe('diskNeedGB', () => {
  it('ขนาดโมเดลปัดขึ้น แล้วเผื่อสำหรับตัวแอปอีก 3GB', () => {
    expect(diskNeedGB(2.5)).toBe(6);
    expect(diskNeedGB(7.3)).toBe(11);
    expect(diskNeedGB(5)).toBe(8);
  });
});

describe('downloadMinutes', () => {
  it('คิดจาก GB เป็นเมกะบิต หารความเร็วเน็ต แล้วปัดขึ้นเป็นนาที', () => {
    // 2.5GB = 20,000 Mb ที่ 100Mbps = 200 วินาที = 3.33 นาที
    expect(downloadMinutes(2.5, 100)).toBe(4);
    // 7.3GB ที่ 30Mbps = 58,400 Mb / 30 = 1,947 วินาที = 32.4 นาที
    expect(downloadMinutes(7.3, 30)).toBe(33);
  });

  it('ไฟล์เล็กมากก็ยังบอกอย่างน้อย 1 นาที', () => {
    expect(downloadMinutes(0.01, 100)).toBe(1);
  });
});
