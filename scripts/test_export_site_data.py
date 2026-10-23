"""python3 -m unittest scripts/test_export_site_data.py"""

import contextlib
import io
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import export_site_data
from export_site_data import merge, read_sheet

GRADE = "ผลประเมิน (เขียว/เหลือง/แดง)"
KEY = {
    "summary-01": {"ก": "model-a", "ข": "model-b"},
    "extraction-04": {"ก": "model-b", "ข": "model-a"},
}


def rows(*cells):
    """cells: (id, ป้าย, ผลประเมิน) แบบเดียวกับแถวใน scores.csv"""
    return [{"id": i, "คำตอบ": label, GRADE: grade, "หมายเหตุ": ""} for i, label, grade in cells]


class MergeTest(unittest.TestCase):
    def test_maps_labels_to_models_and_counts_per_task(self):
        sheet = rows(("summary-01", "ก", "เขียว"), ("summary-01", "ข", "เหลือง"),
                     ("extraction-04", "ก", "เขียว"), ("extraction-04", "ข", "เขียว"))
        out = merge(sheet, sheet, KEY)
        self.assertEqual(out["model-a"]["ratings"]["summary"], {"good": 1, "minor": 0, "bad": 0})
        self.assertEqual(out["model-b"]["ratings"]["summary"], {"good": 0, "minor": 1, "bad": 0})
        self.assertEqual(out["model-a"]["ratings"]["extraction"], {"good": 1, "minor": 0, "bad": 0})

    def test_disagreement_takes_the_lower_grade(self):
        a = rows(("summary-01", "ก", "เขียว"), ("summary-01", "ข", "เหลือง"),
                 ("extraction-04", "ก", "เขียว"), ("extraction-04", "ข", "เขียว"))
        b = rows(("summary-01", "ก", "เหลือง"), ("summary-01", "ข", "แดง"),
                 ("extraction-04", "ก", "เขียว"), ("extraction-04", "ข", "เขียว"))
        out = merge(a, b, KEY)
        self.assertEqual(out["model-a"]["ratings"]["summary"], {"good": 0, "minor": 1, "bad": 0})
        self.assertEqual(out["model-b"]["ratings"]["summary"], {"good": 0, "minor": 0, "bad": 1})

    def test_red_on_trap_question_marks_model(self):
        sheet = rows(("summary-01", "ก", "เขียว"), ("summary-01", "ข", "เขียว"),
                     ("extraction-04", "ก", "แดง"), ("extraction-04", "ข", "เหลือง"))
        out = merge(sheet, sheet, KEY)
        self.assertTrue(out["model-b"]["trapFail"])
        self.assertFalse(out["model-a"]["trapFail"])

    def test_red_on_ordinary_question_is_not_trap_fail(self):
        sheet = rows(("summary-01", "ก", "แดง"), ("summary-01", "ข", "เขียว"),
                     ("extraction-04", "ก", "เขียว"), ("extraction-04", "ข", "เขียว"))
        self.assertFalse(merge(sheet, sheet, KEY)["model-a"]["trapFail"])

    def test_blank_or_unknown_grade_stops_with_item_and_label(self):
        good = rows(("summary-01", "ก", "เขียว"), ("summary-01", "ข", "เขียว"),
                    ("extraction-04", "ก", "เขียว"), ("extraction-04", "ข", "เขียว"))
        bad = rows(("summary-01", "ก", "เขียว"), ("summary-01", "ข", ""),
                   ("extraction-04", "ก", "เขียว"), ("extraction-04", "ข", "ฟ้า"))
        with self.assertRaisesRegex(ValueError, "summary-01 ข"):
            merge(good, bad, KEY)

    def test_missing_row_stops(self):
        full = rows(("summary-01", "ก", "เขียว"), ("summary-01", "ข", "เขียว"),
                    ("extraction-04", "ก", "เขียว"), ("extraction-04", "ข", "เขียว"))
        with self.assertRaisesRegex(ValueError, "extraction-04 ข"):
            merge(full, full[:3], KEY)


    def test_duplicate_row_with_same_grade_warns_with_line_numbers(self):
        sheet = rows(("summary-01", "ก", "เขียว"), ("summary-01", "ข", "เขียว"),
                     ("extraction-04", "ก", "เขียว"), ("extraction-04", "ข", "เขียว"),
                     ("summary-01", "ก", "เขียว"))
        err = io.StringIO()
        with contextlib.redirect_stderr(err):
            out = merge(sheet, sheet, KEY)
        self.assertEqual(out["model-a"]["ratings"]["summary"], {"good": 1, "minor": 0, "bad": 0})
        self.assertIn("summary-01 ก", err.getvalue())
        self.assertIn("บรรทัด 2 และ 6", err.getvalue())

    def test_duplicate_row_with_conflicting_grade_stops_with_line_numbers(self):
        sheet = rows(("summary-01", "ก", "เขียว"), ("summary-01", "ข", "เขียว"),
                     ("extraction-04", "ก", "เขียว"), ("extraction-04", "ข", "เขียว"),
                     ("summary-01", "ก", "แดง"))
        with self.assertRaisesRegex(ValueError, "summary-01 ก.*บรรทัด 2 และ 6"):
            merge(sheet, sheet, KEY)


CSV = "id,คำตอบ,ผลประเมิน (เขียว/เหลือง/แดง),หมายเหตุ\nsummary-01,ก,เขียว,\"สองบรรทัด\nยังเป็นแถวเดียว\"\nsummary-01,ข,แดง,\n"


class ReadSheetTest(unittest.TestCase):
    def write(self, data):
        f = tempfile.NamedTemporaryFile("wb", suffix=".csv", delete=False)
        f.write(data)
        f.close()
        self.addCleanup(Path(f.name).unlink)
        return f.name

    def test_reads_utf8_with_bom(self):
        sheet = read_sheet(self.write(CSV.encode("utf-8-sig")))
        self.assertEqual([r[GRADE] for r in sheet], ["เขียว", "แดง"])

    def test_reads_cp874_saved_by_thai_excel(self):
        sheet = read_sheet(self.write(CSV.encode("cp874")))
        self.assertEqual([(r["id"], r["คำตอบ"], r[GRADE]) for r in sheet],
                         [("summary-01", "ก", "เขียว"), ("summary-01", "ข", "แดง")])

    def test_line_numbers_follow_the_file_even_with_multiline_notes(self):
        sheet = read_sheet(self.write(CSV.encode("utf-8")))
        self.assertEqual([r["_line"] for r in sheet], [2, 4])

    def test_unreadable_encoding_names_the_file_and_suggests_csv_utf8(self):
        path = self.write(b"id,\xff\xfe\xdb\xdc\n")
        with self.assertRaisesRegex(ValueError, "CSV UTF-8") as ctx:
            read_sheet(path)
        self.assertIn(path, str(ctx.exception))

    def test_main_reports_bad_file_without_traceback(self):
        path = self.write(b"\xff\xfe\xdb\xdc")
        with mock.patch("sys.argv", ["export_site_data.py", path, path]), \
                self.assertRaises(SystemExit) as ctx:
            export_site_data.main()
        self.assertIn("CSV UTF-8", str(ctx.exception.code))

    def test_main_missing_key_explains_it_is_not_in_git(self):
        path = self.write(CSV.encode("utf-8"))
        with mock.patch("sys.argv", ["export_site_data.py", path, path]), \
                mock.patch.object(export_site_data, "KEY", Path(path).with_name("ไม่มีไฟล์นี้.json")), \
                self.assertRaises(SystemExit) as ctx:
            export_site_data.main()
        self.assertIn("ไม่อยู่ใน git", str(ctx.exception.code))
        self.assertIn("สำรอง", str(ctx.exception.code))


if __name__ == "__main__":
    unittest.main()
