# Noma Beta 1 release checklist

Version: **0.20.0-beta.1**

## Automated / repository checks

- [x] Main application JavaScript parses successfully.
- [x] Exactly 100 Everyday English units.
- [x] Unit IDs are unique and remain stable 1–100.
- [x] Unit terms are unique after the audit.
- [x] Audited content migration refreshes canonical text without resetting progress counters/history.
- [x] Tiny Reader contains exactly 8 texts.
- [x] Every Tiny Reader contains exactly 6 closed questions.
- [x] Every question has a valid answer index.
- [x] All Tiny Readers are within the intended ~220–300 word range.
- [x] SQLite database schema version 1 is documented and passes a standard SQLite integrity check.
- [x] Legacy localStorage migration path exists.
- [x] Emergency local mirror exists.
- [x] Fail-safe boot prevents an empty state from overwriting inaccessible SQLite data.
- [x] Versioned JSON export/import remains available.
- [x] No user-facing “MVP” wording remains in the Beta build.

## Beta smoke test after deployment

- [ ] Open the deployed page and confirm the header shows **v0.20.0-beta.1**.
- [ ] Existing v0.19 progress is present after the first Beta launch.
- [ ] Progress → Data shows **SQLite local** rather than fallback mode.
- [ ] Reload the page and confirm Word/Sentence/Forget Me progress remains.
- [ ] Export a JSON backup and verify “Última copia externa” appears.
- [ ] Import a known backup and confirm the state is restored.
- [ ] Word session works and counters update.
- [ ] Sentence session works and counters update.
- [ ] Combined session does not repeat the same unit as Word + Sentence in one session.
- [ ] Forget Me shows Pending / Recurrent / Improving / Resolved correctly.
- [ ] Listen Once plays and grades audio.
- [ ] Pronounce requests microphone permission and grades speech over HTTPS.
- [ ] Tiny Reader library shows 8 texts and a full text completes 6 questions.

## Data-safety rule

Do **not** delete browser/site data during ordinary Beta use unless an exported JSON backup has first been created. SQLite and the emergency mirror are local browser data; the JSON export is the external recovery copy.

## Release decision

Beta 1 may be published after the automated checks above pass. The smoke-test items are the first-use acceptance test on the target Android/Chrome device.
