# Politica de seguridad

StudyFlow es un proyecto educativo, pero se trata como una aplicacion que puede
llegar a produccion. Si encuentras un problema de seguridad, por favor no lo
publiques como issue abierto.

## Versiones soportadas

| Area | Estado |
| --- | --- |
| Frontend React/Vite en `main` | Soportado |
| Backend FastAPI en `main` | Soportado |
| Ramas antiguas o experimentales | Sin soporte |

## Como reportar una vulnerabilidad

1. Abre un aviso privado de seguridad desde la pestana **Security** del repositorio.
2. Incluye pasos de reproduccion, impacto y cualquier evidencia disponible.
3. Si no puedes usar el aviso privado, contacta al mantenedor antes de publicar detalles.

## Que se considera sensible

- Credenciales, tokens o variables de entorno expuestas.
- Fallos que permitan leer, cambiar o borrar planes de otros usuarios.
- Errores de configuracion en Cloud Run, Cloud SQL o CORS.
- Dependencias con vulnerabilidades explotables.

## Tiempo de respuesta esperado

- Confirmacion inicial: 72 horas.
- Evaluacion de impacto: 7 dias.
- Correccion o mitigacion: segun severidad y alcance.

## Recomendaciones de despliegue

- Usa Secret Manager para credenciales.
- No publiques `DATABASE_URL` ni tokens en commits, issues o logs.
- Mantén `CORS_ORIGINS` restringido al dominio real del frontend.
- Ejecuta los checks de GitHub Actions antes de fusionar cambios a `main`.
