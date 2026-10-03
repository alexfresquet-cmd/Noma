# Noma v0.17

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

A Word/Sentence error becomes recurrent after its second failure. After one successful recovery it remains visible as **Mejorando · 1/2**; a second later success resolves it. Listen Once and Pronounce stay in the review queue but do not create recurring grammar/vocabulary patterns.

## Data
The prototype stores progress in browser localStorage. The state schema is versioned and backups can be exported/imported. The planned Android version will move persistence to local SQLite.

## Web build
The current prototype is published through GitHub Pages over HTTPS so Pronounce can use direct browser speech recognition without a keyboard-dictation fallback.
