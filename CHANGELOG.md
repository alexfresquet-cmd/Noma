# Changelog

## v0.17
- Recurrent errors with one successful recovery now remain visible as **Mejorando · 1/2**.
- Fixed the `left` counter after successful Forget Me recalls.
- A correct Word recall now credits missing recognition; a correct Sentence recall credits missing production.
- This prevents previously failed units from remaining permanently pending after successful recovery.
- Preserves the v4 data schema and v0.16 progress.

## v0.16
- Merged Wrong Book into Forget Me.
- Removed the separate Wrong Book card and screen.
- Forget Me now has three sections: Por repasar, Recurrentes and Resueltos.
- Recurrent Word/Sentence errors remain highlighted until two later successful recalls.
- Recurrent items continue to receive delayed verification until resolved.
- Listen Once and Pronounce remain review-only and do not create recurring language-pattern entries.
- Preserves the v4 data schema and existing v0.15 diagnostic data.

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