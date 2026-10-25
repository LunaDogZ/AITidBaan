# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

AITidBaan (AIติดบ้าน): เว็บภาษาไทยที่บอกมือใหม่ว่าโมเดล AI ออฟไลน์ตัวไหนทำงานเอกสารภาษาไทยได้ดีบนเครื่องของเขา แล้วพาติดตั้งจนใช้ได้ ข้อกำหนดอยู่ใน `PRD.md` คำศัพท์ทั้งหมด (ทั้งในหน้าเว็บและในโค้ด) ใช้ตาม `GLOSSARY.md` ซึ่งระบุคำที่ห้ามใช้ไว้ด้วย

ทั้ง repo เขียนคอมเมนต์ docstring และ commit message เป็นภาษาไทย

## โครงสร้าง

repo มีสองส่วนที่เชื่อมกันด้วยไฟล์ JSON

1. **ส่วนวัดผล (Python ไม่มี dependency)** อยู่ที่ `testset/` และ `scripts/` ส่วนผลอยู่ที่ `results/`
2. **เว็บ (Astro)** อยู่ที่ `site/` อ่านผลจาก `site/src/data/*.json`

### ขั้นตอนวัดผล (PRD 6.3)

```
testset/<งาน>/<id>.md ──run_tests.py──▶ results/raw/<model>/<id>.json
                       ──blind.py────▶ results/blind/{sheets/, scores.csv, key.json}
scores ที่กรอกแล้ว 2 ไฟล์ ──export_site_data.py──▶ site/src/data/ratings.json
```

- `run_tests.py <model>` ส่งข้อสอบไปที่ LM Studio (`localhost:1234`) โดยไม่ส่งส่วน `## แนวคำตอบ` ไปด้วย ค่า `PARAMS` ใช้ค่าเดียวกันทุกโมเดล ข้อที่มีไฟล์ผลอยู่แล้วจะข้าม
- **`results/blind/key.json` ไม่อยู่ใน git** และสร้างใหม่ไม่ได้ ห้ามรัน `blind.py` ใหม่ และห้ามลบ `results/blind/` เพราะป้าย ก ข ค จะสลับใหม่ แล้วคะแนนที่กรอกไปแล้วจะจับคู่กับโมเดลผิด
- `export_site_data.py a.csv b.csv` รวมผลจากผู้ให้คะแนนสองคน ถ้าให้ไม่ตรงกันจะใช้ระดับที่ต่ำกว่า ถ้าตอบ "แดง" ในข้อหลอก (`TRAPS`) จะได้ `trapFail` สคริปต์อ่าน CSV ที่เป็น UTF-8 หรือ cp874 ก็ได้
- ตราบใดที่ `ratings.json` ยังมี `"sample": true` เว็บจะติดป้าย "ข้อมูลตัวอย่าง" (`SAMPLE_DATA` ใน `site/src/data/models.ts`) **ห้ามเปิดเว็บสาธารณะจนกว่าผลนี้จะเป็นผลจริง**

### เว็บ (`site/`)

- ใช้ Astro 7 + React 19 island + Tailwind 4 + TypeScript ไอคอนใช้ Phosphor (ชื่อต้องลงท้ายด้วย `Icon`) ฟอนต์ Anuphan
- **มีสองภาษา**: หน้าอยู่ที่ `src/pages/[...lang]/` (ภาษาไทยอยู่ที่ราก อังกฤษอยู่ใต้ `/en/`) ข้อความเก็บเป็น `{ th, en }` ในไฟล์ที่ใช้ข้อความนั้น ส่วน React ใช้ `useLang()` ลิงก์ภายในต้องผ่าน `href()` ใน `src/i18n.ts` (ฟังก์ชันนี้เติม `/` ท้าย path ให้ตรงกับที่ Cloudflare Pages ใช้) ส่วน `examples.json` คงเป็นภาษาไทยในทั้งสองภาษา
- ตรรกะแนะนำโมเดลอยู่ใน `src/lib/recommend.ts`: คำตอบเรื่องเครื่อง → `machineTier()` → ระดับเครื่อง → เลือกโมเดลจาก ratings ตอบ "ไม่แน่ใจ" จะได้ค่าต่ำสุดที่ยังไม่ใช่ทางตัน (RAM = 8GB, การ์ดจอ = ไม่มี) ค่า `'nvidia'` หมายถึงการ์ดจอแยก NVIDIA หรือ AMD ห้ามเปลี่ยนชื่อ เพราะ localStorage ของผู้ใช้เก็บค่านี้ไว้แล้ว
- วิซาร์ด 6 ขั้นอยู่ที่ `/wizard/#step-N` ความคืบหน้าเก็บใน localStorage key `aitidbaan:wizard` (`src/lib/progress.ts`) ถ้าเปลี่ยนรูปแบบข้อมูลต้องแปลงค่าเก่าให้ใช้ได้ รีโหลดแล้วต้องอยู่ขั้นเดิมที่ตำแหน่งเลื่อนเดิม ส่วนหน้าแรกต้องเริ่มที่ hero เสมอ
- deploy บน Cloudflare Pages (root dir `site`, output `dist`, Node ตาม `site/.node-version`) มี `public/_headers` และ `404.astro`

## คำสั่ง

```bash
cd site
npm run dev                      # Astro 7 รันเป็น daemon หยุดด้วย npx astro dev stop
npm run build
npm run check                    # astro check (type check) ควรได้ 0 error
npm test                         # vitest ทั้งหมด
npx vitest run src/lib/install   # รันเฉพาะไฟล์ที่ชื่อตรง

cd scripts && python3 -m unittest test_export_site_data
```

- ลง dependency ใหม่แล้วต้อง `npx astro dev stop` ตามด้วย `npx astro dev --force` ไม่อย่างนั้นจะเจอ 504 Outdated Optimize Dep
- เทสต์ไฟล์ `.astro` ใช้ Container API ผ่าน `vitest.config.ts` (`getViteConfig`) ดูตัวอย่างที่ `src/components/TaskShowcase.test.ts` ส่วนเทสต์วิซาร์ดใช้ `src/test/ratings.fixture.json` แทนคะแนนจริง
- `run_tests.py` ต้องโหลดโมเดลด้วย `~/.lmstudio/bin/lms load <key> --context-length 8192 --parallel 1 --identifier <key>` และ `lms server start` ก่อน (คำสั่ง `lms` ไม่อยู่ใน PATH) งานที่รันนานให้ผู้ใช้รันเองใน tmux

## git

- origin เป็น private ทำงานบน `main` ห้าม push ถ้าผู้ใช้ไม่ได้สั่ง
- ห้าม commit `results/blind/key.json` และ `results/blind_for_raters.zip`
