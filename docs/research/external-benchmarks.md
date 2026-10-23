# ผลทดสอบภาษาไทยจากแหล่งภายนอก

- ค้นเมื่อ: 2026-10-23
- ตัวเลขที่ใช้บนเว็บอยู่ใน `site/src/data/external.json` (ทุกค่ามี URL และวันที่ดึง)

## ข้อสรุป

**ใช้แสดงเทียบข้างผลทดสอบของเราได้อย่างเดียว เอามาคิดคะแนนแนะนำไม่ได้**

- ไม่มีแหล่งไหนทดสอบไฟล์ GGUF/Q4_K_M ที่ผู้ใช้โหลดจริง ทุกแหล่งรันเต็มความละเอียด
- แต่ละแหล่งมีโมเดลไม่ครบชุดและวัดคนละแบบ (MetricX, ROUGE, ข้อสอบปรนัย, ให้ GPT-4 ตัดสิน) จึงเฉลี่ยรวมกันไม่ได้
- 4 จาก 6 งานไม่มีข้อมูลภายนอกเลย: ปรับเป็นภาษาทางการ, ตรวจคำผิด, ข้อหลอก (คำตอบไม่มีในเอกสาร), รายงานการประชุม
- Typhoon 2.5 4B และ OpenThaiGPT 1.5 7B มีแค่ตัวเลขที่ผู้ทำโมเดลวัดเอง

บนเว็บต้องบอกว่า ตัวเลขภายนอกมาจากโมเดลเต็มความละเอียด (Q4 มักได้น้อยกว่าไม่กี่คะแนน) และติดป้าย "ผู้ทำโมเดลวัดเอง" ให้ค่าจากการ์ดโมเดล

## แหล่งที่ใช้

| แหล่ง | ใครวัด | โมเดลของเราที่มี | ตรงกับงานของเรา |
|---|---|---|---|
| [SEA-HELM](https://leaderboard.sea-lion.ai/detailed/TH) (AI Singapore, ข้อมูล 2026-09-18) | อิสระ | Qwen3.5 9B, Gemma 4 E4B, Gemma 3 12B (ตัวต้นแบบของ Typhoon 2.1) | แปล (ตรง), สรุป (ROUGE-L บอกอะไรได้น้อย), ดึงข้อมูล (QA ไม่มีข้อหลอก) |
| [การ์ด Typhoon 2.5 4B](https://huggingface.co/scb10x/typhoon2.5-qwen3-4b) | ผู้ทำโมเดล | Typhoon 2.5 4B | ไม่ตรง (HotpotQA, IFEval-TH, MT-Bench-TH) |
| [การ์ด Typhoon 2.1 12B](https://huggingface.co/scb10x/typhoon2.1-gemma3-12b) | ผู้ทำโมเดล | Typhoon 2.1 12B | ไม่ตรง (IFEval-TH, MT-Bench-TH, code-switching) |
| [การ์ด OpenThaiGPT 1.5 7B](https://huggingface.co/openthaigpt/openthaigpt1.5-7b-instruct) | ผู้ทำโมเดล | OpenThaiGPT 1.5 7B | ไม่ตรง (ข้อสอบปรนัย) |

- SEA-HELM: งานแปลทั้ง 3 ตัวได้ราว 92 เท่ากัน แปลว่างานแปลแยกโมเดลกลุ่มนี้ไม่ออก งานสรุปได้ 22-23 เท่ากันหมด
- SEA-HELM เปิดโหมดคิดของ Qwen3.5 และ Gemma 4 ซึ่งต่างจากที่เราทดสอบ (ปิดโหมดคิด)
- ตัวเลขจากการ์ด Typhoon อ่านจากรูปภาพ ควรเช็กกับการ์ดอีกครั้งก่อนเผยแพร่

## แหล่งที่ดูแล้วใช้ไม่ได้

- [ThaiLLM Leaderboard](https://huggingface.co/spaces/ThaiLLM-Leaderboard/leaderboard): Space พัง ผลล่าสุดประมาณ ส.ค. 2024 ไม่มีโมเดลของเรา
- [ThaiExam บน HELM](https://crfm.stanford.edu/2024/09/04/thaiexam.html): มีแต่โมเดลรุ่นเก่า
- [Typhoon 2 tech report](https://arxiv.org/abs/2412.13702): มีแต่ Typhoon 2 รุ่นเก่า
- [WangchanThaiInstruct](https://arxiv.org/abs/2508.15239): ไม่มีโมเดลของเรา แต่นำมาใช้เป็นชุดทดสอบเพิ่มได้ในอนาคต
- [TGAT](https://dspace.kmitl.ac.th/handle/123456789/20441): ชุดข้อมูลตรวจจับการแต่งข้อมูลภาษาไทย ทดสอบตัวตรวจจับ ไม่ใช่โมเดลแชท
- CTFL-GEC: เป็นการแก้ภาษาอังกฤษที่คนไทยเขียน ไม่ใช่ตรวจคำผิดภาษาไทย
- [Artificial Analysis Multilingual](https://artificialanalysis.ai/models/multilingual): ไม่มีภาษาไทย
- LMArena: ไม่มีผลแยกภาษาไทย และแทบไม่มีโมเดลตัวเล็ก
