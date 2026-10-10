#!/usr/bin/env python3
"""Build deterministic static audio for Noma's 100 audited Beta 1 units.

Requires: espeak-ng and ffmpeg on the GitHub Actions Ubuntu runner.
Audio clips are generated at publish-time and never expose the user's progress.
"""
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
items = data["items"]
if len(items) != 100 or {x["id"] for x in items} != set(range(1, 101)):
    raise SystemExit("Invalid catalog: expected 100 unique stable IDs")
for group, field, speed in [("listen", "sentence", 137), ("pronounce", "term", 125)]:
    out = ROOT / group
    out.mkdir(exist_ok=True)
    for item in items:
        words = item[field].strip()
        if not words or len(words) > 450:
            raise SystemExit(f"Invalid content for {group} unit {item['id']}")
        dest = out / f"{item['id']}.mp3"
        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "tts.wav"
            subprocess.run(["espeak-ng", "-v", "en-gb", "-s", str(speed), "-p", "52",
                            "-w", str(wav), words], check=True, stdout=subprocess.DEVNULL)
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                            "-i", str(wav), "-ar", "24000", "-ac", "1",
                            "-codec:a", "libmp3lame", "-q:a", "6", str(dest)], check=True)
        if dest.stat().st_size < 350:
            raise SystemExit(f"Unexpectedly short file: {dest}")
    print(f"Created {len(items)} {group} MP3 clips")
