#!/usr/bin/env python3
"""Build a small natural-voice pilot for Noma using Apache-2.0 Kokoro.

Generated MP3s contain fixed Beta 1 phrases only. No user data is accessed.
Run on a GitHub-hosted Ubuntu runner with Python, Kokoro, espeak-ng, ffmpeg.
"""
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

ROOT = Path(__file__).resolve().parent
catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
items = {x["id"]: x for x in catalog["items"]}
out = ROOT / "neural-preview"
out.mkdir(parents=True, exist_ok=True)
samples = [1, 8, 54]

for lang_code, voice, label in [
    ("b", "bf_emma", "british"),
    ("a", "af_heart", "american"),
]:
    pipeline = KPipeline(lang_code=lang_code)
    for item_id in samples:
        source = items[item_id]["sentence"]
        print(f"Generating {label}/{item_id}: {source}", flush=True)
        segments = []
        for graphemes, phonemes, audio in pipeline(source, voice=voice, speed=0.97):
            if hasattr(audio, "detach"):
                audio = audio.detach().cpu().numpy()
            segments.append(np.asarray(audio, dtype=np.float32))
        if not segments:
            raise RuntimeError(f"No audio from Kokoro for {label}/{item_id}")
        signal = np.concatenate(segments)
        if signal.size < 3000:
            raise RuntimeError(f"Unexpectedly short output for {label}/{item_id}")
        destination = out / f"{label}-{item_id}.mp3"
        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "sample.wav"
            sf.write(wav, signal, 24000)
            subprocess.run(
                ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                 "-i", str(wav), "-ar", "24000", "-ac", "1",
                 "-codec:a", "libmp3lame", "-q:a", "4", str(destination)],
                check=True
            )
        if destination.stat().st_size < 1000:
            raise RuntimeError(f"Invalid MP3: {destination}")
        print(f"OK {destination.name} ({destination.stat().st_size} bytes)", flush=True)
print("Neural audio pilot completed: 6 clips")
