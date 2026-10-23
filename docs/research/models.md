# ผลค้นรายชื่อโมเดล (ตอบคำถามที่ค้างใน PRD 6.1 และ 14)

- วันที่ค้น: 2026-10-18
- ขอบเขต: ตอบคำถามที่ค้างเรื่องรายชื่อโมเดลในร่าง PRD 6.1 (ร่าง ณ 2026-10-17) ไม่ได้แก้ PRD
- แหล่งข้อมูล: model card และรายการไฟล์บน Hugging Face (ขนาดไฟล์ดึงจาก HF API `?blobs=true`) บทความทางการของผู้พัฒนา และการอ่าน header ของไฟล์ GGUF โดยตรง (ใช้ HTTP Range request อ่านเฉพาะส่วนต้นไฟล์)
- ขนาดไฟล์ใช้หน่วย GB ฐาน 10 (1 GB = 10^9 byte) Windows จะแสดงตัวเลขเล็กกว่านี้ประมาณ 7%
- คำศัพท์ใช้ตาม [GLOSSARY.md](../../GLOSSARY.md)

## 1. Qwen ขนาดประมาณ 14B สำหรับเครื่องแรง (VRAM 8GB ขึ้นไป)

**ข้อเท็จจริง**

- Qwen ไม่ได้ออกรุ่น 14B ใหม่ตั้งแต่ Qwen3 (เม.ย. 2025) ตระกูลใหม่กว่านั้นมีขนาดดังนี้
  - Qwen3.5 (ก.พ. 2026): 0.8B, 2B, 4B, 9B, 27B, 35B-A3B, 122B-A10B, 397B-A17B
  - Qwen3.6 (เม.ย. 2026): 27B, 35B-A3B
  - Qwen3.8 (ส.ค. 2026): 27B, Flash-Next (ประมาณ 180B) และ 2.4T-A95B
  - ที่มา: https://huggingface.co/api/models?author=Qwen&sort=createdAt&direction=-1 , https://huggingface.co/Qwen/Qwen3.8-27B , https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- **Qwen3-14B** มี GGUF ทางการ แต่ไฟล์ `Qwen3-14B-Q4_K_M.gguf` ใหญ่ **9.0 GB** ซึ่งเกิน VRAM 8GB ต้องแบ่งไปรันบน RAM บางส่วน ความเร็วจะลดลงมาก (Apache-2.0) ที่มา: https://huggingface.co/Qwen/Qwen3-14B-GGUF
- **Qwen3.5-9B** เป็นรุ่นล่าสุดที่ใกล้ 14B ที่สุดและลงใน VRAM 8GB ได้
  - License Apache-2.0
  - model card อ้างว่ารองรับ "201 languages and dialects" แต่ไม่ได้ระบุภาษาไทยเป็นการเฉพาะ
  - context 262,144 token
  - **เปิดโหมดคิด (thinking) เป็นค่าเริ่มต้น** ปิดได้ผ่าน `enable_thinking: False`
  - เป็นโมเดลที่รับภาพได้ด้วย (ไฟล์ mmproj แยก ไม่จำเป็นต่องานข้อความ)
  - ที่มา: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen ไม่ได้ทำ GGUF ทางการให้ Qwen3.5 (ไม่มี repo `Qwen/Qwen3.5-*-GGUF`) ต้องใช้ของชุมชนที่ใหญ่และน่าเชื่อถือ
  - `lmstudio-community/Qwen3.5-9B-GGUF` → `Qwen3.5-9B-Q4_K_M.gguf` **5.63 GB**, Apache-2.0 https://huggingface.co/lmstudio-community/Qwen3.5-9B-GGUF
  - `unsloth/Qwen3.5-9B-GGUF` → `Qwen3.5-9B-Q4_K_M.gguf` 5.68 GB, Apache-2.0 https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
  - `bartowski/Qwen_Qwen3.5-9B-GGUF` → `Qwen_Qwen3.5-9B-Q4_K_M.gguf` 6.17 GB https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF

**ข้อแนะนำ:** ใช้ **Qwen3.5-9B** จาก `lmstudio-community` (เป็นชุดที่แอป LM Studio แสดงเป็นตัวเลือกหลัก) แทน "Qwen ประมาณ 14B"

- ต้องเช็กตอนทดสอบ: ปิดโหมดคิดในแอปได้หรือไม่ ถ้าปิดไม่ได้ คำตอบจะช้าลงและเงื่อนไขการทดสอบจะต่างจากโมเดลอื่น
- ตัวเลือกอื่น: **Gemma 4 12B** (พ.ค. 2026, Apache-2.0) มี GGUF ทางการ `google/gemma-4-12B-it-qat-q4_0-gguf` → `gemma-4-12b-it-qat-q4_0.gguf` 6.98 GB และ `lmstudio-community/gemma-4-12B-it-GGUF` → Q4_K_M 7.38 GB ที่มา: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf , https://huggingface.co/lmstudio-community/gemma-4-12B-it-GGUF ไม่เลือกเป็นตัวหลักเพราะรายการมี Gemma 4 E4B อยู่แล้ว การใช้ Qwen ช่วยให้มีโมเดลทั่วไปหลายตระกูล

## 2. Sailor2 8B Chat

**ข้อเท็จจริง**

- ยัง**ไม่มี GGUF ทางการ** โมเดลออกเมื่อ ธ.ค. 2024 และ sail ไม่ได้ออก Sailor2 รุ่นใหม่ตั้งแต่ ก.พ. 2025 ที่มา: https://huggingface.co/sail , https://huggingface.co/sail/Sailor2-8B-Chat
- ตัวโมเดลต้นฉบับใช้ Apache-2.0 (ฐาน Qwen2.5-7B รองรับภาษาไทย) https://huggingface.co/sail/Sailor2-8B-Chat
- **ข้อจำกัดสำคัญ:** เมื่อ 2025-01-08 ผู้พัฒนาแก้ `max_position_embeddings` ใน config จาก 32768 เป็น **4096** แปลว่า context ที่ใช้งานได้จริงคือประมาณ 4K token https://huggingface.co/sail/Sailor2-8B-Chat/commit/98c70a632b023fb69755e7bb6f81c3bffba8f9c3
  - ไฟล์ GGUF ที่ทำก่อนวันนั้น (bartowski, MaziyarPanahi) จะยังบันทึกค่าเก่าไว้ที่ 32K
  - เอกสารต้นทางยาว 3–5 หน้าบวกคำสั่ง มีโอกาสเกิน 4K token (ค่าประมาณ ยังไม่ได้นับจริง) ถ้าเกิน LM Studio จะเปลี่ยนไปใช้ RAG ซึ่งทำให้ผลเทียบกันไม่ได้ (PRD 6.2)

GGUF จากชุมชนที่มี Q4_K_M

| repo | ไฟล์ | ขนาด | License ระบุชัด? | วันที่ทำ |
|---|---|---|---|---|
| [bartowski/Sailor2-8B-Chat-GGUF](https://huggingface.co/bartowski/Sailor2-8B-Chat-GGUF) | `Sailor2-8B-Chat-Q4_K_M.gguf` | 5.24 GB | ใช่ (apache-2.0) | 2024-12-06 (ก่อนแก้ context) |
| [mradermacher/Sailor2-8B-Chat-GGUF](https://huggingface.co/mradermacher/Sailor2-8B-Chat-GGUF) | `Sailor2-8B-Chat.Q4_K_M.gguf` | 5.24 GB | ใช่ (apache-2.0) | 2025-02-13 (หลังแก้ context) |
| [MaziyarPanahi/Sailor2-8B-Chat-GGUF](https://huggingface.co/MaziyarPanahi/Sailor2-8B-Chat-GGUF) | `Sailor2-8B-Chat.Q4_K_M.gguf` | 5.24 GB | ไม่ระบุ | 2024-12-03 |
| [duyntnet/Sailor2-8B-Chat-imatrix-GGUF](https://huggingface.co/duyntnet/Sailor2-8B-Chat-imatrix-GGUF) | `Sailor2-8B-Chat-Q4_K_M.gguf` | 5.24 GB | "other" (ไม่ชัด) | 2024-12-12 |

**ข้อแนะนำ:** ถ้ายังเก็บ Sailor2 ไว้ ให้ใช้ `mradermacher/Sailor2-8B-Chat-GGUF` เพราะ license ระบุชัดและทำหลังแก้ค่า context ไม่ต้องแปลงไฟล์เอง **แต่แนะนำให้แทนด้วยโมเดลอื่น** (ดูข้อ 5) เพราะโมเดลเก่าเกือบ 2 ปี และ context 4K สั้นเกินงานทดสอบ

## 3. Gemma 4 E4B

**ขนาดไฟล์** (ทุก repo ใช้ Apache-2.0)

| repo | ไฟล์ | ขนาด |
|---|---|---|
| [lmstudio-community/gemma-4-E4B-it-GGUF](https://huggingface.co/lmstudio-community/gemma-4-E4B-it-GGUF) | `gemma-4-E4B-it-Q4_K_M.gguf` | 5.34 GB |
| [unsloth/gemma-4-E4B-it-GGUF](https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF) | `gemma-4-E4B-it-Q4_K_M.gguf` | 4.98 GB |
| [bartowski/google_gemma-4-E4B-it-GGUF](https://huggingface.co/bartowski/google_gemma-4-E4B-it-GGUF) | `google_gemma-4-E4B-it-Q4_K_M.gguf` | 5.41 GB |
| [ggml-org/gemma-4-E4B-it-GGUF](https://huggingface.co/ggml-org/gemma-4-E4B-it-GGUF) | `gemma-4-E4B-it-Q4_0.gguf` (ไม่มี Q4_K_M) | 4.59 GB |
| [google/gemma-4-E4B-it-qat-q4_0-gguf](https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf) (ทางการ, QAT) | `gemma-4-E4B_q4_0-it.gguf` | 5.15 GB |

- ไฟล์รับภาพ (mmproj) เพิ่มอีก 0.56–0.99 GB ถ้าแอปโหลดมาด้วย
- PRD ระบุ ggml-org แต่ repo นั้น**ไม่มี Q4_K_M** มีแต่ Q4_0
- E4B มีพารามิเตอร์ที่ใช้คำนวณ 4.5B แต่รวม embedding แล้วประมาณ 8B ไฟล์จึงใหญ่กว่าโมเดล 4B ทั่วไป https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf

**RAM ที่ใช้จริงและเครื่อง RAM 8GB**

- คู่มือของ Unsloth ระบุว่า E4B แบบ 4-bit ใช้หน่วยความจำรวม **5.5–6 GB** ส่วน E2B ใช้ประมาณ 4 GB https://unsloth.ai/docs/models/gemma-4
- บนโน้ตบุ๊ก Windows ที่มี RAM 8GB ระบบและเบราว์เซอร์ก็ใช้ RAM อยู่แล้วหลาย GB (ข้อนี้ยังไม่มีแหล่งอ้างอิง ต้องวัดเอง) จึงประเมินว่า**อาจโหลดได้ แต่เสี่ยงต้องใช้ swap และช้าจนไม่ผ่านเกณฑ์ใช้งานได้จริง** ต้องวัดจริงตามที่ PRD 14 ระบุไว้
- ตัวสำรองถ้าไม่ผ่าน: Gemma 4 E2B (`lmstudio-community/gemma-4-E2B-it-GGUF` → `gemma-4-E2B-it-Q4_K_M.gguf` 3.43 GB หรือ GGUF ทางการแบบ QAT `google/gemma-4-E2B-it-qat-q4_0-gguf` → 3.35 GB) https://huggingface.co/lmstudio-community/gemma-4-E2B-it-GGUF , https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf หรือ Gemma-SEA-LION v4.5 E2B (ข้อ 5)

**build ที่ตัด vocab**

- vocab ของ Gemma 4 มี 262K token https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- ได้อ่าน header ของไฟล์ GGUF โดยตรง ทุกไฟล์ต่อไปนี้มี **vocab ครบ 262,144 token และมี token ที่มีอักษรไทย 2,177 ตัว** เท่ากันทุกไฟล์
  - lmstudio-community Q4_K_M, unsloth Q4_K_M, bartowski Q4_K_M, ggml-org Q4_0, google QAT Q4_0 และ unsloth QAT UD-Q4_K_XL
- build ที่ตัด vocab มีอยู่จริงแต่เป็น repo เฉพาะทาง เช่น Gemma 4 E2B ที่เหลือ vocab 209,836 token สำหรับภาษาอาหรับกับอังกฤษ https://featherless.ai/models/ml-intern-explorers/gemma-4-e2b-arabic-english-vision และ Gemma 3 ที่เหลือ 32,768 token สำหรับภาษาอังกฤษ https://kaitchup.substack.com/p/shrink-llms-via-vocabulary-reduction
- กฎที่ใช้ได้ง่าย: ใช้เฉพาะ repo ของ google, lmstudio-community, unsloth, ggml-org หรือ bartowski และหลีกเลี่ยงชื่อ repo ที่มีคำว่า eng / pruned / trimmed / ตัวเลข vocab เช่น 32768 รวมถึงรุ่น uncensored / abliterated

**ข้อแนะนำ:** ใช้ `lmstudio-community/gemma-4-E4B-it-GGUF` → `gemma-4-E4B-it-Q4_K_M.gguf` (5.34 GB) ซึ่งตรวจแล้วว่า vocab ครบ ถ้าต้องการไฟล์เล็กที่สุดที่เป็น Q4_K_M ให้ใช้ unsloth (4.98 GB)

## 4. ยืนยันอีก 3 โมเดล

| โมเดล | GGUF ทางการ | ไฟล์ Q4_K_M | ขนาด | License | หมายเหตุ |
|---|---|---|---|---|---|
| Typhoon 2.5 4B | มี [typhoon-ai/typhoon2.5-qwen3-4b-gguf](https://huggingface.co/typhoon-ai/typhoon2.5-qwen3-4b-gguf) | `typhoon2.5-qwen3-4b-q4_k_m.gguf` | 2.50 GB | Apache-2.0 | ฐาน Qwen3-4B-Instruct-2507 ไม่มีโหมดคิด context 256K https://huggingface.co/typhoon-ai/typhoon2.5-qwen3-4b ตรงกับ PRD |
| OpenThaiGPT 1.5 7B | มี [openthaigpt/openthaigpt1.5-7b-instruct-GGUF](https://huggingface.co/openthaigpt/openthaigpt1.5-7b-instruct-GGUF) (ลง repo นี้เมื่อ 2026-07-26) | `openthaigpt1.5-7b-instruct.Q4_K_M.gguf` | 4.68 GB | **Qwen License** (`license: other`, ใช้เชิงพาณิชย์ได้ ถ้าผู้ใช้เกิน 100 ล้านคนต่อเดือนต้องขอเพิ่ม) | PRD ไม่ได้ระบุ license ต้องเพิ่ม โมเดลออก ก.ย. 2024 (ฐาน Qwen2.5) ถือว่าเก่า https://huggingface.co/openthaigpt/openthaigpt1.5-7b-instruct |
| Typhoon 2.1 Gemma3 12B | มี [typhoon-ai/typhoon2.1-gemma3-12b-gguf](https://huggingface.co/typhoon-ai/typhoon2.1-gemma3-12b-gguf) | `typhoon2.1-gemma3-12b-q4_k_m.gguf` | **7.30 GB** | **Gemma License** (ไม่ใช่ Apache) | **PRD เขียนว่า 7.8 GB ต้องแก้เป็น 7.3 GB** มีโหมดคิดแต่ปิดเป็นค่าเริ่มต้น context 128K ออก พ.ค. 2025 https://huggingface.co/typhoon-ai/typhoon2.1-gemma3-12b |

- ทั้ง 3 ตัวยังเป็นรุ่นล่าสุดของสายตัวเองในขนาดนี้ Typhoon ยังไม่มีรุ่น 2.5 ขนาดกลาง (มีเพียง 4B และ 30B-A3B) และ OpenThaiGPT 1.5 7B ยังไม่มีรุ่นใหม่ขนาด 7–8B ที่ไม่ใช่ research preview https://huggingface.co/typhoon-ai , https://huggingface.co/openthaigpt
- Typhoon 2.1 12B ขนาด 7.3 GB บน VRAM 8GB ทำให้เหลือที่ให้ context น้อย ต้องวัดว่าลงการ์ดจอได้ทั้งหมดหรือไม่

## 5. โมเดลไทย/SEA ที่ออกใหม่และควรพิจารณา

**กรณีชัด: แทน Sailor2 8B ด้วย Pathumma-ThaiLLM-8B-Think-3.0.0 (เครื่องกลาง)**

- เหตุผลที่ควรเปลี่ยน
  - Sailor2 ไม่มี GGUF ทางการ, context 4K และเก่า (ข้อ 2)
  - ตัวใหม่สร้างบน **ThaiLLM-8B** ซึ่งเป็นโมเดลพื้นฐานของโครงการ ThaiLLM ระดับชาติ (เทรนต่อจาก Qwen3-8B-Base ด้วยข้อมูลประมาณ 63B token ภาษาไทยประมาณ 31.5B) https://huggingface.co/ThaiLLM/ThaiLLM-8B
  - มี **GGUF ทางการจาก NECTEC** `nectec/pathumma-thaillm-8b-think-3.0.0-GGUF` → `pathumma-thaillm-8b-think-3-Q4_K_M.gguf` **5.03 GB** และใช้ Apache-2.0 https://huggingface.co/nectec/pathumma-thaillm-8b-think-3.0.0-GGUF
  - header ของ GGUF ระบุ context 40,960 token
  - ยังเป็นโมเดลไทยจากผู้พัฒนาอีกราย ทำให้รายการครอบคลุม Typhoon, OpenThaiGPT และ NECTEC
- ข้อควรระวัง: เป็น**โมเดลคิดก่อนตอบ** (thinking) https://huggingface.co/nectec/pathumma-thaillm-8b-think-3.0.0 จะใช้ token มากขึ้นและช้าลงบนเครื่องที่ไม่มีการ์ดจอ ต้องวัดว่ายังใช้งานได้จริงหรือไม่
- ทางเลือกที่ไม่มีโหมดคิด เช่น `typhoon-ai/typhoon-s-thaillm-8b-instruct-research-preview` (Apache-2.0) ยังเป็น research preview และไม่มี GGUF ทางการ (มีของ mradermacher) https://huggingface.co/typhoon-ai/typhoon-s-thaillm-8b-instruct-research-preview
- ความมั่นใจ: กลาง

**น่าจับตา แต่ยังไม่ควรเปลี่ยน**

- **Gemma-SEA-LION v4.5 E2B** (AI Singapore, พ.ค. 2026) ฐาน Gemma 4 E2B และ fine-tune ภาษา SEA รวมภาษาไทย มี GGUF ทางการ `aisingapore/Gemma-SEA-LION-v4.5-E2B-IT-GGUF` → `Gemma-SEA-LION-v4.5-E2B-IT-Q4_K_M.gguf` 3.43 GB https://huggingface.co/aisingapore/Gemma-SEA-LION-v4.5-E2B-IT-GGUF
  - เหมาะเป็นตัวสำรองของเครื่องเล็กถ้า Gemma 4 E4B ไม่ผ่าน
  - **license ขัดกันเอง:** metadata เขียนว่า MIT แต่ `license_link` ชี้ไปที่ Gemma 4 license ต้องเช็กก่อนใช้ https://huggingface.co/aisingapore/Gemma-SEA-LION-v4.5-E2B-IT
- **Pathumma-llm-text-4.0.0** (NECTEC, ส.ค. 2026) ขนาด 4B ฐาน ThaiLLM สถาปัตยกรรม qwen3_5 เป็นโมเดลคิดก่อนตอบ Apache-2.0 แต่**ยังไม่มี GGUF** https://huggingface.co/nectec/Pathumma-llm-text-4.0.0
- **Nemotron-SEA-LION v4.8 30B-A3B** (ก.ย. 2026) มี GGUF ทางการ แต่ใหญ่เกินระดับเครื่องแรงของ v1 เช่นเดียวกับตัวเลือกสำรองใน PRD https://huggingface.co/aisingapore/Nemotron-SEA-LION-v4.8-30B-A3B-GGUF

## ตารางสรุป

| ระดับเครื่อง | โมเดลที่แนะนำ | repo GGUF + ไฟล์ | ขนาด | License | ความมั่นใจ |
|---|---|---|---|---|---|
| เล็ก | Typhoon 2.5 4B | `typhoon-ai/typhoon2.5-qwen3-4b-gguf` / `typhoon2.5-qwen3-4b-q4_k_m.gguf` | 2.50 GB | Apache-2.0 | สูง |
| ~~เล็ก~~ กลาง | Gemma 4 E4B | `lmstudio-community/gemma-4-E4B-it-GGUF` / `gemma-4-E4B-it-Q4_K_M.gguf` | 5.34 GB | Apache-2.0 | ย้ายไประดับกลาง 23 ต.ค. 2569 (ใช้ RAM ~5.9GB เกินเครื่อง 8GB) ตัวที่สองของระดับเล็กให้เลือกจากโมเดลที่ฝึกภาษาไทย (ข้อ 5) |
| กลาง | OpenThaiGPT 1.5 7B | `openthaigpt/openthaigpt1.5-7b-instruct-GGUF` / `openthaigpt1.5-7b-instruct.Q4_K_M.gguf` | 4.68 GB | Qwen License | สูง |
| กลาง | Pathumma-ThaiLLM-8B-Think-3.0.0 (แทน Sailor2) | `nectec/pathumma-thaillm-8b-think-3.0.0-GGUF` / `pathumma-thaillm-8b-think-3-Q4_K_M.gguf` | 5.03 GB | Apache-2.0 | กลาง (โหมดคิดอาจช้า) |
| กลาง (ถ้าเก็บ Sailor2) | Sailor2 8B Chat | `mradermacher/Sailor2-8B-Chat-GGUF` / `Sailor2-8B-Chat.Q4_K_M.gguf` | 5.24 GB | Apache-2.0 | สูง (เรื่องไฟล์) แต่ไม่แนะนำเพราะ context 4K |
| แรง | Typhoon 2.1 Gemma3 12B | `typhoon-ai/typhoon2.1-gemma3-12b-gguf` / `typhoon2.1-gemma3-12b-q4_k_m.gguf` | 7.30 GB | Gemma License | สูง |
| แรง | Qwen3.5-9B (แทน "Qwen ประมาณ 14B") | `lmstudio-community/Qwen3.5-9B-GGUF` / `Qwen3.5-9B-Q4_K_M.gguf` | 5.63 GB | Apache-2.0 | กลาง-สูง (ต้องเช็กการปิดโหมดคิด) |
