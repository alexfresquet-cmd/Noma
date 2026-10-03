# Changelog

## v0.19
- Replaced the ambiguous single `left` display with explicit Word, Sentence and Word + Sentence progress.
- Home now shows the combined Word + Sentence total out of 100.
- Selecting Word or Sentence shows that mode's own completed and pending counts.
- Combined mode shows units completed in both Word and Sentence.
- Done now reports Word, Sentence and combined progress separately.
- Added a visible app version in the top bar to make stale browser builds obvious.
- Added cache-control meta hints for the GitHub Pages prototype.
- Preserves the v4 data schema.

## v0.18
- Fixed the meaning of the `left` counter so it behaves as a real pending-unit counter.
- A first correct answer in Word **or** Sentence now removes that unit from `left`.
- A later failure can put an unstable unit back into `left` until it is recovered.
- Consolidation remains separate and stricter.
- Updated Home, Progress, Pack and Done copy to match the new counter semantics.
- Preserves the v4 data schema; existing local progress is recalculated automatically because `left` is derived from unit state.

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