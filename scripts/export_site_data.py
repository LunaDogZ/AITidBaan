"""รวมผลประเมินจากผู้ให้คะแนน 2 คนเป็นข้อมูลให้เว็บใช้ (PRD 6.3 ขั้นที่ 5-6 และข้อ 9)

    python3 scripts/export_site_data.py <scores คนที่ 1>.csv <scores คนที่ 2>.csv

อ่าน results/blind/key.json เพื่อแปลงป้าย ก ข ค ... กลับเป็นโมเดล แล้วเขียน site/src/data/ratings.json
- สองคนให้ไม่ตรงกัน ใช้ระดับที่ต่ำกว่า
- ได้ "แดง" ในข้อหลอก (TRAPS) ถือว่าโมเดลเคยแต่งข้อมูลที่ไม่มีในเอกสาร (trapFail)
- ช่องว่างหรือกรอกคำอื่นจะหยุดและบอกว่าข้อไหน ป้ายไหน
"""

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEY = ROOT / "results" / "blind" / "key.json"
OUT = ROOT / "site" / "src" / "data" / "ratings.json"
GRADE = "ผลประเมิน (เขียว/เหลือง/แดง)"
# ระดับน้อยกว่า = แย่กว่า
LEVEL = {"แดง": 0, "เหลือง": 1, "เขียว": 2}
FIELD = {0: "bad", 1: "minor", 2: "good"}
# ข้อที่คำตอบถูกคือ "ไม่มีระบุในเอกสาร" (testset/extraction/)
TRAPS = {"extraction-04", "extraction-05"}


def grades(sheet):
    out = {}
    for row in sheet:
        item, label = row["id"].strip(), row["คำตอบ"].strip()
        out[(item, label)] = LEVEL.get(row[GRADE].strip())
    return out


def merge(sheet_a, sheet_b, key):
    a, b = grades(sheet_a), grades(sheet_b)
    models = {}
    for item, labels in key.items():
        task = item.rsplit("-", 1)[0]
        for label, model in labels.items():
            ga, gb = a.get((item, label)), b.get((item, label))
            if ga is None or gb is None:
                raise ValueError(f"ผลประเมินไม่ครบหรือกรอกผิด: {item} {label} (ต้องเป็น เขียว/เหลือง/แดง)")
            level = min(ga, gb)
            m = models.setdefault(model, {"ratings": {}, "trapFail": False})
            counts = m["ratings"].setdefault(task, {"good": 0, "minor": 0, "bad": 0})
            counts[FIELD[level]] += 1
            if item in TRAPS and level == 0:
                m["trapFail"] = True
    return models


def read_sheet(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    key = json.loads(KEY.read_text(encoding="utf-8"))
    models = merge(read_sheet(sys.argv[1]), read_sheet(sys.argv[2]), key)
    OUT.write_text(json.dumps({"sample": False, "models": models}, ensure_ascii=False, indent=1) + "\n",
                   encoding="utf-8")
    print(f"เขียน {OUT.relative_to(ROOT)} แล้ว ({len(models)} โมเดล)")


if __name__ == "__main__":
    main()
