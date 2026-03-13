---
name: AI Meeting Notes POC
summary: A Python CLI POC that turns meeting recordings into speaker-attributed notes and action items.
year: 2026
stack:
  - Python
  - OpenAI API
  - pyannote
  - ffmpeg
status: active
accessHref: https://github.com/zulfaza/ai-meeting-notes-poc-py
accessLabel: View source
---

This project explores a narrow but useful workflow: start with a recorded meeting video and end with notes that are easier to scan than the raw conversation. The CLI extracts audio, runs transcription, identifies speaker turns, and writes a summary plus intermediate artifacts to an output folder.

The pipeline is intentionally explicit. ffmpeg converts the source file into a mono 16kHz WAV, whisper-1 handles transcription, pyannote diarization estimates speaker segments, and a small overlap-based merge step assigns the most likely speaker label to each transcript segment.

```mermaid title="Code flow" caption="Pipeline from source video to structured notes and action items."
flowchart TD
  Video[Video File] --> Step1[1. extract_audio]
  Step1 -->|ffmpeg: video to mono 16kHz WAV| Audio[audio.wav]

  Audio --> Step2[2. transcribe]
  Step2 -->|OpenAI whisper-1| Transcript[transcript.json<br/>text segments]

  Audio --> Step3[3. diarize]
  Step3 -->|pyannote/speaker-diarization-3.1<br/>MPS/CUDA/CPU| Diarization[diarization.json<br/>speaker segments]

  Transcript --> Step4[4. assign_speakers<br/>merge.py]
  Diarization --> Step4
  Step4 -->|match by time overlap| Merged[speaker_segments.json<br/>speaker_transcript.txt]

  Merged --> Step5[5. summarize]
  Step5 -->|GPT-5-nano| Summary[summary.md<br/>Meeting Notes]
```

I kept the implementation close to the processing stages so it is easy to inspect or swap pieces. Each step writes structured output, including raw transcript segments, diarization cache, merged speaker segments, a readable speaker transcript, and the final summary markdown.

It is still a POC, not a polished product, but it proves the shape of the workflow and the failure points that matter. The result is a practical baseline for turning long recordings into notes with decisions and action items without manually replaying the whole meeting.
