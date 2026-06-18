# StudyFlow

[![Cloud Run CI](https://github.com/JorkLucas03/StudyFlow/actions/workflows/cloud-run-ci.yml/badge.svg)](https://github.com/JorkLucas03/StudyFlow/actions/workflows/cloud-run-ci.yml)
[![SonarQube Cloud](https://github.com/JorkLucas03/StudyFlow/actions/workflows/sonarqube.yml/badge.svg)](https://github.com/JorkLucas03/StudyFlow/actions/workflows/sonarqube.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=JorkLucas03_StudyFlow&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=JorkLucas03_StudyFlow)

Frontend React y backend FastAPI para un planificador de estudio personalizado. La app permite ingresar materia, fecha de examen, horas disponibles, dificultad y temas pendientes para generar y guardar una ruta inicial de estudio.

## Que incluye

- Interfaz responsive construida con React y Vite.
- Backend FastAPI con endpoints REST para contenido y planes de estudio.
- Formulario funcional conectado a la API para crear y actualizar un plan de estudio.
- Agenda de estudio generada por el backend a partir de los temas ingresados.
- Resumen del plan con dias, horas y cobertura estimada.
- Checklist de repaso antes del examen.
- Tecnicas de estudio para orientar la preparacion.
- Tema claro para estudiar en la manana y tema oscuro para estudiar en la noche.
- Dockerfiles listos para Cloud Run en el puerto `8080`.
- Persistencia local con SQLite y soporte para PostgreSQL/Cloud SQL usando `DATABASE_URL`.
- Workflow principal de GitHub Actions para lint, tests, build frontend y build de contenedores.
- Workflow legado/manual para AWS Elastic Beanstalk.

## Roadmap

La ruta de produccion esta documentada en [`ROADMAP.md`](ROADMAP.md). Ahi se
ordenan los siguientes hitos: despliegue en Cloud Run, conexion con Cloud SQL,
observabilidad basica, mejoras de accesibilidad y funciones futuras para usuarios.

## Ejecutar localmente

Instala dependencias del frontend:

```bash
npm install
npm run dev
```

La app queda disponible normalmente en `http://localhost:5173`.

En otra terminal, instala dependencias del backend y ejecuta la API.

Linux/macOS:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cd ..
npm run dev:api
```

Windows PowerShell:

```bash
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
cd ..
npm run dev:api
```

La API queda disponible en `http://localhost:8000`.

Abre estas rutas para comprobarla:

```text
http://localhost:8000/health
http://localhost:8000/docs
http://localhost:8000/
```

Si el backend esta en otra URL, crea un archivo `.env.local` para el frontend:

```text
VITE_API_URL=http://localhost:8000
```

En despliegues con Docker/Cloud Run, el frontend usa `/api` en el mismo dominio y Nginx reenvia esas peticiones al backend. Define `BACKEND_API_URL` como variable de entorno del contenedor web para apuntar al servicio `studyflow-api`.

## Compilar

```bash
npm run build
```

## Verificar

```bash
npm run lint
npm run test:api
npm run test:e2e
```

`npm run test:api` y `npm run dev:api` usan `scripts/python-module.mjs`, que busca `python3`, `python` o `py -3` para funcionar en Linux, macOS y Windows.

## API FastAPI

Endpoints principales:

```text
GET    /health
GET    /api/content
POST   /api/study-plans
GET    /api/study-plans
GET    /api/study-plans/{id}
PUT    /api/study-plans/{id}
DELETE /api/study-plans/{id}
```

Payload para crear o actualizar un plan:

```json
{
  "subject": "Matematicas",
  "examDate": "2027-07-15",
  "hoursPerDay": 2,
  "difficulty": "Media",
  "focus": "Examen parcial",
  "topics": "Limites, Derivadas, Integrales"
}
```

## Contenido editable

La mayor parte del contenido esta en:

```text
src/content.js
```

Puedes cambiar:

- Nombre del sistema: `appInfo.name`
- Temas iniciales: `defaultTopics`
- Opciones de dificultad: `difficultyOptions`
- Objetivos de estudio: `focusOptions`
- Checklist: `checklistItems`
- Tecnicas de estudio: `studyMethods`

La apariencia principal esta en:

```text
src/styles.css
```

## Arquitectura Cloud Run

```text
Usuario
  |
  v
studyflow-web en Cloud Run
React/Vite servido por Nginx
  |
  | /api mediante proxy Nginx
  v
studyflow-api en Cloud Run
FastAPI con Gunicorn/Uvicorn
  |
  v
Cloud SQL PostgreSQL
```

El frontend y el backend se mantienen separados. En desarrollo el backend usa SQLite; en produccion usa PostgreSQL configurando `DATABASE_URL`.

El contenedor web publica `/api` y reenvia esas peticiones a `studyflow-api` mediante `BACKEND_API_URL`. Esto evita CORS innecesario cuando el usuario usa el dominio HTTPS del frontend.

Variables recomendadas:

```text
studyflow-web:
BACKEND_API_URL=https://studyflow-api-xxxxx.run.app

studyflow-api:
APP_ENV=production
CORS_ORIGINS=https://studyflow-web-xxxxx.run.app
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
```

Para Cloud SQL, usa Secret Manager para credenciales y conecta el servicio `studyflow-api` a la instancia de Cloud SQL. Si usas Unix socket de Cloud SQL, define `DATABASE_URL` con el formato soportado por SQLAlchemy/psycopg en tu despliegue.

## Contenedores Cloud Run

Build local del frontend:

```bash
docker build -t studyflow-web .
docker run --rm -p 8080:8080 -e BACKEND_API_URL=http://host.docker.internal:8000 studyflow-web
```

Build local de la API:

```bash
docker build -t studyflow-api backend
docker run --rm -p 8080:8080 -e APP_ENV=production studyflow-api
```

Comandos base para publicar imagenes en Artifact Registry:

```bash
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/studyflow/studyflow-web .
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/studyflow/studyflow-api backend
```

Despliegue base:

```bash
gcloud run deploy studyflow-api \
  --image REGION-docker.pkg.dev/PROJECT_ID/studyflow/studyflow-api \
  --region REGION \
  --allow-unauthenticated \
  --set-env-vars APP_ENV=production,CORS_ORIGINS=https://studyflow-web-xxxxx.run.app

gcloud run deploy studyflow-web \
  --image REGION-docker.pkg.dev/PROJECT_ID/studyflow/studyflow-web \
  --region REGION \
  --allow-unauthenticated \
  --set-env-vars BACKEND_API_URL=https://studyflow-api-xxxxx.run.app
```

## Despliegue legado backend en AWS Elastic Beanstalk

AWS queda como camino legado/manual. El backend esta preparado en `backend/` con:

- `requirements.txt`
- `Procfile`
- `.ebextensions/01_environment.config`
- GitHub Actions manual en `.github/workflows/backend-aws.yml`

Para crear el paquete ZIP desde Windows, usa este script en lugar de `Compress-Archive`:

```bash
python backend/package_aws.py
```

Esto genera `studyflow-api.zip` con rutas compatibles con Linux para Elastic Beanstalk.

Configura estos secretos en GitHub:

```text
AWS_REGION
AWS_ROLE_TO_ASSUME
EB_APPLICATION_NAME
EB_ENVIRONMENT_NAME
EB_S3_BUCKET
```

En Elastic Beanstalk configura variables de entorno:

- `DATABASE_URL`: URL de PostgreSQL/RDS.
- `CORS_ORIGINS`: dominio del frontend, por ejemplo `https://tu-frontend.com`.

## Estructura

```text
.
|-- Dockerfile
|-- .github/
|   `-- workflows/
|       |-- cloud-run-ci.yml
|       `-- backend-aws.yml
|-- backend/
|   |-- Dockerfile
|   |-- app/
|   |-- tests/
|   |-- Procfile
|   |-- requirements-dev.txt
|   `-- requirements.txt
|-- nginx.conf
|-- scripts/
|   `-- python-module.mjs
|-- src/
|   |-- App.jsx
|   |-- api.js
|   |-- content.js
|   |-- main.jsx
|   `-- styles.css
|-- tests/
|   `-- studyflow.spec.js
`-- README.md
```
