# Noma — Beta 1

Noma is a local-first English-learning app built around finite progress: learn, recall, consolidate and remove what no longer needs attention.

## Beta 1 scope

- **Everyday English**: 100 audited units with stable IDs.
- **Word**
- **Sentence**
- **Combined practice**
- **Forget Me**: Pending, Recurrent, Improving and Resolved states.
- **Listen Once**
- **Pronounce** over HTTPS.
- **Tiny Reader**: 8 curated texts, each with 6 closed comprehension questions.
- Separate **Word / Sentence / Word + Sentence** progress counters.
- Export/import of a versioned JSON backup.

## Local data

Beta 1 uses a real **SQLite database file** as its primary datastore in the browser. SQLite runs through `sql.js 1.14.2`; the exported database bytes are stored locally in IndexedDB.

On first launch after v0.19, Noma automatically:

1. opens or creates the SQLite database;
2. finds the existing Noma progress from the previous localStorage format;
3. copies the newest valid state into SQLite;
4. runs the versioned state migration;
5. refreshes audited pack text by stable unit ID without resetting learning history.

Noma also maintains a synchronous emergency local mirror. JSON export remains the external recovery copy: deleting all browser/site data can remove both SQLite and the emergency mirror.

See:
- `docs/PERSISTENCE_BETA1.md`
- `db/schema.sql`

## Content freeze

The 100 Everyday English unit IDs are now persistent learning identifiers for Beta 1. Copy corrections may be migrated, but an ID must not silently be reused for an unrelated learning item.

The audit and all content changes are documented in:
- `docs/CONTENT_AUDIT_BETA1.md`

## Beta status

**0.20.0-beta.2** is the current closed Beta build.

The counter model from v0.19 remains intentionally unchanged unless real usage gives us evidence to revise it. Speak 15, Travel Pack, placement testing and additional packs remain out of scope for this Beta.


## Session length

Word, Sentence and Combined practice now plan **up to 10 exercises per session**. A visible **Terminar** action lets the learner stop at any point; completed answers are kept and unfinished items are not penalised. Listen Once and Pronounce remain at 4 items for now.

## Vercel / Android PWA (0.20.1-beta.1)

- Static build: import `alexfresquet-cmd/Noma` in Vercel with Framework Preset **Other**, root `./`, no build and output directory `.`. `vercel.json` pins these settings.
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png` and `service-worker.js` enable installation and offline app shell.
- The service worker precaches the pinned sql.js runtime (JS + WASM) alongside Noma. Validate service-worker activation and actual airplane-mode relaunch on Android; deployment alone is not an offline test.
- SQLite and its emergency mirror remain stored **only in the browser of that origin**; no online database, account or sync was introduced.
- **Before changing domain** from GitHub Pages to Vercel: export a JSON backup from the old origin, save the file outside the browser, install/open the new origin and import the backup. Test a few progress counters on both. Do not delete the original installation until verified.
- Listen Once does not count playback until the synthesizer emits `onstart`; failures/timeouts reopen playback to avoid locking the exercise. English voices are still provided by the Android browser/device and require an actual device test.
