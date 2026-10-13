// Noma starter pack: stable unit IDs, independent progress.
globalThis.NOMA_EXTRA_PACKS = globalThis.NOMA_EXTRA_PACKS || {};
globalThis.NOMA_EXTRA_PACKS.technology = [
  {
    "id": 1,
    "term": "source code",
    "meaning": "código fuente",
    "en": "The source code is in a repository.",
    "es": "El código fuente está en un repositorio."
  },
  {
    "id": 2,
    "term": "version control",
    "meaning": "control de versiones",
    "en": "We use version control for every change.",
    "es": "Usamos control de versiones para cada cambio."
  },
  {
    "id": 3,
    "term": "repository",
    "meaning": "repositorio",
    "en": "The repository contains the app code.",
    "es": "El repositorio contiene el código de la aplicación."
  },
  {
    "id": 4,
    "term": "deployment",
    "meaning": "despliegue",
    "en": "The deployment finished without errors.",
    "es": "El despliegue terminó sin errores."
  },
  {
    "id": 5,
    "term": "rollback",
    "meaning": "reversión de cambios",
    "en": "We prepared a rollback before updating.",
    "es": "Preparamos una reversión de cambios antes de actualizar."
  },
  {
    "id": 6,
    "term": "bug report",
    "meaning": "informe de error",
    "en": "The bug report includes reproduction steps.",
    "es": "El informe de error incluye pasos para reproducirlo."
  },
  {
    "id": 7,
    "term": "feature request",
    "meaning": "solicitud de funcionalidad",
    "en": "A feature request came from support.",
    "es": "El equipo de soporte envió una solicitud de funcionalidad."
  },
  {
    "id": 8,
    "term": "authentication",
    "meaning": "autenticación",
    "en": "Authentication is required to sign in.",
    "es": "La autenticación es necesaria para iniciar sesión."
  },
  {
    "id": 9,
    "term": "authorization",
    "meaning": "autorización de acceso",
    "en": "Authorization controls what users can do.",
    "es": "La autorización de acceso controla lo que pueden hacer los usuarios."
  },
  {
    "id": 10,
    "term": "encryption",
    "meaning": "cifrado",
    "en": "Encryption protects data in transit.",
    "es": "El cifrado protege los datos en tránsito."
  },
  {
    "id": 11,
    "term": "backup",
    "meaning": "copia de seguridad",
    "en": "We created a backup before the migration.",
    "es": "Creamos una copia de seguridad antes de la migración."
  },
  {
    "id": 12,
    "term": "restore",
    "meaning": "restaurar",
    "en": "We can restore the database from a backup.",
    "es": "Podemos restaurar la base de datos desde una copia."
  },
  {
    "id": 13,
    "term": "latency",
    "meaning": "latencia",
    "en": "High latency makes the app slow.",
    "es": "Una latencia elevada hace que la aplicación vaya lenta."
  },
  {
    "id": 14,
    "term": "bandwidth",
    "meaning": "ancho de banda",
    "en": "Video calls consume a lot of bandwidth.",
    "es": "Las videollamadas consumen mucho ancho de banda."
  },
  {
    "id": 15,
    "term": "endpoint",
    "meaning": "punto de conexión",
    "en": "The endpoint returns the system status.",
    "es": "El punto de conexión devuelve el estado del sistema."
  },
  {
    "id": 16,
    "term": "request payload",
    "meaning": "contenido de la solicitud",
    "en": "The request payload contains an identifier.",
    "es": "El contenido de la solicitud contiene un identificador."
  },
  {
    "id": 17,
    "term": "response code",
    "meaning": "código de respuesta",
    "en": "The response code shows whether it succeeded.",
    "es": "El código de respuesta indica si se completó correctamente."
  },
  {
    "id": 18,
    "term": "rate limit",
    "meaning": "límite de peticiones",
    "en": "The API has a strict rate limit.",
    "es": "La API tiene un límite de peticiones estricto."
  },
  {
    "id": 19,
    "term": "database query",
    "meaning": "consulta a la base de datos",
    "en": "This database query takes too long.",
    "es": "Esta consulta a la base de datos tarda demasiado."
  },
  {
    "id": 20,
    "term": "data model",
    "meaning": "modelo de datos",
    "en": "We updated the data model.",
    "es": "Actualizamos el modelo de datos."
  },
  {
    "id": 21,
    "term": "schema migration",
    "meaning": "migración de esquema",
    "en": "The schema migration added a table.",
    "es": "La migración de esquema añadió una tabla."
  },
  {
    "id": 22,
    "term": "cache invalidation",
    "meaning": "invalidación de caché",
    "en": "Cache invalidation is necessary after the update.",
    "es": "La invalidación de caché es necesaria después de la actualización."
  },
  {
    "id": 23,
    "term": "offline mode",
    "meaning": "modo sin conexión",
    "en": "Offline mode works without internet.",
    "es": "El modo sin conexión funciona sin internet."
  },
  {
    "id": 24,
    "term": "background sync",
    "meaning": "sincronización en segundo plano",
    "en": "Background sync resumes when online.",
    "es": "La sincronización en segundo plano se reanuda al conectarse."
  },
  {
    "id": 25,
    "term": "accessibility",
    "meaning": "accesibilidad",
    "en": "Accessibility matters from the start.",
    "es": "La accesibilidad importa desde el principio."
  },
  {
    "id": 26,
    "term": "responsive layout",
    "meaning": "diseño adaptable",
    "en": "The responsive layout fits small screens.",
    "es": "El diseño adaptable se ajusta a pantallas pequeñas."
  },
  {
    "id": 27,
    "term": "error handling",
    "meaning": "gestión de errores",
    "en": "Good error handling prevents silent failures.",
    "es": "Una buena gestión de errores evita fallos silenciosos."
  },
  {
    "id": 28,
    "term": "logging",
    "meaning": "registro de eventos",
    "en": "Logging helps us investigate incidents.",
    "es": "El registro de eventos nos ayuda a investigar incidentes."
  },
  {
    "id": 29,
    "term": "monitoring",
    "meaning": "supervisión del sistema",
    "en": "Monitoring detected the outage immediately.",
    "es": "La supervisión del sistema detectó la interrupción enseguida."
  },
  {
    "id": 30,
    "term": "integration test",
    "meaning": "prueba de integración",
    "en": "The integration test checks both services.",
    "es": "La prueba de integración comprueba ambos servicios."
  }
];
