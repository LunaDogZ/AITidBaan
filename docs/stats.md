# สถิติการใช้วิซาร์ด

วิซาร์ดส่งเลขขั้นกับภาษาไปที่ `POST /api/step` (`site/functions/api/step.ts`) ตอนเปิดขั้นนั้นครั้งแรก (โค้ดฝั่งเว็บอยู่ที่ `site/src/lib/stats.ts`) และส่ง `done` ตอนกดปุ่มเสร็จในขั้น ⑥ ระบบไม่เก็บ IP หรือ header ใดๆ

- เครื่องหนึ่งนับขั้นละครั้ง (จำไว้ใน localStorage key `aitidbaan:stats-sent` หลัง server ตอบว่าบันทึกแล้ว ถ้าบันทึกไม่ได้จะส่งใหม่ครั้งหน้า) ถ้าล้างข้อมูลเบราว์เซอร์จะนับใหม่ เบราว์เซอร์ที่ใช้ localStorage ไม่ได้จะไม่ส่งเลย
- `day` เป็นวันตามเวลาไทย (UTC+7) ของวันที่เปิดขั้นนั้นครั้งแรก
- ตอน `npm run dev` และตอนรันเทสต์จะไม่ส่ง
- ตัวเลขเป็นค่าประมาณ ใครก็ยิง endpoint ปั่นยอดได้ และคนที่ปิด JavaScript หรือใช้ตัวบล็อกจะไม่ถูกนับ

ยอดคนเข้าเว็บดูใน Cloudflare Web Analytics ส่วนไฟล์นี้เป็นเรื่องยอดของขั้นวิซาร์ด

## ตั้งค่าครั้งแรก (ทำบน dashboard ก่อน push โค้ด)

1. Cloudflare dashboard → Storage & Databases → D1 → Create database ตั้งชื่อ `aitidbaan-stats`
2. เปิดฐานข้อมูลนั้น → Console แล้วรันคำสั่งนี้

   ```sql
   CREATE TABLE step_counts (
     day TEXT NOT NULL,
     lang TEXT NOT NULL,
     step TEXT NOT NULL,
     count INTEGER NOT NULL,
     PRIMARY KEY (day, lang, step)
   );
   ```

3. Workers & Pages → โปรเจกต์ `aitidbaan` → Settings → Bindings → Add → D1 database ตั้ง Variable name เป็น `STATS` แล้วเลือก `aitidbaan-stats` ทำเฉพาะ Production ห้ามผูกกับ Preview ไม่อย่างนั้นยอดจากตอนทดสอบจะปนกับยอดจริง (บน Preview วิซาร์ดจะส่งไม่สำเร็จแล้วเงียบไป ซึ่งถูกต้องแล้ว)
4. โปรเจกต์เดิม → Metrics → Web Analytics → Enable
5. push โค้ด แล้วเปิดวิซาร์ดบนเว็บจริงหนึ่งรอบ กลับมารัน `SELECT * FROM step_counts;` ใน Console ต้องเห็นแถวของวันนี้

## คำสั่งดูยอด (รันใน D1 Console)

รวม 7 วันล่าสุด แยกขั้นและภาษา

```sql
SELECT step, lang, SUM(count) AS n
FROM step_counts
WHERE day >= date('now', '+7 hours', '-6 days')
GROUP BY step, lang
ORDER BY lang, step;
```

ยอดรายวันของขั้น ① เทียบกับคนที่ติดตั้งเสร็จ

```sql
SELECT day,
       SUM(CASE WHEN step = '1' THEN count END) AS opened,
       SUM(CASE WHEN step = 'done' THEN count END) AS done
FROM step_counts
GROUP BY day
ORDER BY day DESC;
```

คนหลุดขั้นไหน (ทั้งหมด ไม่แยกภาษา): ดูว่ายอดของแต่ละขั้นลดลงจากขั้นก่อนหน้าเท่าไร

```sql
SELECT step, SUM(count) AS n
FROM step_counts
GROUP BY step
ORDER BY step;
```
