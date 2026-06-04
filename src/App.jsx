import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cloud,
  Code2,
  ExternalLink,
  Gauge,
  GitBranch,
  Layers3,
  Play,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import heroImage from './assets/hero-devops.png';
import {
  appInfo,
  demoChanges,
  pipelineSteps,
  qualityAttributes,
  sprintItems,
} from './content';

const statusLabels = {
  all: 'Todo',
  todo: 'Pendiente',
  review: 'Revision',
  done: 'Listo',
};

const statusClasses = {
  todo: 'statusTodo',
  review: 'statusReview',
  done: 'statusDone',
};

function App() {
  const [filter, setFilter] = useState('all');
  const [selectedStep, setSelectedStep] = useState(4);

  const visibleItems = useMemo(() => {
    if (filter === 'all') return sprintItems;
    return sprintItems.filter((item) => item.status === filter);
  }, [filter]);

  const completedItems = sprintItems.filter((item) => item.status === 'done').length;
  const progress = Math.round((completedItems / sprintItems.length) * 100);

  return (
    <main>
      <section className="hero">
        <nav className="nav" aria-label="Principal">
          <a className="brand" href="#inicio" aria-label={appInfo.name}>
            <span className="brandMark">
              <Rocket size={20} aria-hidden="true" />
            </span>
            {appInfo.name}
          </a>
          <div className="navLinks">
            <a href="#tablero">Tablero</a>
            <a href="#calidad">Calidad</a>
            <a href="#devops">DevOps</a>
          </div>
        </nav>

        <div className="heroGrid" id="inicio">
          <div className="heroCopy">
            <span className="eyebrow">
              <GitBranch size={16} aria-hidden="true" />
              GitHub Actions + Google Cloud Run
            </span>
            <h1>{appInfo.name}</h1>
            <p>{appInfo.summary}</p>
            <div className="heroActions">
              <a className="button primary" href="#tablero">
                <Play size={18} aria-hidden="true" />
                Ver demo
              </a>
              <a className="button ghost" href={appInfo.cloudRunUrl} target="_blank" rel="noreferrer">
                <Cloud size={18} aria-hidden="true" />
                Cloud Run
              </a>
            </div>
          </div>

          <div className="heroVisual" aria-label="Visual del sistema AgileFlow DevOps">
            <img src={heroImage} alt="" />
            <div className="floatingMetric metricTop">
              <Gauge size={18} aria-hidden="true" />
              <strong>{progress}%</strong>
              <span>Sprint</span>
            </div>
            <div className="floatingMetric metricBottom">
              <ShieldCheck size={18} aria-hidden="true" />
              <strong>OK</strong>
              <span>Build</span>
            </div>
          </div>
        </div>
      </section>

      <section className="statsBand" aria-label="Resumen del proyecto">
        <div>
          <strong>{sprintItems.length}</strong>
          <span>Historias</span>
        </div>
        <div>
          <strong>{completedItems}</strong>
          <span>Terminadas</span>
        </div>
        <div>
          <strong>{pipelineSteps.length}</strong>
          <span>Pasos CI/CD</span>
        </div>
        <div>
          <strong>8080</strong>
          <span>Puerto Cloud Run</span>
        </div>
      </section>

      <section className="section" id="tablero">
        <div className="sectionHeader">
          <span className="eyebrow">
            <Layers3 size={16} aria-hidden="true" />
            Sprint demostrable
          </span>
          <h2>Tablero simple para explicar avances</h2>
          <p>
            Filtra tareas, muestra estado del sprint y demuestra que el sistema responde sin depender de un backend.
          </p>
        </div>

        <div className="toolbar" role="group" aria-label="Filtros de tareas">
          {Object.entries(statusLabels).map(([value, label]) => (
            <button
              className={filter === value ? 'filter active' : 'filter'}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="taskGrid">
          {visibleItems.map((item) => (
            <article className="taskCard" key={item.id}>
              <div className="taskTop">
                <span className={`status ${statusClasses[item.status]}`}>{statusLabels[item.status]}</span>
                <span className="priority">{item.priority}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.owner}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section qualitySection" id="calidad">
        <div className="sectionHeader">
          <span className="eyebrow">
            <Activity size={16} aria-hidden="true" />
            Atributos de calidad
          </span>
          <h2>Preparado para cambios en vivo</h2>
          <p>
            La estructura favorece modificabilidad, mantenibilidad, usabilidad y despliegue reproducible.
          </p>
        </div>

        <div className="qualityGrid">
          {qualityAttributes.map((attribute) => (
            <article className="qualityCard" key={attribute.title}>
              <span>{attribute.score}</span>
              <h3>{attribute.title}</h3>
              <p>{attribute.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section devopsSection" id="devops">
        <div className="devopsLayout">
          <div>
            <span className="eyebrow">
              <Code2 size={16} aria-hidden="true" />
              Flujo DevOps
            </span>
            <h2>Pipeline listo para explicar y desplegar</h2>
            <p>
              El workflow compila la app, autentica con Google Cloud y despliega el contenedor en Cloud Run.
            </p>
            <div className="links">
              <a href={appInfo.repositoryUrl} target="_blank" rel="noreferrer">
                Repositorio
                <ExternalLink size={16} aria-hidden="true" />
              </a>
              <a href={appInfo.cloudRunUrl} target="_blank" rel="noreferrer">
                Servicio desplegado
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="pipeline" aria-label="Pasos del pipeline">
            {pipelineSteps.map((step, index) => (
              <button
                className={index <= selectedStep ? 'pipelineStep active' : 'pipelineStep'}
                key={step}
                onClick={() => setSelectedStep(index)}
                type="button"
              >
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{step}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section changeSection">
        <div className="sectionHeader compact">
          <span className="eyebrow">
            <SlidersHorizontal size={16} aria-hidden="true" />
            Para la defensa
          </span>
          <h2>Cambios rapidos que puedes hacer frente al docente</h2>
        </div>
        <div className="changeList">
          {demoChanges.map((change) => (
            <div key={change}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{change}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
