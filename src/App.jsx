import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ListChecks,
  Moon,
  NotebookPen,
  Sparkles,
  Sun,
  Target,
} from 'lucide-react';
import {
  appInfo,
  checklistItems,
  defaultTopics,
  difficultyOptions,
  focusOptions,
  studyMethods,
} from './content';
import { createStudyPlan, fetchContent, updateStudyPlan } from './api';

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

const fallbackPlan = {
  coverage: 0,
  dailyPlan: [],
  daysUntilExam: 0,
  pace: 'Cargando',
  topics: [],
  totalHours: 0,
};

const MIN_HOURS_PER_DAY = 1;
const MAX_HOURS_PER_DAY = 8;
const MAX_SUBJECT_LENGTH = 120;
const MAX_TOPICS_LENGTH = 600;

function splitTopics(value) {
  return value
    .split(',')
    .map((topic) => topic.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function getDaysUntil(dateValue) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(exam.getTime())) {
    return 1;
  }
  const diff = exam.getTime() - today.getTime();
  return Math.max(1, Math.ceil(diff / 86400000));
}

function getSafeHoursPerDay(value) {
  const hours = Number(value);

  if (!Number.isFinite(hours)) {
    return MIN_HOURS_PER_DAY;
  }

  return Math.min(MAX_HOURS_PER_DAY, Math.max(MIN_HOURS_PER_DAY, hours));
}

function formatHours(value) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} h`;
}

function buildLocalStudyPlan(form) {
  const subject = form.subject.trim() || 'Tu materia';
  const topics = splitTopics(form.topics);
  const daysUntilExam = getDaysUntil(form.examDate);
  const hoursPerDay = getSafeHoursPerDay(form.hoursPerDay);
  const totalHours = daysUntilExam * hoursPerDay;
  const requiredHours = Math.max(6, topics.length * 3.5 * (difficultyWeight[form.difficulty] || 1));
  const coverage = Math.min(100, Math.round((totalHours / requiredHours) * 100));
  const pace = coverage >= 90 ? 'Comodo' : coverage >= 62 ? 'Constante' : 'Intenso';
  const sessions = Math.min(5, Math.max(3, topics.length));

  const dailyPlan = Array.from({ length: sessions }, (_, index) => {
    const dayNumber = index + 1;
    const topic = topics[index % topics.length] || subject;
    const isFinalSession = dayNumber === sessions;

    return {
      label: isFinalSession ? 'Cierre' : `Sesion ${dayNumber}`,
      title: isFinalSession ? 'Simulacro final' : topic,
      time: isFinalSession ? formatHours(hoursPerDay) : formatHours(Math.max(1, hoursPerDay - 0.5)),
      tasks: isFinalSession
        ? ['Resolver un simulacro', 'Corregir errores', 'Preparar hoja de formulas o resumen']
        : ['Repasar conceptos clave', 'Resolver ejercicios', 'Anotar dudas para la siguiente sesion'],
    };
  });

  return {
    coverage,
    dailyPlan,
    daysUntilExam,
    pace,
    topics,
    totalHours,
  };
}

function validateStudyForm(form, content) {
  const errors = {};
  const subject = form.subject.trim();
  const hoursPerDay = Number(form.hoursPerDay);
  const exam = new Date(`${form.examDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!subject) {
    errors.subject = 'Escribe una materia para crear el plan.';
  } else if (subject.length > MAX_SUBJECT_LENGTH) {
    errors.subject = `La materia no puede superar ${MAX_SUBJECT_LENGTH} caracteres.`;
  }

  if (!form.examDate || Number.isNaN(exam.getTime())) {
    errors.examDate = 'Selecciona una fecha de examen valida.';
  } else if (exam < today) {
    errors.examDate = 'La fecha de examen no puede estar en el pasado.';
  }

  if (form.hoursPerDay === '' || !Number.isFinite(hoursPerDay)) {
    errors.hoursPerDay = 'Ingresa las horas de estudio por dia.';
  } else if (hoursPerDay < MIN_HOURS_PER_DAY || hoursPerDay > MAX_HOURS_PER_DAY) {
    errors.hoursPerDay = `Ingresa entre ${MIN_HOURS_PER_DAY} y ${MAX_HOURS_PER_DAY} horas por dia.`;
  }

  if (form.topics.length > MAX_TOPICS_LENGTH) {
    errors.topics = `Los temas pendientes no pueden superar ${MAX_TOPICS_LENGTH} caracteres.`;
  }

  if (!content.difficultyOptions.includes(form.difficulty)) {
    errors.difficulty = 'Selecciona una dificultad valida.';
  }

  if (!content.focusOptions.includes(form.focus)) {
    errors.focus = 'Selecciona un objetivo valido.';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    message: Object.values(errors)[0] || '',
  };
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('studyflow-theme') || 'morning');
  const [form, setForm] = useState(() => ({
    subject: 'Matematicas',
    examDate: formatInputDate(addDays(new Date(), 14)),
    hoursPerDay: 2,
    difficulty: 'Media',
    focus: 'Examen parcial',
    topics: defaultTopics.join(', '),
  }));
  const [content, setContent] = useState({
    appInfo,
    checklistItems,
    defaultTopics,
    difficultyOptions,
    focusOptions,
    studyMethods,
  });
  const [plan, setPlan] = useState(fallbackPlan);
  const [planId, setPlanId] = useState(null);
  const [apiStatus, setApiStatus] = useState('idle');
  const [apiMessage, setApiMessage] = useState('');
  const validation = useMemo(() => validateStudyForm(form, content), [form, content]);
  const formErrors = validation.errors;
  const localPlan = useMemo(() => buildLocalStudyPlan(form), [form]);

  useEffect(() => {
    let isMounted = true;

    fetchContent()
      .then((remoteContent) => {
        if (isMounted) {
          setContent(remoteContent);
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiStatus('error');
          setApiMessage('No se pudo cargar el contenido desde la API. Se usara la informacion local.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!validation.isValid) {
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setApiStatus('saving');
      setApiMessage('');
      const payload = {
        ...form,
        subject: form.subject.trim(),
        hoursPerDay: Number(form.hoursPerDay),
        topics: form.topics.trim(),
      };

      try {
        const nextPlan = planId
          ? await updateStudyPlan(planId, payload, { signal: controller.signal })
          : await createStudyPlan(payload, { signal: controller.signal });
        setPlan(nextPlan);
        setPlanId(nextPlan.id);
        setApiStatus('ready');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setPlan(localPlan);
          setPlanId(null);
          setApiStatus(error.status === 422 ? 'validation' : 'error');
          setApiMessage(
            error.message || 'No se pudo conectar con la API. Revisa que FastAPI este activo.',
          );
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [form, localPlan, planId, validation]);

  const themeLabel = theme === 'morning' ? 'Noche' : 'Dia';
  const displayedApiStatus = validation.isValid ? apiStatus : 'validation';
  const displayedApiMessage = validation.isValid ? apiMessage : validation.message;
  const displayedPlan = validation.isValid ? plan : localPlan;

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleTheme() {
    setTheme((current) => (current === 'morning' ? 'night' : 'morning'));
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('studyflow-theme', theme);
  }, [theme]);

  return (
    <main>
      <section className="hero" id="inicio">
        <nav className="nav" aria-label="Principal">
          <a className="brand" href="#inicio" aria-label={content.appInfo.name}>
            <span className="brandMark">
              <GraduationCap size={22} aria-hidden="true" />
            </span>
            {content.appInfo.name}
          </a>
          <div className="navControls">
            <div className="navLinks">
              <a href="#planificador">Planificador</a>
              <a href="#agenda">Agenda</a>
              <a href="#checklist">Checklist</a>
            </div>
            <button className="themeToggle" onClick={toggleTheme} type="button">
              {theme === 'morning' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
              {themeLabel}
            </button>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <span className="eyebrow">
              <Sparkles size={16} aria-hidden="true" />
              Estudia con orden
            </span>
            <h1>{content.appInfo.name}</h1>
            <p>{content.appInfo.summary}</p>
            <div className="heroActions">
              <a className="button primary" href="#planificador">
                Crear plan
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button ghost" href="#agenda">
                Ver agenda
                <CalendarDays size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <section className="plannerPanel" id="planificador" aria-label="Planificador StudyFlow">
            <div className="panelHeader">
              <div>
                <span className="eyebrow">
                  <BrainCircuit size={16} aria-hidden="true" />
                  Planificador
                </span>
                <h2>Prepara tu proximo examen</h2>
              </div>
              <span className="paceBadge">{displayedPlan.pace}</span>
            </div>
            {displayedApiMessage && (
              <p
                className={
                  displayedApiStatus === 'validation' ? 'apiMessage validation' : 'apiMessage'
                }
                role="status"
              >
                {displayedApiMessage}
              </p>
            )}

            <div className="formGrid">
              <label className={formErrors.subject ? 'field hasError' : 'field'}>
                <span>Materia</span>
                <input
                  aria-describedby={formErrors.subject ? 'subject-error' : undefined}
                  aria-invalid={Boolean(formErrors.subject)}
                  maxLength={MAX_SUBJECT_LENGTH}
                  required
                  value={form.subject}
                  onChange={(event) => updateForm('subject', event.target.value)}
                  type="text"
                />
                {formErrors.subject && (
                  <small className="fieldError" id="subject-error">
                    {formErrors.subject}
                  </small>
                )}
              </label>

              <label className={formErrors.examDate ? 'field hasError' : 'field'}>
                <span>Fecha de examen</span>
                <input
                  aria-describedby={formErrors.examDate ? 'examDate-error' : undefined}
                  aria-invalid={Boolean(formErrors.examDate)}
                  min={formatInputDate(new Date())}
                  required
                  value={form.examDate}
                  onChange={(event) => updateForm('examDate', event.target.value)}
                  type="date"
                />
                {formErrors.examDate && (
                  <small className="fieldError" id="examDate-error">
                    {formErrors.examDate}
                  </small>
                )}
              </label>

              <label className={formErrors.hoursPerDay ? 'field hasError' : 'field'}>
                <span>Horas por dia</span>
                <input
                  aria-describedby={formErrors.hoursPerDay ? 'hoursPerDay-error' : undefined}
                  aria-invalid={Boolean(formErrors.hoursPerDay)}
                  min={MIN_HOURS_PER_DAY}
                  max={MAX_HOURS_PER_DAY}
                  required
                  step="0.5"
                  value={form.hoursPerDay}
                  onChange={(event) => updateForm('hoursPerDay', event.target.value)}
                  type="number"
                />
                {formErrors.hoursPerDay && (
                  <small className="fieldError" id="hoursPerDay-error">
                    {formErrors.hoursPerDay}
                  </small>
                )}
              </label>

              <label className={formErrors.difficulty ? 'field hasError' : 'field'}>
                <span>Dificultad</span>
                <select
                  aria-describedby={formErrors.difficulty ? 'difficulty-error' : undefined}
                  aria-invalid={Boolean(formErrors.difficulty)}
                  required
                  value={form.difficulty}
                  onChange={(event) => updateForm('difficulty', event.target.value)}
                >
                  {content.difficultyOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                {formErrors.difficulty && (
                  <small className="fieldError" id="difficulty-error">
                    {formErrors.difficulty}
                  </small>
                )}
              </label>
            </div>

            <label className={formErrors.topics ? 'wideField field hasError' : 'wideField field'}>
              <span>Temas pendientes</span>
              <textarea
                aria-describedby={formErrors.topics ? 'topics-error' : undefined}
                aria-invalid={Boolean(formErrors.topics)}
                maxLength={MAX_TOPICS_LENGTH}
                value={form.topics}
                onChange={(event) => updateForm('topics', event.target.value)}
                rows="3"
              />
              {formErrors.topics && (
                <small className="fieldError" id="topics-error">
                  {formErrors.topics}
                </small>
              )}
            </label>

            <div className="focusGroup" aria-label="Tipo de objetivo">
              {content.focusOptions.map((option) => (
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

            <div className="plannerFooter">
              <div>
                <span>Cobertura estimada</span>
                <strong>{displayedPlan.coverage}%</strong>
              </div>
              <div className="coverageTrack" aria-hidden="true">
                <span style={{ width: `${displayedPlan.coverage}%` }} />
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="section agendaSection" id="agenda">
        <div className="agendaIntro">
          <div>
            <span className="eyebrow">
              <NotebookPen size={16} aria-hidden="true" />
              Agenda de estudio
            </span>
            <h2>Tu ruta para {form.subject}</h2>
            <p>
              Divide tus temas en sesiones cortas, con practica y cierre antes del examen.
            </p>
          </div>

          <div className="planSummary" aria-label="Resumen del plan">
            <div>
              <CalendarDays size={20} aria-hidden="true" />
              <strong>{displayedPlan.daysUntilExam}</strong>
              <span>Dias</span>
            </div>
            <div>
              <Clock3 size={20} aria-hidden="true" />
              <strong>{displayedPlan.totalHours}</strong>
              <span>Horas</span>
            </div>
            <div>
              <Target size={20} aria-hidden="true" />
              <strong>{displayedPlan.coverage}%</strong>
              <span>Cobertura</span>
            </div>
          </div>
        </div>

        <div className="routeGrid">
          {displayedPlan.dailyPlan.map((item) => (
            <article className="routeCard" key={`${item.label}-${item.title}`}>
              <div className="cardTop">
                <span>{item.label}</span>
                <small>{item.time}</small>
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

      <section className="section checklistSection" id="checklist">
        <div className="sectionHeader">
          <span className="eyebrow">
            <ListChecks size={16} aria-hidden="true" />
            Antes del examen
          </span>
          <h2>Checklist para llegar con calma</h2>
          <p>
            Usa esta lista para saber si ya tienes teoria, practica y simulacro cubiertos.
          </p>
        </div>

        <div className="checklistGrid">
          {content.checklistItems.map((item) => (
            <article className="checkCard" key={item.title}>
              <CheckCircle2 size={20} aria-hidden="true" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section methodsSection">
        <div className="sectionHeader compact">
          <span className="eyebrow">
            <BookOpen size={16} aria-hidden="true" />
            Tecnicas de estudio
          </span>
          <h2>Metodos simples para estudiar mejor</h2>
        </div>

        <div className="methodsGrid">
          {content.studyMethods.map((method) => (
            <article className="methodCard" key={method.title}>
              <span>{method.label}</span>
              <h3>{method.title}</h3>
              <p>{method.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
