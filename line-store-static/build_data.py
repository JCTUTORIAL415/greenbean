import openpyxl
import json
import re

SOURCES = {
    "quanquan-daxiaohe": {
        "file": "/Users/chenshangyun/Downloads/訂單匯入_拳拳大運河_0815.xlsx",
        "store_name": "拳拳超市 大運河",
    },
    "xiongxiong-donghai": {
        "file": "/Users/chenshangyun/Downloads/訂單匯入_熊熊東海店_0815.xlsx",
        "store_name": "熊熊愛買菜 東海店",
    },
}

def clean_note(note, store_name):
    if not note:
        return ""
    note = str(note)
    note = re.sub(r"^" + re.escape(store_name) + r"[／/]?", "", note)
    note = note.lstrip("／/｜|").strip()
    return note

for key, cfg in SOURCES.items():
    wb = openpyxl.load_workbook(cfg["file"], data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))[1:]
    orders = []
    for i, r in enumerate(rows):
        if not r[0]:
            continue
        name, phone, items, amount, note = r[0], str(r[1]).strip(), r[2], r[3], r[4]
        orders.append({
            "id": f"{key}-{i+1:03d}",
            "name": str(name).strip(),
            "phone4": phone,
            "items": [s.strip() for s in str(items).split("＋")],
            "amount": amount,
            "note": clean_note(note, cfg["store_name"]),
        })
    out = {
        "store_key": key,
        "store_name": cfg["store_name"],
        "orders": orders,
    }
    with open(f"/Users/chenshangyun/line-store-static/{key}/data.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(key, "->", len(orders), "orders")
