# Changelog

## 0.22.0-beta.1 — Siete paquetes de contenido y reinicio individual
- Se activan Travel, Phrasal Verbs, Work & Meetings, Technology, MES/IT/AI/Pharma, Soccer y Sports General con 30 unidades iniciales cada uno (210 en total), ID 1–30 independiente por paquete.
- Cada unidad tiene expresión inglesa, significado castellano, oración inglesa y traducción castellana. Son paquetes de prueba editorial, no cursos completos validados por uso real.
- Se corrige la inicialización de paquetes nuevos para asignar el ID activo correcto.
- «Reiniciar paquete» pide confirmación e inicializa solo el paquete escogido; no borra el aprendizaje de los otros ni modifica las marcas globales de copia externa.
- Se conservan las copias JSON v1/v2, SQLite y los IDs originales. Audio y Tiny Reader siguen limitados a Everyday English.
- Nuevas pruebas de aislamiento, reinicio, cancelación y backup multipaquete.


## 0.21.0-beta.1 — Paquetes independientes (beta)
- Se conserva Everyday English con sus 100 unidades y progreso existente.
- Natural Conversations se incorpora como segundo paquete con 30 expresiones y ejercicios Word, Sentence y Combinado.
- Nuevo catálogo con selector en Pack y progreso independiente en cada paquete: repasos, errores, conteos y estado de aprendizaje.
- Travel & Situations, Phrasal Verbs, Work & Meetings, Technology, MES/IT/AI/Pharma, Soccer y Sports General figuran en preparación, todavía no activables.
- Migración de estado versión 5: identificador del pack activo y estados guardados de los packs inactivos, sin cambiar estructura SQLite.
- Copias de seguridad JSON versión 2 incluyendo todos los paquetes; compatibles con exportaciones versión 1.
- Audio y Tiny Reader solo disponibles para Everyday, evitando reproducir recursos de otro paquete.
- Tests de regresión para cambios de paquete, reinicio, copias y protección del progreso antiguo.
- Alcance y pruebas de aceptación documentados en docs/MULTIPACK_BETA2.md.

## 0.20.10-beta.1 — Verificación real de copia
- Se distingue «Descarga solicitada» de «Copia verificada».
- La confirmación exige volver a abrir el archivo JSON guardado mediante el selector de archivos de Android; verifica su estructura y que corresponde a la última exportación.
- Se añade «Verificar copia» en Progreso para comprobar el archivo incluso después de cerrar el aviso o reiniciar Noma.
- El estado de verificación se guarda localmente sin importar el JSON ni modificar resultados de aprendizaje.
- Los archivos anteriores y las copias inválidas se identifican por separado.
- Pruebas de regresión para comprobación válida, archivo anterior, corrupto y verificación tras reiniciar.

## 0.20.9-beta.1 — Confirmación de copia de seguridad
- Tras solicitar una exportación, Noma presenta un diálogo claro con el nombre del archivo y la indicación de comprobarlo en Descargas.
- La web no puede verificar que Android haya guardado el archivo: la interfaz comunica una descarga solicitada, no un guardado confirmado.
- Cada exportación genera un nombre distinto con fecha y hora, para evitar el aviso de archivo existente en exportaciones sucesivas.
- Si el navegador no permite iniciar la descarga, se muestra un diálogo de error y no se actualiza la marca de última descarga solicitada.
- La copia conserva su formato JSON, unidades y progreso; no hay cambios de esquema.
- Pruebas automatizadas para confirmación, nombre único y error de descarga.

## 0.20.8-beta.1 — Contadores Word/Sentence independientes
- Corregido el contador de progreso: resolver una palabra inestable en Word ya no puede sumar también Sentence sin haberla practicado.
- La inestabilidad se registra ahora por habilidad (Word y Sentence) y el avance combinado requiere que ambas estén estables.
- El fallo en una habilidad ya no descuenta el progreso de la otra.
- Los repasos resueltos limpian solo la inestabilidad de su propia habilidad. Si hay un fallo pendiente en la otra, el repaso se mantiene programado.
- Los datos antiguos migran sin borrar aciertos; los fallos heredados se atribuyen al último modo de repaso registrado, la única información histórica disponible.
- Sin cambios en los IDs de unidades ni en la estructura SQLite. Incluidas pruebas de regresión del cálculo de contadores y de migración.

## 0.20.7-beta.1 — Sesiones completas
- Corregida la selección de Word: antes el plan podía quedarse en solo dos repasos porque las unidades con recuperación futura se excluían de la práctica.
- Word y Sentence completan diez ejercicios siempre que queden suficientes habilidades pendientes; Combinado respeta la variedad y no repite unidades en la misma sesión.
- Los repasos posteriores se conservan aunque una unidad se vuelva a practicar antes.
- Listen Once y Pronounce pasan de cuatro a diez ejercicios y permiten terminar antes.
- El resumen final muestra realizados y planificados en todos los modos.
- Se incorporan pruebas de regresión de sesiones con 23 unidades superadas, repasos diferidos y pack casi completo.
- Sin cambios de esquema SQLite, IDs del pack ni reinicio de progreso.

## 0.20.6-beta.1 — Recovery de arranque Android
- El Service Worker ya no espera a recursos CDN de SQLite durante la instalación.
- Las solicitudes de instalación y navegación tienen tiempos máximos; al fallar, se utiliza el HTML offline cacheado o una página de reintento visible.
- No se cambia el identificador PWA, la URL de instalación, los datos SQLite/IndexedDB ni los contenidos.
- La causa del bloqueo del splash de Android aún debe verificarse en el teléfono.

## 0.20.5-beta.1 — Icono Android PWA
- El icono de instalación continúa siendo el símbolo de hojas y sol, sin letra N.
- Se cambian las URL de los iconos del manifiesto para que Chrome detecte una actualización de identidad de la PWA.
- Se añade `maskable` al icono de 512 px para adaptarse al icono Android.
- Manifiesto e iconos pasan a preferir red sobre caché y a revalidarse desde Vercel.
- Se mantiene la URL del manifiesto, el identificador de la app y la URL de inicio.
- Se añade vista previa del icono en el diagnóstico PWA.
- Sin cambios en SQLite/IndexedDB, contenido, seguimiento de progreso ni audio.

## 0.20.0-beta.2
- Word, Sentence and Combined sessions now default to **10 exercises** instead of 4.
- Added a visible **Terminar** action during those practice sessions.
- Ending early preserves all completed progress and does not penalise the current unanswered item.
- Session summary records how many exercises were completed out of the planned total.
- Listen Once and Pronounce remain at 4 items.
- No data-schema change; existing Beta 1 SQLite data is fully compatible.

## 0.20.0-beta.1 — Beta 1
- Audited and froze the 100-unit Everyday English pack for Beta use.
- Preserved stable IDs 1–100 so existing learning history can migrate without replaying learned material.
- Corrected `rather` to `would rather` and clarified several ambiguous prompts/examples.
- Expanded Tiny Reader from 2 to **8** curated texts; every text has 6 closed questions.
- Migrated primary persistence from localStorage to a local **SQLite database file** powered by sql.js.
- SQLite database bytes are persisted in IndexedDB with database schema version 1.
- Added automatic migration from the v0.19 legacy localStorage state into SQLite.
- Added canonical-content refresh by unit ID while preserving recognition, production, recall, errors and review history.
- Added a synchronous emergency local mirror to recover from interrupted SQLite writes.
- Kept versioned JSON export/import as the external disaster-recovery format.
- Added SQLite integrity status and external-backup status to the Progress data card.
- Added content-audit, persistence and third-party dependency documentation.
- Preserves application state schema v4.

## v0.19 — Consolidated
- Replaced the ambiguous single `left` display with explicit Word, Sentence and Word + Sentence progress.
- Home now shows the combined Word + Sentence total out of 100.
- Selecting Word or Sentence shows that mode's own completed and pending counts.
- Combined mode shows units completed in both Word and Sentence.
- Done now reports Word, Sentence and combined progress separately.
- Added a visible app version in the top bar to make stale browser builds obvious.
- Added cache-control meta hints for the GitHub Pages prototype.
- Preserves the v4 data schema.
- Marked as the consolidated product baseline; counter semantics may be revisited later using real usage evidence.

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