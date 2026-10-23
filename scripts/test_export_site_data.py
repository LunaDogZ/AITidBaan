"""python3 -m unittest scripts/test_export_site_data.py"""

import unittest

from export_site_data import merge

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


if __name__ == "__main__":
    unittest.main()
