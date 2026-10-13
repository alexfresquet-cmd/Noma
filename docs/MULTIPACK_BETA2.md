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

## Evolución 0.22.0-beta.1

Se habilitan los siete paquetes que figuraban en preparación, cada uno con **30 unidades iniciales** (Word, Sentence, Combinado y Forget Me). En total, Noma dispone de Everyday English 100 + Natural Conversations 30 + siete paquetes de 30 = **340 unidades** distribuidas en nueve paquetes. Todos los nuevos textos son contenido de beta para revisión editorial y no incorporan audio ni Tiny Reader.

**Reinicio por paquete:** desde Pack se puede reiniciar el paquete activo, o uno inactivo con datos. Antes aparece una confirmación con su nombre. Reiniciar el activo recrea solo sus unidades, fallos, sesiones y lecturas; reiniciar uno inactivo borra únicamente su instantánea. Todos los otros progresos permanecen igual. Se aconseja exportar y verificar un JSON antes, ya que el reinicio no tiene deshacer individual. Restaurar un backup sustituye el estado completo.

**Prueba Android:** verificar que cada paquete permite diez ejercicios mientras hay unidades disponibles, que cambiar al original conserva su progreso, que el botón de reinicio funciona y que al volver al paquete reiniciado comienza en cero. Comprobar recarga y reinicio sin conexión con los archivos de paquete precacheados.

## Evolución 0.23.0-beta.1

**Nuevo alcance:** 9 paquetes × 100 unidades = 900 unidades; 9 bibliotecas × 10 textos × 6 preguntas = 540 preguntas. Se conservan las ocho lecturas originales de Everyday. Las unidades 1–30 de los ocho paquetes beta mantienen su contenido e identificador. Las nuevas son 31–100. El paquete Everyday conserva sus 100 unidades.

**Migración segura:** SQLite local sin cambios de esquema; versión de estado 6. La validación de copias y SQLite admite únicamente longitud 100 o 30 en los paquetes que previamente tenían 30. Rechaza otras longitudes y reordenaciones. Se añaden 70 registros sin progreso a cada paquete antiguo; nunca se sustituyen los datos existentes.

**Lecturas:** 10 por paquete y seis preguntas por texto; sus resultados permanecen en el estado local de ese paquete. Al reiniciarlo se borra también la lectura de ese paquete. El generador de textos de esta beta utiliza escenarios fijos y una estructura narrativa compartida; es material editorial experimental que necesita revisión por legibilidad y variedad antes de declararse consolidado.

**Pendiente de dispositivo real:** comprobar actualización del PWA sin desinstalarla, contadores 100/100, los diez textos por paquete, los resultados 0–6/6, cambio de paquete, reinicio selectivo, copia JSON antigua, relanzamiento offline y compatibilidad con el progreso previo.
