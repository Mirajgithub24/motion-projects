"""Transcribe projects/<name>/voiceover.mp3 with word-level timestamps.

Writes projects/<name>/transcript.json:
{ language, duration, model, segments: [{start, end, text, words: [{start, end, word, probability}]}] }
"""
import json
import sys
import time

from faster_whisper import WhisperModel

name, model_name = sys.argv[1], sys.argv[2]
language = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else None
path = f"projects/{name}/voiceover.mp3"

t0 = time.time()
model = WhisperModel(model_name, device="cpu", compute_type="int8")
segments, info = model.transcribe(
    path,
    language=language,
    word_timestamps=True,
    beam_size=5,
    vad_filter=False,
    condition_on_previous_text=False,
)
out = {
    "language": info.language,
    "language_probability": round(info.language_probability, 3),
    "duration": round(info.duration, 3),
    "model": model_name,
    "segments": [],
}
for s in segments:
    out["segments"].append(
        {
            "start": round(s.start, 3),
            "end": round(s.end, 3),
            "text": s.text.strip(),
            "words": [
                {
                    "start": round(w.start, 3),
                    "end": round(w.end, 3),
                    "word": w.word.strip(),
                    "probability": round(w.probability, 3),
                }
                for w in (s.words or [])
            ],
        }
    )
    print(f"[{s.start:7.2f} - {s.end:7.2f}] {s.text.strip()}", flush=True)

with open(f"projects/{name}/transcript.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(f"language={info.language} ({info.language_probability:.2f}) took {time.time() - t0:.0f}s")
