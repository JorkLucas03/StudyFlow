export const appInfo = {
  name: 'StudyFlow',
  tagline: 'Planificador de estudio personalizado para estudiantes.',
  summary:
    'Organiza materias, fechas de examen, horas disponibles y temas pendientes en una ruta de estudio clara y defendible.',
};

export const defaultTopics = ['Limites', 'Derivadas', 'Integrales', 'Aplicaciones'];

export const difficultyOptions = ['Baja', 'Media', 'Alta'];

export const focusOptions = ['Examen parcial', 'Final acumulativo', 'Recuperacion'];

export const subjectTracks = [
  {
    subject: 'Matematicas',
    difficulty: 'Media',
    description: 'Ideal para organizar teoria, practica y simulacros antes de un examen numerico.',
    topics: ['Limites', 'Derivadas', 'Integrales', 'Aplicaciones'],
  },
  {
    subject: 'Programacion',
    difficulty: 'Alta',
    description: 'Divide conceptos, ejercicios y mini retos para preparar pruebas tecnicas o proyectos.',
    topics: ['Funciones', 'Arrays', 'Objetos', 'APIs', 'Errores comunes'],
  },
  {
    subject: 'Base de datos',
    difficulty: 'Media',
    description: 'Ordena teoria relacional, consultas SQL, normalizacion y ejercicios practicos.',
    topics: ['Modelo relacional', 'SQL SELECT', 'Joins', 'Normalizacion'],
  },
];

export const apiPreview = [
  {
    label: 'Google Cloud Run',
    title: 'Frontend contenedorizado',
    description: 'La interfaz de StudyFlow mantiene Docker, Nginx y puerto 8080 para desplegarse como servicio web.',
  },
  {
    label: 'AWS + FastAPI',
    title: 'Backend de planes',
    description: 'El proximo endpoint recibira materia, temas y tiempo disponible para devolver un plan JSON.',
  },
  {
    label: 'REST',
    title: 'Contrato simple',
    description: 'La pantalla queda lista para consumir POST /api/study-plan cuando el backend este publicado.',
  },
];
