<p>
  <a href="https://aitidbaan.pages.dev">
    <img alt="AITidBaan — AI ออฟไลน์ภาษาไทยสำหรับงานเอกสาร" src="site/public/og.png" width="600">
  </a>
</p>

<a id="thai"></a>

# AITidBaan (AI ติดบ้าน)

**ภาษาไทย** · [English](#english)

ให้ AI อยู่ในเครื่องคุณ ไม่ต้องส่งเอกสารลับขึ้น Cloud

👉 **[เปิดเว็บ aitidbaan.pages.dev](https://aitidbaan.pages.dev)**

## แนวคิด

บริษัทจำนวนมากไม่ให้ส่งเอกสารขึ้น ChatGPT เพราะข้อมูลเป็นความลับ ทางออกคือ **AI ออฟไลน์** (Local LLM) ที่รันบนคอมของคุณเอง แต่สำหรับคนทั่วไปยังยากเกินไป เพราะ:

- ศัพท์อย่าง 7B, Q4, GGUF, VRAM ทำให้ถอยตั้งแต่แรก
- ไม่มีใครบอกว่าโมเดลไหนทำงานเอกสารภาษาไทยได้จริง

AITidBaan สอนแนวคิดของ AI ออฟไลน์ด้วยภาษาง่ายๆ แล้วพาทำทีละขั้น ตั้งแต่เช็กเครื่อง เลือกโมเดล ติดตั้ง จนตัดเน็ตแล้วยังใช้ได้

## วิสัยทัศน์

คนทำงานออฟฟิศทุกคนควรใช้ AI กับเอกสารงานได้ โดยข้อมูลไม่ออกจากเครื่อง

- **ฟรีและเป็นภาษาไทย** สำหรับมือใหม่ ไม่ใช่สายเทค
- **ให้คำตอบเดียว** ไม่โยนตารางให้เลือกเอง
- **โปร่งใส** ทุกผลที่เว็บใช้ตรวจย้อนได้ใน repo นี้

## ผลทดสอบภาษาไทย

เราวัดเองกับงานเอกสารออฟฟิศ ได้แก่ สรุปเอกสาร ปรับเป็นภาษาทางการ ตรวจคำผิด ดึงข้อมูล แปล และจัดรายงานการประชุม เอกสารทุกฉบับแต่งขึ้นเพื่อทดสอบ

<details>
<summary><strong>วัดอย่างไร</strong></summary>

1. ส่งข้อสอบ ([`testset/`](testset/)) ให้ทุกโมเดลด้วยค่าตั้งเดียวกัน คำตอบดิบอยู่ที่ [`results/raw/`](results/raw/)
2. ซ่อนชื่อโมเดล แล้วให้ AI (Claude) ประเมินเป็น 3 ระดับ: ใช้ได้เลย / ต้องแก้นิดหน่อย / ใช้ไม่ได้ ตาม[เกณฑ์นี้](docs/eval/ai-judge.md)
3. AI อีก 2 ตัวสุ่มตรวจ ไม่พบจุดที่ประเมินผิด ([ผลสุ่มตรวจ](results/ai-judge/spot-check.md))

**ข้อจำกัด:** ผู้ประเมินเป็น AI ไม่ใช่คน ชุดทดสอบยังเล็ก ความเร็วส่วนใหญ่เป็นค่าประมาณ และคู่มือมีแค่ Windows

</details>

## ร่วมพัฒนา

โปรเจกต์นี้ทำโดยคนคนเดียวที่ยังเรียนรู้อยู่ เปิดเป็น open source เพื่อให้คนที่รู้จริงช่วยกันเสริม

- **ไม่ต้องเขียนโค้ด:** เปิด [Issue](https://github.com/LunaDogZ/AITidBaan/issues) บอกว่าไม่เห็นด้วยกับผลประเมินข้อไหน ติดขั้นไหน หรือควรทดสอบโมเดลไทยตัวไหนเพิ่ม
- **ส่ง Pull Request:** วัดความเร็วจริงบน Windows, รันทดสอบโมเดลใหม่, เพิ่มข้อสอบ, ให้คะแนนแบบคนเพื่อเทียบกับ AI หรือเขียนคู่มือ Mac

อ่าน [`PRD.md`](PRD.md) และ [`GLOSSARY.md`](GLOSSARY.md) ก่อนเริ่ม

<details>
<summary><strong>รันบนเครื่อง</strong></summary>

เว็บ (Node ตาม [`site/.node-version`](site/.node-version))

```bash
cd site && npm install
npm run dev     # หยุดด้วย npx astro dev stop
npm test
```

ทดสอบโมเดล (ต้องมี [LM Studio](https://lmstudio.ai) และ Python 3)

```bash
~/.lmstudio/bin/lms load <model-key> --context-length 8192 --parallel 1 --identifier <model-key>
~/.lmstudio/bin/lms server start
python3 scripts/run_tests.py <model-key>
```

ห้ามรัน `scripts/blind.py` ซ้ำ เพราะป้ายซ่อนชื่อจะสลับใหม่ แล้วผลประเมินเดิมจะจับคู่กับโมเดลผิด

</details>

## สัญญาอนุญาต

โค้ดใช้ [MIT](LICENSE) ส่วนข้อสอบ คำตอบ และผลประเมิน (`testset/`, `results/`) ใช้ [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) ([เหตุผล](docs/adr/0001-public-test-set-and-outputs.md))

ทำโดย [LunaDogZ](https://github.com/LunaDogZ)

---

<a id="english"></a>

# AITidBaan (English)

[ภาษาไทย](#thai) · **English**

Keep AI at home on your computer. No need to send confidential documents to the cloud.

👉 **[Open aitidbaan.pages.dev](https://aitidbaan.pages.dev/en/)**

## The idea

Many companies don't allow documents to go into ChatGPT, because the data is confidential. The answer is **offline AI** (a local LLM) running on your own computer. For most people it's still too hard, because:

- Terms like 7B, Q4, GGUF and VRAM scare them off
- Nobody says which models actually handle Thai documents well

AITidBaan explains offline AI in plain language and walks you through it step by step: check your computer, pick a model, install it, then turn off the internet and see it still works.

## Vision

Every office worker should be able to use AI on work documents without the data leaving their computer.

- **Free and in Thai**, for beginners, not tech people
- **One answer**, not a table to choose from
- **Transparent**: every result the site uses can be checked in this repo

## Thai test results

We test office document tasks ourselves: summarizing, rewriting formally, spell-checking, extracting data, translating and writing meeting minutes. All documents were written for the test.

<details>
<summary><strong>How it's measured</strong></summary>

1. Every model gets the test items ([`testset/`](testset/)) with identical settings. Raw answers are in [`results/raw/`](results/raw/).
2. Model names are hidden, then an AI (Claude) rates each answer: usable as is / needs small fixes / unusable, using [these rules](docs/eval/ai-judge.md) (Thai).
3. Two more AI agents spot-checked the ratings and found no errors ([spot check](results/ai-judge/spot-check.md), Thai).

**Limitations:** the rater is an AI, not a person. The test set is small, most speeds are estimates, and the guide covers Windows only.

</details>

## Contributing

This project is made by one person who is still learning. It's open source so people who know more can help improve it.

- **No code needed:** open an [Issue](https://github.com/LunaDogZ/AITidBaan/issues) to dispute a rating, report where you got stuck, or suggest a Thai-trained model to test.
- **Send a Pull Request:** measure real speeds on Windows, test a new model, add test items, add human ratings to compare with the AI, or write a Mac guide.

Read [`PRD.md`](PRD.md) and [`GLOSSARY.md`](GLOSSARY.md) (Thai) before starting.

<details>
<summary><strong>Run locally</strong></summary>

Website (Node version in [`site/.node-version`](site/.node-version))

```bash
cd site && npm install
npm run dev     # stop with npx astro dev stop
npm test
```

Testing a model (requires [LM Studio](https://lmstudio.ai) and Python 3)

```bash
~/.lmstudio/bin/lms load <model-key> --context-length 8192 --parallel 1 --identifier <model-key>
~/.lmstudio/bin/lms server start
python3 scripts/run_tests.py <model-key>
```

Don't re-run `scripts/blind.py`. It reshuffles the hidden labels, and existing ratings would be matched to the wrong models.

</details>

## License

Code is [MIT](LICENSE). Test items, answers and ratings (`testset/`, `results/`) are [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) ([why](docs/adr/0001-public-test-set-and-outputs.md)).

Made by [LunaDogZ](https://github.com/LunaDogZ)
