"""รวมผลประเมินจากผู้ให้คะแนน 2 คนเป็นข้อมูลให้เว็บใช้ (PRD 6.3 ขั้นที่ 5-6 และข้อ 9)

    python3 scripts/export_site_data.py <scores คนที่ 1>.csv <scores คนที่ 2>.csv

อ่าน results/blind/key.json เพื่อแปลงป้าย ก ข ค ... กลับเป็นโมเดล แล้วเขียน site/src/data/ratings.json
key.json ไม่อยู่ใน git (.gitignore) มีแค่ในเครื่องที่รัน blind.py ต้องสำรองไว้เอง ถ้าหายจะจับคู่ผลกับโมเดลไม่ได้
และสร้างใหม่ไม่ได้ เพราะ blind.py สลับป้ายใหม่ ผลที่ผู้ให้คะแนนกรอกไปแล้วจะใช้ไม่ได้
- สองคนให้ไม่ตรงกัน ใช้ระดับที่ต่ำกว่า
- ได้ "แดง" ในข้อหลอก (TRAPS) ถือว่าโมเดลเคยแต่งข้อมูลที่ไม่มีในเอกสาร (trapFail)
- ช่องว่างหรือกรอกคำอื่นจะหยุดและบอกว่าข้อไหน ป้ายไหน
- แถวซ้ำ (id + ป้ายเดียวกัน) ผลตรงกันจะเตือน ผลขัดกันจะหยุด พร้อมบอกเลขบรรทัด
- อ่านไฟล์ UTF-8 ก่อน ไม่ได้จึงลอง cp874 (Excel ภาษาไทยเซฟ CSV ธรรมดาเป็นแบบนี้)
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


def grades(sheet, name):
    out, lines = {}, {}
    for i, row in enumerate(sheet):
        # แถวที่ช่องไม่ครบ csv ให้ช่องที่ขาดเป็น None ถือเป็นช่องว่าง merge จะหยุดและบอกว่าข้อไหน
        cell = lambda k: (row.get(k) or "").strip()
        item, label = cell("id"), cell("คำตอบ")
        level, line = LEVEL.get(cell(GRADE)), row.get("_line", i + 2)
        if (item, label) in out:
            where = f"{name}: {item} {label} ซ้ำที่บรรทัด {lines[(item, label)]} และ {line}"
            if out[(item, label)] != level:
                raise ValueError(f"{where} ผลประเมินไม่ตรงกัน แก้ให้เหลือแถวเดียว")
            print(f"เตือน {where} (ผลเหมือนกัน ใช้ได้)", file=sys.stderr)
            continue
        out[(item, label)], lines[(item, label)] = level, line
    return out


def merge(sheet_a, sheet_b, key, names=("ไฟล์ที่ 1", "ไฟล์ที่ 2")):
    a, b = grades(sheet_a, names[0]), grades(sheet_b, names[1])
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
    """อ่านแถวพร้อมเลขบรรทัดในไฟล์ (_line) ช่องหมายเหตุที่ขึ้นบรรทัดใหม่ก็ยังนับตรง"""
    for encoding in ("utf-8-sig", "cp874"):
        try:
            with open(path, encoding=encoding, newline="") as f:
                reader = csv.DictReader(f)
                rows, start = [], 2
                for row in reader:
                    row["_line"] = start
                    rows.append(row)
                    start = reader.line_num + 1
                return rows
        except UnicodeDecodeError:
            continue
    raise ValueError(f"อ่านไฟล์ {path} ไม่ได้ (ไม่ใช่ UTF-8 หรือ cp874) "
                     'เปิดใน Excel แล้วเซฟใหม่เป็น "CSV UTF-8 (Comma delimited)"')


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    try:
        sheets = read_sheet(sys.argv[1]), read_sheet(sys.argv[2])
        if not KEY.exists():
            raise ValueError(f"ไม่เจอ {KEY} ไฟล์นี้ไม่อยู่ใน git ต้องเอาจากที่สำรองไว้มาวาง "
                             "ห้ามรัน blind.py ใหม่ เพราะป้ายจะสลับใหม่ ผลที่กรอกไปแล้วจะจับคู่ผิด")
        key = json.loads(KEY.read_text(encoding="utf-8"))
        models = merge(*sheets, key, names=(sys.argv[1], sys.argv[2]))
    except ValueError as e:
        sys.exit(str(e))
    OUT.write_text(json.dumps({"sample": False, "models": models}, ensure_ascii=False, indent=1) + "\n",
                   encoding="utf-8")
    print(f"เขียน {OUT.relative_to(ROOT)} แล้ว ({len(models)} โมเดล)")


if __name__ == "__main__":
    main()
