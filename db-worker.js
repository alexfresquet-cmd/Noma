// Noma Beta 1 persistence worker.
// SQLite runs in this worker and persists its database through IndexedDB.
// Dependency pinned to wa-sqlite v1.1.2.

import * as SQLite from 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v1.1.2/src/sqlite-api.js';
import SQLiteESMFactory from 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v1.1.2/dist/wa-sqlite-async.mjs';
import { IDBMirrorVFS } from 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v1.1.2/src/examples/IDBMirrorVFS.js';

const DB_SCHEMA_VERSION = 1;
const VFS_NAME = 'noma-beta-sqlite';
const DB_NAME = 'noma-beta.db';

let sqlite3 = null;
let db = null;

function quote(value='') {
  return "'" + String(value).replaceAll("'", "''") + "'";
}

async function initDatabase() {
  const module = await SQLiteESMFactory();
  sqlite3 = SQLite.Factory(module);
  const vfs = await IDBMirrorVFS.create(VFS_NAME, module);
  sqlite3.vfs_register(vfs, true);
  db = await sqlite3.open_v2(DB_NAME);

  await sqlite3.exec(db, `
    PRAGMA synchronous=FULL;
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      state_schema INTEGER NOT NULL,
      payload TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    PRAGMA user_version = ${DB_SCHEMA_VERSION};
  `);
}

async function oneRow(sql) {
  let result = null;
  for await (const stmt of sqlite3.statements(db, sql)) {
    while (await sqlite3.step(stmt) === SQLite.SQLITE_ROW) {
      result = sqlite3.row(stmt);
      break;
    }
    if (result) break;
  }
  return result;
}

async function handle(message) {
  const { id, type, payload } = message || {};
  try {
    await ready;
    if (type === 'load') {
      const row = await oneRow('SELECT payload, updated_at, state_schema FROM app_state WHERE id = 1');
      postMessage({ id, ok:true, result: row ? { payload:row[0], updatedAt:row[1], stateSchema:row[2], dbSchema:DB_SCHEMA_VERSION } : { payload:null, updatedAt:0, stateSchema:null, dbSchema:DB_SCHEMA_VERSION } });
      return;
    }
    if (type === 'save') {
      const stateSchema = Number(payload?.stateSchema)||0;
      const updatedAt = Number(payload?.updatedAt)||Date.now();
      const json = String(payload?.json||'');
      await sqlite3.exec(db, `
        INSERT INTO app_state(id, state_schema, payload, updated_at)
        VALUES (1, ${stateSchema}, ${quote(json)}, ${updatedAt})
        ON CONFLICT(id) DO UPDATE SET
          state_schema=excluded.state_schema,
          payload=excluded.payload,
          updated_at=excluded.updated_at;
      `);
      postMessage({ id, ok:true, result:{ updatedAt, dbSchema:DB_SCHEMA_VERSION } });
      return;
    }
    if (type === 'integrity') {
      const row = await oneRow('PRAGMA integrity_check');
      postMessage({ id, ok:true, result:{ integrity:row?.[0]||'unknown', dbSchema:DB_SCHEMA_VERSION } });
      return;
    }
    if (type === 'meta-set') {
      const key=String(payload?.key||'');
      const value=String(payload?.value||'');
      await sqlite3.exec(db, `INSERT INTO meta(key,value) VALUES(${quote(key)},${quote(value)}) ON CONFLICT(key) DO UPDATE SET value=excluded.value;`);
      postMessage({ id, ok:true, result:true });
      return;
    }
    throw new Error('Unknown database operation');
  } catch (error) {
    postMessage({ id, ok:false, error:{ name:error?.name||'Error', message:error?.message||String(error) } });
  }
}

const ready = initDatabase();
ready.then(()=>postMessage({ type:'ready', ok:true, dbSchema:DB_SCHEMA_VERSION }))
  .catch(error=>postMessage({ type:'ready', ok:false, error:{ name:error?.name||'Error', message:error?.message||String(error) } }));

let queue = Promise.resolve();
addEventListener('message', event => {
  const message=event.data;
  queue = queue.then(()=>handle(message)).catch(()=>{});
});
