"""สลับลำดับคำตอบและซ่อนชื่อโมเดลก่อนส่งให้ผู้ให้คะแนน (PRD 6.3 ขั้นที่ 4)

    python3 scripts/blind.py

อ่าน results/raw/<model>/<id>.json แล้วเขียน
    results/blind/sheets/<id>.md  คำสั่ง เอกสารต้นทาง แนวคำตอบ (ตัดบรรทัด "ความยาก:") และคำตอบที่ติดป้าย ก ข ค ...
    results/blind/scores.csv      แบบฟอร์มเปล่า ผู้ให้คะแนนแต่ละคนคัดลอกไปกรอกแยกกัน
    results/blind/key.json        ป้ายไหนคือโมเดลอะไร ผู้ให้คะแนนห้ามเปิด

ถ้ามี key.json อยู่แล้วจะไม่ทำอะไร เพราะสลับใหม่แล้วผลที่กรอกไปจะจับคู่ผิด ลบโฟลเดอร์ results/blind เองก่อนถ้าจะสร้างใหม่
"""

import csv
import json
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TESTSET = ROOT / "testset"
RAW = ROOT / "results" / "raw"
OUT = ROOT / "results" / "blind"
LABELS = "กขคงจฉชซ"


def load_item(path):
    """แยกไฟล์ชุดทดสอบเป็น (id, ส่วนเนื้อหาสำหรับผู้ให้คะแนน) โดยตัดบรรทัด "ความยาก:" ออก"""
    text = path.read_text(encoding="utf-8")
    _, front, body = text.split("---\n", 2)
    item_id = next(line.split(":", 1)[1].strip()
                   for line in front.splitlines() if line.startswith("id:"))
    body = "\n".join(line for line in body.splitlines()
                     if not line.startswith("ความยาก:"))
    return item_id, body.strip()


def strip_thinking(answer):
    """ตัดส่วนที่โมเดลคิดออก (PRD 6.3) สำหรับโมเดลที่ปิดโหมดคิดไม่ได้"""
    return re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()


def main():
    if (OUT / "key.json").exists():
        sys.exit(f"มี {OUT / 'key.json'} อยู่แล้ว ไม่สลับใหม่ (ดูคำอธิบายบนสุดของสคริปต์)")
    (OUT / "sheets").mkdir(parents=True, exist_ok=True)

    models = sorted(d.name for d in RAW.iterdir() if d.is_dir())
    rng = random.SystemRandom()
    key = {}
    rows = []
    for path in sorted(TESTSET.glob("*/*.md")):
        item_id, body = load_item(path)
        answers = []
        for model in models:
            raw_file = RAW / model / f"{item_id}.json"
            if not raw_file.exists():
                print(f"ข้าม {model} ข้อ {item_id}: ยังไม่มีคำตอบ")
                continue
            answer = json.loads(raw_file.read_text(encoding="utf-8"))["answer"]
            answers.append((model, strip_thinking(answer)))
        rng.shuffle(answers)

        key[item_id] = {}
        parts = [f"# {item_id}", body]
        for label, (model, answer) in zip(LABELS, answers):
            key[item_id][label] = model
            parts.append(f"---\n\n## คำตอบ {label}\n\n{answer}")
            rows.append([item_id, label, "", ""])
        (OUT / "sheets" / f"{item_id}.md").write_text(
            "\n\n".join(parts) + "\n", encoding="utf-8")

    with open(OUT / "scores.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "คำตอบ", "ผลประเมิน (เขียว/เหลือง/แดง)", "หมายเหตุ"])
        writer.writerows(rows)
    (OUT / "key.json").write_text(
        json.dumps(key, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(key)} ข้อ × {len(models)} โมเดล → {OUT}")


if __name__ == "__main__":
    main()
