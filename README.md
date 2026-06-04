# AgileFlow DevOps

Frontend demostrable para la practica de DevOps con GitHub Actions y Google Cloud Run.

## Que incluye

- Landing page llamativa y responsive.
- Tablero de sprint con filtros interactivos.
- Seccion de atributos de calidad.
- Flujo CI/CD explicable para la defensa.
- Dockerfile listo para Cloud Run en el puerto `8080`.
- Workflow de GitHub Actions para desplegar automaticamente.

## Ejecutar localmente

```bash
npm install
npm run dev
```

La app quedara disponible normalmente en `http://localhost:5173`.

## Compilar

```bash
npm run build
```

## Cambios faciles para la defensa

La mayoria del contenido editable esta en:

```text
src/content.js
```

Puedes cambiar:

- Nombre del sistema: `appInfo.name`
- Link del repositorio: `appInfo.repositoryUrl`
- Link de Cloud Run: `appInfo.cloudRunUrl`
- Tareas del tablero: `sprintItems`
- Atributos de calidad: `qualityAttributes`
- Pasos del pipeline: `pipelineSteps`

Colores y apariencia principal:

```text
src/styles.css
```

## Despliegue en Google Cloud Run

### 1. Crear proyecto y habilitar APIs

En Google Cloud habilita:

- Cloud Run
- Cloud Build
- IAM Credentials API
- Artifact Registry

### 2. Crear cuenta de servicio

La cuenta usada por GitHub Actions necesita permisos para desplegar. Para una practica academica, una configuracion comun es:

- `Cloud Run Admin`
- `Cloud Build Editor`
- `Service Account User`
- `Artifact Registry Writer`

### 3. Configurar autenticacion con GitHub

Configura Workload Identity Federation entre GitHub y Google Cloud. Luego crea estos secretos en GitHub:

```text
GCP_PROJECT_ID
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT
```

### 4. Subir a GitHub

```bash
git init
git add .
git commit -m "Add AgileFlow DevOps frontend"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/agileflow-devops.git
git push -u origin main
```

Al hacer push a `main`, GitHub Actions ejecutara `.github/workflows/deploy-cloud-run.yml`.

## Evidencia que debes mostrar

- Repositorio en GitHub con el codigo.
- Ejecucion exitosa de GitHub Actions.
- URL publica de Cloud Run abierta en el navegador.
- Funcionamiento del tablero y filtros.
- Un cambio en vivo en `src/content.js`, por ejemplo agregar una tarea o cambiar una metrica.

## Estructura

```text
.
├── .github/workflows/deploy-cloud-run.yml
├── Dockerfile
├── nginx.conf
├── src/
│   ├── App.jsx
│   ├── content.js
│   ├── main.jsx
│   ├── styles.css
│   └── assets/hero-devops.png
└── README.md
```
