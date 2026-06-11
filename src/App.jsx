import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Cloud,
  GraduationCap,
  Layers3,
  ListChecks,
  RefreshCw,
  Server,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  apiPreview,
  appInfo,
  defaultTopics,
  difficultyOptions,
  focusOptions,
  subjectTracks,
} from './content';

const difficultyWeight = {
  Baja: 0.85,
  Media: 1,
  Alta: 1.25,
};

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDaysUntil(dateValue) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(`${dateValue}T00:00:00`);
  const diff = exam.getTime() - today.getTime();
  return Math.max(1, Math.ceil(diff / 86400000));
}

function splitTopics(value) {
  return value
    .split(',')
    .map((topic) => topic.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function buildStudyPlan(form) {
  const topics = splitTopics(form.topics);
  const daysUntilExam = getDaysUntil(form.examDate);
  const hoursPerDay = Number(form.hoursPerDay);
  const totalHours = daysUntilExam * hoursPerDay;
  const requiredHours = Math.max(6, topics.length * 3.5 * difficultyWeight[form.difficulty]);
  const coverage = Math.min(100, Math.round((totalHours / requiredHours) * 100));
  const risk = coverage >= 90 ? 'Bajo' : coverage >= 62 ? 'Medio' : 'Alto';
  const sessions = Math.min(6, Math.max(3, topics.length));

  const dailyPlan = Array.from({ length: sessions }, (_, index) => {
    const topic = topics[index % topics.length] || form.subject;
    const dayNumber = index + 1;

    return {
      day: dayNumber,
      label: dayNumber === sessions ? 'Cierre' : `Dia ${dayNumber}`,
      title: dayNumber === sessions ? 'Simulacro y correccion' : topic,
      tasks:
        dayNumber === sessions
          ? ['Resolver un simulacro corto', 'Revisar errores frecuentes', 'Preparar resumen final']
          : ['Repasar teoria clave', 'Resolver ejercicios guiados', 'Crear 5 preguntas de autoevaluacion'],
    };
  });

  return {
    coverage,
    dailyPlan,
    daysUntilExam,
    risk,
    totalHours,
    topics,
  };
}

function App() {
  const [form, setForm] = useState(() => ({
    subject: 'Matematicas',
    examDate: formatInputDate(addDays(new Date(), 14)),
    hoursPerDay: 2,
    difficulty: 'Media',
    focus: 'Examen parcial',
    topics: defaultTopics.join(', '),
  }));
  const [activeTopic, setActiveTopic] = useState(defaultTopics[0]);

  const plan = useMemo(() => buildStudyPlan(form), [form]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function loadTrack(track) {
    setForm((current) => ({
      ...current,
      subject: track.subject,
      difficulty: track.difficulty,
      topics: track.topics.join(', '),
    }));
    setActiveTopic(track.topics[0]);
  }

  return (
    <main>
      <section className="hero" id="inicio">
        <nav className="nav" aria-label="Principal">
          <a className="brand" href="#inicio" aria-label={appInfo.name}>
            <span className="brandMark">
              <GraduationCap size={22} aria-hidden="true" />
            </span>
            {appInfo.name}
          </a>
          <div className="navLinks">
            <a href="#planificador">Planificador</a>
            <a href="#ruta">Ruta</a>
            <a href="#arquitectura">Arquitectura</a>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <span className="eyebrow">
              <Sparkles size={16} aria-hidden="true" />
              Planes de estudio personalizados
            </span>
            <h1>{appInfo.name}</h1>
            <p>{appInfo.summary}</p>
            <div className="heroActions">
              <a className="button primary" href="#planificador">
                Crear plan
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button ghost" href="#arquitectura">
                <Cloud size={18} aria-hidden="true" />
                Cloud Run
              </a>
            </div>
          </div>

          <section className="plannerPanel" id="planificador" aria-label="Planificador StudyFlow">
            <div className="panelHeader">
              <div>
                <span className="eyebrow">
                  <BrainCircuit size={16} aria-hidden="true" />
                  Generador inicial
                </span>
                <h2>Arma tu proxima semana de estudio</h2>
              </div>
              <span className={`riskBadge risk${plan.risk}`}>Riesgo {plan.risk}</span>
            </div>

            <div className="formGrid">
              <label>
                <span>Materia</span>
                <input
                  value={form.subject}
                  onChange={(event) => updateForm('subject', event.target.value)}
                  type="text"
                />
              </label>

              <label>
                <span>Fecha de examen</span>
                <input
                  value={form.examDate}
                  onChange={(event) => updateForm('examDate', event.target.value)}
                  type="date"
                />
              </label>

              <label>
                <span>Horas por dia</span>
                <input
                  min="1"
                  max="8"
                  value={form.hoursPerDay}
                  onChange={(event) => updateForm('hoursPerDay', event.target.value)}
                  type="number"
                />
              </label>

              <label>
                <span>Dificultad</span>
                <select
                  value={form.difficulty}
                  onChange={(event) => updateForm('difficulty', event.target.value)}
                >
                  {difficultyOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="wideField">
              <span>Temas pendientes</span>
              <textarea
                value={form.topics}
                onChange={(event) => updateForm('topics', event.target.value)}
                rows="3"
              />
            </label>

            <div className="focusGroup" aria-label="Tipo de objetivo">
              {focusOptions.map((option) => (
                <button
                  className={form.focus === option ? 'chip active' : 'chip'}
                  key={option}
                  onClick={() => updateForm('focus', option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="statsBand" aria-label="Resumen del plan">
        <div>
          <CalendarDays size={22} aria-hidden="true" />
          <strong>{plan.daysUntilExam}</strong>
          <span>Dias disponibles</span>
        </div>
        <div>
          <Clock3 size={22} aria-hidden="true" />
          <strong>{plan.totalHours}</strong>
          <span>Horas estimadas</span>
        </div>
        <div>
          <ListChecks size={22} aria-hidden="true" />
          <strong>{plan.topics.length}</strong>
          <span>Temas activos</span>
        </div>
        <div>
          <Target size={22} aria-hidden="true" />
          <strong>{plan.coverage}%</strong>
          <span>Cobertura sugerida</span>
        </div>
      </section>

      <section className="section routeSection" id="ruta">
        <div className="sectionHeader">
          <span className="eyebrow">
            <Layers3 size={16} aria-hidden="true" />
            Ruta generada
          </span>
          <h2>Un plan claro para empezar sin perder tiempo</h2>
          <p>
            Esta version genera la ruta en el frontend. En la siguiente fase, la misma estructura
            consumira un endpoint FastAPI en AWS.
          </p>
        </div>

        <div className="routeGrid">
          {plan.dailyPlan.map((item) => (
            <article className="routeCard" key={`${item.label}-${item.title}`}>
              <div className="cardTop">
                <span>{item.label}</span>
                <CheckCircle2 size={19} aria-hidden="true" />
              </div>
              <h3>{item.title}</h3>
              <ul>
                {item.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section tracksSection">
        <div className="sectionHeader compact">
          <span className="eyebrow">
            <BookOpen size={16} aria-hidden="true" />
            Materias base
          </span>
          <h2>Cambia de enfoque con un clic</h2>
        </div>

        <div className="tracksGrid">
          {subjectTracks.map((track) => (
            <article className="trackCard" key={track.subject}>
              <div>
                <span className="trackTag">{track.difficulty}</span>
                <h3>{track.subject}</h3>
                <p>{track.description}</p>
              </div>
              <button onClick={() => loadTrack(track)} type="button">
                Usar materia
                <RefreshCw size={17} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section focusSection">
        <div className="focusLayout">
          <div>
            <span className="eyebrow">
              <Target size={16} aria-hidden="true" />
              Priorizacion
            </span>
            <h2>Detecta donde conviene concentrar energia</h2>
            <p>
              StudyFlow separa temas, tiempo disponible y dificultad para explicar por que un plan
              necesita mas practica, teoria o simulacros.
            </p>
          </div>

          <div className="topicList" aria-label="Temas del plan">
            {plan.topics.map((topic) => (
              <button
                className={activeTopic === topic ? 'topic active' : 'topic'}
                key={topic}
                onClick={() => setActiveTopic(topic)}
                type="button"
              >
                <span>{topic}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section architectureSection" id="arquitectura">
        <div className="sectionHeader">
          <span className="eyebrow">
            <Server size={16} aria-hidden="true" />
            Arquitectura preparada
          </span>
          <h2>Frontend listo para conectar FastAPI</h2>
          <p>
            El proyecto conserva el contenedor para Google Cloud Run. Luego el formulario enviara
            estos datos al backend en AWS sin cambiar la experiencia visual.
          </p>
        </div>

        <div className="architectureGrid">
          {apiPreview.map((item) => (
            <article className="apiCard" key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
