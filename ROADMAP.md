# Roadmap de StudyFlow

Este roadmap ordena las mejoras necesarias para llevar StudyFlow a una version
estable de produccion sin perder el enfoque educativo del proyecto.

## Estado actual

- Frontend React/Vite funcional.
- Backend FastAPI con CRUD de planes de estudio.
- Persistencia local con SQLite y soporte para PostgreSQL mediante `DATABASE_URL`.
- CI con lint, tests, build frontend y build de contenedores.
- Documentacion base para Cloud Run.
- Plantillas de comunidad, seguridad y Dependabot configurados.

## Objetivo v0.2.0

- Desplegar `studyflow-api` en Cloud Run.
- Desplegar `studyflow-web` en Cloud Run con proxy `/api`.
- Conectar la API a Cloud SQL PostgreSQL.
- Configurar variables de entorno reales:
  - `APP_ENV=production`
  - `DATABASE_URL`
  - `CORS_ORIGINS`
  - `BACKEND_API_URL`
- Verificar `/health` desde produccion.

## Objetivo v0.3.0

- Agregar exportacion del plan de estudio a PDF o texto imprimible.
- Mejorar estados vacios, errores y confirmaciones visuales.
- Agregar pruebas end-to-end para flujos de validacion del formulario.
- Agregar documentacion de recuperacion ante fallos de despliegue.

## Objetivo v0.4.0

- Agregar observabilidad basica:
  - logs estructurados en backend
  - identificador de version en healthcheck
  - guia de revision de errores en Cloud Run
- Separar configuracion por entorno: desarrollo, staging y produccion.
- Revisar accesibilidad con teclado y lectores de pantalla.

## Ideas futuras

- Autenticacion de usuarios.
- Sincronizacion de planes por usuario.
- Recordatorios de estudio.
- Historial de avance por materia.
- Panel de estadisticas de cobertura y cumplimiento.

## Reglas para avanzar

- Cada mejora debe entrar por pull request.
- Los checks de GitHub Actions deben pasar antes de fusionar.
- El texto visible para usuarios debe mantenerse en espanol.
- No se deben agregar secretos, tokens o credenciales al repositorio.
