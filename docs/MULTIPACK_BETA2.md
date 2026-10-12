# Noma · fase multipaquete (0.21.0-beta.1)

## Decisión

Mantener **Everyday English** como paquete original con sus 100 IDs sin alterarlos. Habilitar **Natural Conversations** como segundo paquete de validación, con 30 unidades propias. El resto del catálogo se muestra como pendiente de revisión editorial, sin ejercicios ficticios.

## Catálogo acordado

| ID estable | Paquete | Estado |
| --- | --- | --- |
| everyday | Everyday English | Activo, 100 unidades |
| conversation | Natural Conversations | Beta, 30 unidades |
| travel | Travel & Situations | Preparación |
| phrasal | Phrasal Verbs | Preparación |
| work | Work & Meetings | Preparación |
| technology | Technology | Preparación |
| pharma | MES, IT, AI & Pharma | Preparación |
| soccer | Soccer | Preparación |
| sports | Sports General | Preparación |

## Datos y migración

- SQLite continúa usando un único documento de estado con `STATE_SCHEMA_VERSION = 5`; no se normaliza prematuramente la base.
- Los campos de progreso activos (unidades, sesiones, fallos, Forget Me, Tiny Reader) conservan su estructura actual.
- `activePackId` identifica el paquete activo.
- `packStates` almacena instantáneas completas de los paquetes inactivos. Al cambiar, se conserva el actual y se restaura el elegido.
- Una copia antigua sin `activePackId` se interpreta como **everyday**, sin reiniciar unidades ni fallos.
- La versión 2 de la exportación JSON guarda ambos datos (`activePackId` y `packStates`). Se siguen aceptando copias versión 1 del paquete original.
- La validación de importación es de solo lectura. No se cambia el paquete hasta confirmar la restauración.
- Identificadores de unidades definidos por pareja **paquete + ID**. El ID 1 en un paquete distinto nunca comparte progreso.

## Alcance funcional de Natural Conversations

- Word, Sentence, Combinado, Forget Me, registro de fallos y contadores están activos.
- 30 expresiones con traducción, oración inglesa y oración española: prototipo editorial sujeto a pruebas reales de ambigüedad y de autocorrección.
- **Listen Once y Pronounce no se muestran** porque los archivos actuales `audio/listen/1..100.mp3` y `audio/pronounce/1..100.mp3` son de Everyday English. No deben asignarse a las nuevas unidades homónimas.
- Tiny Reader tampoco se muestra porque los ocho textos actuales pertenecen al paquete original.
- El contador de Progreso no muestra métricas de audio o lecturas ausentes.

## Prueba mínima de aceptación

1. Exportar copia JSON antes de cambiar de versión y verificarla.
2. Abrir Everyday English, anotar el progreso Word, Sentence y los errores activos.
3. Ir a Pack, activar Natural Conversations, responder varias preguntas y generar un fallo.
4. Volver a Everyday: los resultados originales y Forget Me deben ser idénticos.
5. Cerrar y reabrir la PWA en el teléfono, volver a Natural Conversations y comprobar respuestas y fallos.
6. Exportar una copia multipaquete versión 2 y verificarla sin importar datos.
7. Restaurar la copia en un navegador de prueba y verificar ambos paquetes.
8. Probar también la importación de un JSON versión 1 en un perfil de prueba.

**No borrar la PWA ni vaciar los datos de Chrome para hacer pruebas.**

## Próximo hito

Validar Natural Conversations en el Pixel, corregir expresiones con significados ambiguos y después preparar **Travel & Situations**. Los demás paquetes permanecen en backlog y no forman parte de la beta funcional.
