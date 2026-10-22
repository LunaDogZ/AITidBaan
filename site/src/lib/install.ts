// ที่ว่างที่ควรมีในไดรฟ์ C: ไฟล์โมเดล + เผื่อตัวแอปและไฟล์ชั่วคราวตอนโหลด (ตัวเลขเผื่อ ไม่ได้วัด)
const APP_ROOM_GB = 3;

export function diskNeedGB(fileGB: number): number {
  return Math.ceil(fileGB) + APP_ROOM_GB;
}

// 1GB = 8,000 เมกะบิต (ใช้หน่วยฐาน 10 แบบที่ผู้ให้บริการเน็ตใช้)
export function downloadMinutes(fileGB: number, mbps: number): number {
  return Math.max(1, Math.ceil((fileGB * 8000) / mbps / 60));
}
