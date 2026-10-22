"""รันชุดทดสอบทั้งหมดกับโมเดลหนึ่งตัวผ่าน local server ของ LM Studio (PRD 6.3 ขั้นที่ 3)

ก่อนรัน: โหลดโมเดลด้วย context length ตาม CONTEXT_LENGTH แล้วเปิด server
    lms load <model-key> --context-length 8192 --identifier <model-key>
    lms server start

    python3 scripts/run_tests.py <model-key>

คำตอบดิบเก็บที่ results/raw/<model-key>/<id>.json ข้อที่มีไฟล์อยู่แล้วจะข้าม (รันต่อจากเดิมได้)
"""

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TESTSET = ROOT / "testset"
SERVER = "http://localhost:1234"

# ตั้งค่าเท่ากันทุกโมเดล และเปิดเผยคู่กับผลทดสอบ (PRD 6.3)
CONTEXT_LENGTH = 8192  # ตั้งตอน lms load ไม่ได้ส่งใน request
PARAMS = {
    "temperature": 0.3,
    "top_p": 0.9,
    "top_k": 40,
    "max_tokens": 2048,
    "seed": 42,
    # ปิดโหมดคิด (PRD 6.3) LM Studio เปิดให้ Gemma 4 เองแม้ template ตั้งปิด โมเดลที่ไม่มีโหมดคิดไม่มีผล
    "reasoning_effort": "none",
}


def load_item(path):
    """แยกไฟล์ชุดทดสอบเป็น (id, ข้อความที่ส่งให้โมเดล) ส่วนแนวคำตอบไม่ส่ง"""
    text = path.read_text(encoding="utf-8")
    _, front, body = text.split("---\n", 2)
    item_id = next(line.split(":", 1)[1].strip()
                   for line in front.splitlines() if line.startswith("id:"))
    body = body.split("## แนวคำตอบ")[0]
    instruction, source = body.split("## เอกสารต้นทาง")
    instruction = instruction.replace("## คำสั่ง", "", 1).strip()
    return item_id, instruction + "\n\n" + source.strip()


def ask(model, prompt):
    request = urllib.request.Request(
        f"{SERVER}/api/v0/chat/completions",
        data=json.dumps({
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            **PARAMS,
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=3600) as response:
        return json.load(response)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    model = sys.argv[1]
    out_dir = ROOT / "results" / "raw" / model
    out_dir.mkdir(parents=True, exist_ok=True)

    for path in sorted(TESTSET.glob("*/*.md")):
        item_id, prompt = load_item(path)
        out_file = out_dir / f"{item_id}.json"
        if out_file.exists():
            continue
        print(f"{item_id} ...", end=" ", flush=True)
        response = ask(model, prompt)
        out_file.write_text(json.dumps({
            "id": item_id,
            "model": model,
            "context_length": CONTEXT_LENGTH,
            "params": PARAMS,
            "prompt": prompt,
            "answer": response["choices"][0]["message"]["content"],
            "stats": response.get("stats"),
            "model_info": response.get("model_info"),
            "runtime": response.get("runtime"),
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{(response.get('stats') or {}).get('tokens_per_second', '?')} token/s")


if __name__ == "__main__":
    main()
