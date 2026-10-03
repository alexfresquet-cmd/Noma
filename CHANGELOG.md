# Changelog

## v0.15
- Added Wrong Book.
- Tracks Word and Sentence failures separately.
- First failure stays in observation; the second makes it recurrent.
- Two later correct answers resolve the entry.
- Added Recurrent, In observation and Resolved sections.
- Added Wrong Book summary to Home and Progress.
- Data schema updated from v3 to v4 with migration preserving existing progress.
- Historical v0.14 mistakes are not backfilled because their exact mode was not stored.

## v0.14
- Pronounce requires a secure HTTPS context and uses direct browser speech recognition.
- Removed Gboard/keyboard-dictation fallback entirely.
- Added explicit environment/permission messages for microphone recognition.
- Preserves the v0.13 learning state schema.

## v0.13
- Added Pronounce MVP.