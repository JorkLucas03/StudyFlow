# Guia de contribucion de StudyFlow

Gracias por ayudar a mejorar StudyFlow. Este proyecto busca mantenerse simple,
claro y util para estudiantes que necesitan organizar su preparacion antes de un
examen.

## Antes de proponer cambios

- Revisa los issues abiertos para evitar duplicar trabajo.
- Mantén los cambios pequenos y enfocados en una sola mejora.
- Escribe textos visibles para usuarios en espanol.
- Evita commits vacios o cambios que no mejoren el producto, la calidad o la documentacion.

## Flujo recomendado

1. Crea una rama desde `main`.
2. Implementa la mejora con commits descriptivos en espanol.
3. Ejecuta las verificaciones locales:

```bash
npm run lint
npm run test:api
npm run build
```

4. Si tocaste frontend o integracion, ejecuta tambien:

```bash
npm run test:e2e
```

5. Abre un pull request explicando que cambiaste, por que y como lo probaste.

## Criterios de calidad

- La API debe responder `/health` correctamente.
- Los formularios deben validar errores antes de enviar datos invalidos.
- La interfaz debe funcionar en escritorio y movil.
- La documentacion debe ser suficiente para ejecutar, probar y desplegar el proyecto.
- Los workflows de GitHub Actions deben quedar en verde antes de mergear.

## Estilo del proyecto

- Frontend: React con Vite.
- Backend: FastAPI con SQLAlchemy.
- Base local: SQLite.
- Produccion: Cloud Run con PostgreSQL/Cloud SQL mediante `DATABASE_URL`.

Si una mejora necesita una decision grande, abre primero un issue con contexto.
