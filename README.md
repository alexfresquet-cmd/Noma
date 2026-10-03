# Noma v0.15

Noma is a local-first language-learning prototype built around finite progress: learn, recall, consolidate, and remove what no longer needs attention.

## Current modules
- Word
- Sentence
- Combined practice
- Forget Me
- Listen Once
- Tiny Reader
- Pronounce
- Wrong Book

## Wrong Book
Wrong Book tracks only Word and Sentence errors. A first failure is observed; a second failure of the same item/type marks it as recurrent. Two later correct answers without another failure mark it as resolved.

## Data
The prototype stores progress in browser localStorage. The state schema is versioned and backups can be exported/imported. The planned Android version will move persistence to local SQLite.

## Web build
The current prototype is published through GitHub Pages over HTTPS so Pronounce can use direct browser speech recognition without a keyboard-dictation fallback.
