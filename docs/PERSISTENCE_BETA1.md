# Beta 1 persistence and migration

## Decision

Beta 1 uses **SQLite as the primary application datastore**.

Because the current beta is hosted as a static web app on GitHub Pages, the SQLite database runs in the browser through `sql.js`. The SQLite database file is serialized into IndexedDB after every state change. This keeps the current UI and deployment simple while giving Noma a real versioned SQLite database that can be carried forward to a native Android implementation.

## Database schema

Database schema version: **1**

See `db/schema.sql`.

The Beta deliberately keeps one versioned JSON state document in SQLite rather than prematurely normalising every learning field into many tables. The application state already has its own migration version (`STATE_SCHEMA_VERSION`). This makes the web-to-native migration small and reversible.

### app_state

One row, ID 1:

- `state_schema`: application-state schema version.
- `payload`: complete Noma learning state as JSON.
- `updated_at`: timestamp used to select the newest valid copy during recovery.

### meta

Reserved for future database-level migration metadata.

## Automatic migration from v0.19 and earlier

On first Beta 1 launch:

1. Noma opens the SQLite file from IndexedDB.
2. It checks the existing emergency/legacy localStorage state.
3. If SQLite is empty, the existing local progress is copied into SQLite.
4. If both exist, Noma chooses the copy with the newest timestamp.
5. The normal application-state migration runs.
6. Canonical pack content is refreshed by stable unit ID while recognition, production, recall, mistakes and review history are preserved.
7. The migrated state is saved back to SQLite.

The old localStorage key is not deleted automatically. Beta 1 also maintains a separate local emergency mirror so an interrupted SQLite write can be recovered on the next launch.

If SQLite cannot open and no valid emergency/legacy copy exists, Noma deliberately refuses to initialise a blank learning state. It shows a recovery screen instead, with Retry and JSON-restore actions. This prevents a transient storage/runtime failure from overwriting a valid but temporarily inaccessible database.

## Backup strategy

There are three layers:

1. **SQLite** — primary local datastore.
2. **Emergency local mirror** — automatically updated after each state change.
3. **Exported JSON** — user-controlled copy outside Noma.

Only the exported JSON survives deleting all browser/site data. Beta 1 therefore shows whether an external backup has ever been exported.

## Future Android migration

The native Android version should keep the same database-level contract first:

- SQLite database.
- `app_state` row with versioned JSON payload.
- Existing application-state migration functions.

This lets the first native version import a Beta 1 JSON backup without replaying learned material. Normalising the schema into dedicated unit/review tables can happen later through an explicit SQLite migration, not during the Beta launch.

## Privacy

Learning state is local. Noma does not require an account or backend. The web Beta downloads the SQLite runtime from a pinned CDN dependency, but learning data is not sent to that dependency.
