// navigator.clipboard ไม่มีในหน้าที่ไม่ใช่ https และเบราว์เซอร์อาจไม่ยอมให้คัดลอก ทั้งสองกรณีได้ false ให้ปุ่มบอกผู้ใช้
// ใช้ทั้ง CopyButton ในวิซาร์ด และปุ่มคัดลอกลิงก์บนมือถือใน wizard.astro
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
