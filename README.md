# Noma v0.19

Noma is a local-first language-learning prototype built around finite progress: learn, recall, consolidate, and remove what no longer needs attention.

## Current modules
- Word
- Sentence
- Combined practice
- Forget Me
- Listen Once
- Tiny Reader
- Pronounce

## Forget Me
Forget Me now combines review scheduling and recurring-error tracking in one place:

- **Por repasar**: items that will return automatically.
- **Recurrentes**: Word or Sentence errors that have repeated.
- **Resueltos**: recurring errors that later recovered.

A Word/Sentence error becomes recurrent after its second failure. After one successful recovery it remains visible as **Mejorando · 1/2**; a second later success resolves it.

## Progress counters
Progress is now explicit in three views:

- **Word**: units with successful Word evidence.
- **Sentence**: units with successful Sentence evidence.
- **Word + Sentence**: units completed in both modes.

The Home hero shows the combined total. The practice selector shows the selected mode's own completed and pending counts. Session results show the Word, Sentence and combined deltas separately instead of a single ambiguous `left` change.

## Web build
The current prototype is published through GitHub Pages over HTTPS so Pronounce can use direct browser speech recognition without a keyboard-dictation fallback.


## Consolidated baseline
**v0.19 is the current consolidated baseline.**

Confirmed in this baseline:
- Word, Sentence and Combined practice.
- Forget Me with Pending, Recurrent, Improving and Resolved states.
- Listen Once.
- Tiny Reader.
- Pronounce over HTTPS.
- Local progress with export/import.
- Separate Word, Sentence and Word + Sentence counters.

The counter model is considered good enough for real use, but intentionally remains open to adjustment after sustained usage. No further counter redesign should be made without evidence from actual use.
