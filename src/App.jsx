import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function getTimeLeft(targetDate) {
  const now = new Date();
  let diff = targetDate - now;
  if (diff < 0) diff = 0;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.4375); // average month length
  const years = Math.floor(days / 365.25); // average year length

  return {
    years,
    months: months % 12,
    weeks: weeks % 4,
    days: days % 7,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    total: diff,
    totalDays: days,
    totalHours: hours,
    totalMinutes: minutes,
    totalSeconds: seconds
  };
}

const UNITS = [
  {
    key: 'years', label: 'Años', color: '#60a5fa', max: 100, // arbitrary max for bar
    getProgress: (t) => t.years / 2 // 2 years max for this countdown
  },
  {
    key: 'months', label: 'Meses', color: '#a78bfa', max: 12,
    getProgress: (t) => t.months / 12
  },
  {
    key: 'weeks', label: 'Semanas', color: '#f472b6', max: 4,
    getProgress: (t) => t.weeks / 4
  },
  {
    key: 'days', label: 'Días', color: '#facc15', max: 7,
    getProgress: (t) => t.days / 7
  },
  {
    key: 'hours', label: 'Horas', color: '#34d399', max: 24,
    getProgress: (t) => t.hours / 24
  },
  {
    key: 'minutes', label: 'Minutos', color: '#38bdf8', max: 60,
    getProgress: (t) => t.minutes / 60
  },
  {
    key: 'seconds', label: 'Segundos', color: '#f87171', max: 60,
    getProgress: (t) => t.seconds / 60
  },
];

function ClockHand({ angle, length, color, width, center = 160, shadow = true, glow = true }) {
  const rad = (angle - 90) * (Math.PI / 180);
  const x = center + length * Math.cos(rad);
  const y = center + length * Math.sin(rad);
  return (
    <g>
      {/* Sombra sutil */}
      {shadow && (
        <line
          x1={center}
          y1={center}
          x2={x}
          y2={y}
          stroke="#000"
          strokeWidth={width + 2}
          strokeLinecap="round"
          opacity="0.18"
          filter="url(#clockHandShadow)"
        />
      )}
      {/* Aguja principal */}
      <line
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        style={glow ? { filter: `drop-shadow(0 0 6px ${color}88)` } : {}}
      />
      {/* Círculo central */}
      {width >= 7 && (
        <circle cx={center} cy={center} r={width * 0.7} fill={color} opacity="0.18" />
      )}
    </g>
  );
}

function TimelineBar({ label, color, percent, value }) {
  return (
    <div className="timeline-bar">
      <div className="timeline-label" style={{ color }}>{label}</div>
      <div className="timeline-bar-bg">
        <div className="timeline-bar-fill" style={{ width: `${percent}%`, background: color }} />
      </div>
      <div className="timeline-value" style={{ color }}>{value}</div>
    </div>
  );
}

function FlipCard({ value, label, color }) {
  return (
    <div className="flip-card" style={{ borderColor: color }}>
      <div className="flip-card-inner">
        <div className="flip-card-front" style={{ color }}>{value}</div>
        <div className="flip-card-back" style={{ color }}>{value}</div>
      </div>
      <div className="flip-card-label" style={{ color }}>{label}</div>
    </div>
  );
}

function BarVertical({ value, label, color, percent }) {
  return (
    <div className="bar-vertical">
      <div className="bar-vertical-value" style={{ color }}>{value}</div>
      <div className="bar-vertical-bg">
        <div className="bar-vertical-fill" style={{ height: `${percent}%`, background: color }} />
      </div>
      <div className="bar-vertical-label" style={{ color }}>{label}</div>
    </div>
  );
}

function DonutRing({ value, label, color, percent, radius, strokeWidth, center, labelIndex, totalLabels }) {
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference * (1 - percent / 100);
  // Ajuste: reducir radio de etiquetas y rotar grupo para mejor visibilidad
  let labelX = center;
  let labelY = center;
  let labelFontSize = '0.8rem';
  let labelWeight = 'bold';
  let labelStroke = 2.2;
  if (labelIndex !== undefined && totalLabels) {
    // Rotar todo el grupo de etiquetas 30° para evitar recortes arriba/izquierda
    const rotation = Math.PI / 6; // 30 grados
    const angle = (labelIndex / totalLabels) * 2 * Math.PI - Math.PI / 2 + rotation;
    const labelRadius = radius + 28; // más cerca del centro para evitar recortes
    labelX = center + labelRadius * Math.cos(angle);
    labelY = center + labelRadius * Math.sin(angle);
  }
  return (
    <g>
      <circle
        cx={center}
        cy={center}
        r={normalizedRadius}
        fill="none"
        stroke="#181c23"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={normalizedRadius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)' }}
      />
      {/* Etiqueta alineada y dentro del SVG */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fontSize={labelFontSize}
        fill={color}
        fontWeight={labelWeight}
        style={{ userSelect: 'none', pointerEvents: 'none', paintOrder: 'stroke', stroke: '#23272f', strokeWidth: labelStroke }}
        dy="0.35em"
      >
        {label}
      </text>
      {/* Valor en el centro solo para el anillo más interno */}
      {labelIndex === totalLabels - 1 && (
        <text
          x={center}
          y={center}
          textAnchor="middle"
          fontSize="1.6rem"
          fill="#fff"
          fontWeight="bold"
          style={{ userSelect: 'none', pointerEvents: 'none', paintOrder: 'stroke', strokeWidth: 6, stroke: '#23272f' }}
          dy="0.4em"
        >
          {value}
        </text>
      )}
    </g>
  );
}

function App() {
  const targetDate = new Date('2027-01-27T00:00:00');
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flipUnits = [
    { key: 'years', label: 'Años', color: '#60a5fa', value: timeLeft.years },
    { key: 'months', label: 'Meses', color: '#a78bfa', value: timeLeft.months },
    { key: 'weeks', label: 'Semanas', color: '#f472b6', value: timeLeft.weeks },
    { key: 'days', label: 'Días', color: '#facc15', value: timeLeft.days },
    { key: 'hours', label: 'Horas', color: '#34d399', value: timeLeft.hours },
    { key: 'minutes', label: 'Minutos', color: '#38bdf8', value: timeLeft.minutes },
    { key: 'seconds', label: 'Segundos', color: '#f87171', value: timeLeft.seconds },
  ];

  const barUnits = [
    { key: 'years', label: 'Años', color: '#60a5fa', percent: (timeLeft.years / 2) * 100, value: timeLeft.years },
    { key: 'months', label: 'Meses', color: '#a78bfa', percent: (timeLeft.months / 12) * 100, value: timeLeft.months },
    { key: 'weeks', label: 'Semanas', color: '#f472b6', percent: (timeLeft.weeks / 4) * 100, value: timeLeft.weeks },
    { key: 'days', label: 'Días', color: '#facc15', percent: (timeLeft.days / 7) * 100, value: timeLeft.days },
    { key: 'hours', label: 'Horas', color: '#34d399', percent: (timeLeft.hours / 24) * 100, value: timeLeft.hours },
    { key: 'minutes', label: 'Minutos', color: '#38bdf8', percent: (timeLeft.minutes / 60) * 100, value: timeLeft.minutes },
    { key: 'seconds', label: 'Segundos', color: '#f87171', percent: (timeLeft.seconds / 60) * 100, value: timeLeft.seconds },
  ];

  const donutUnits = [
    { key: 'years', label: 'Años', color: '#60a5fa', percent: (timeLeft.years / 2) * 100, value: timeLeft.years },
    { key: 'months', label: 'Meses', color: '#a78bfa', percent: (timeLeft.months / 12) * 100, value: timeLeft.months },
    { key: 'weeks', label: 'Semanas', color: '#f472b6', percent: (timeLeft.weeks / 4) * 100, value: timeLeft.weeks },
    { key: 'days', label: 'Días', color: '#facc15', percent: (timeLeft.days / 7) * 100, value: timeLeft.days },
    { key: 'hours', label: 'Horas', color: '#34d399', percent: (timeLeft.hours / 24) * 100, value: timeLeft.hours },
    { key: 'minutes', label: 'Minutos', color: '#38bdf8', percent: (timeLeft.minutes / 60) * 100, value: timeLeft.minutes },
    { key: 'seconds', label: 'Segundos', color: '#f87171', percent: (timeLeft.seconds / 60) * 100, value: timeLeft.seconds },
  ];
  const donutRings = [90, 75, 62, 50, 38, 27, 17];
  const donutStroke = [12, 10, 9, 8, 7, 6, 5];
  const center = 110;
  const svgSize = 220;

  // Visualización tipo barras verticales (minimalista) - ahora primera visualización
  const barsVertical = (
    <div className="bars-vertical-row" style={{ display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'end', minHeight: 100, margin: '32px 0' }}>
      {barUnits.map((unit) => (
        <div className="bar-vertical" key={unit.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36 }}>
          <div className="bar-vertical-value" style={{ color: unit.color, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{unit.value}</div>
          <div className="bar-vertical-bg" style={{ background: '#23272f', borderRadius: 8, width: 16, height: 60, display: 'flex', alignItems: 'flex-end' }}>
            <div className="bar-vertical-fill" style={{ height: `${unit.percent}%`, background: unit.color, width: 16, borderRadius: 8, transition: 'height 0.5s cubic-bezier(.4,2,.6,1)' }} />
          </div>
          <div className="bar-vertical-label" style={{ color: '#b0b6c3', fontSize: 12, marginTop: 4 }}>{unit.label}</div>
        </div>
      ))}
    </div>
  );

  // Visualización tipo círculo con tarjetas alrededor + agujas (sin fondo extra, sin tarjetas)
  const circleCards = (
    <div className="circle-cards" style={{ position: 'relative', width: svgSize, height: svgSize, margin: '32px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="clockHandShadow" x="-20%" y="-20%" width="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>
        {/* Agujas */}
        <ClockHand angle={(timeLeft.seconds / 60) * 360} length={80} color="#f87171" width={3} center={center} />
        <ClockHand angle={(timeLeft.minutes / 60) * 360} length={65} color="#38bdf8" width={4} center={center} />
        <ClockHand angle={(timeLeft.hours / 24) * 360} length={50} color="#34d399" width={5} center={center} />
        <ClockHand angle={timeLeft.days / 7 * 360} length={35} color="#facc15" width={6} center={center} />
        <ClockHand angle={timeLeft.weeks / 4 * 360} length={25} color="#f472b6" width={7} center={center} />
        <ClockHand angle={timeLeft.months / 12 * 360} length={15} color="#a78bfa" width={8} center={center} />
        <ClockHand angle={timeLeft.years / 2 * 360} length={10} color="#60a5fa" width={9} center={center} />
        {/* Etiquetas */}
        {flipUnits.map((unit, i) => {
          const angle = (i / flipUnits.length) * 2 * Math.PI - Math.PI / 2;
          const r = 90;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <text
              key={unit.key}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="0.7rem"
              fill={unit.color}
              fontWeight="bold"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
              dy="0.35em"
            >
              {unit.label}
            </text>
          );
        })}
      </svg>
    </div>
  );

  // Visualización tipo timeline horizontal (minimalista)
  const timeline = (
    <div className="timeline-horizontal" style={{ maxWidth: 520, margin: '32px auto', padding: 0 }}>
      {barUnits.map((unit) => (
        <div key={unit.key} style={{ margin: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#b0b6c3' }}>
            <span>{unit.label}</span>
            <span style={{ color: unit.color, fontWeight: 600 }}>{unit.value}</span>
          </div>
          <div style={{ background: '#23272f', borderRadius: 6, height: 7, marginTop: 4 }}>
            <div style={{ width: `${unit.percent}%`, background: unit.color, height: 7, borderRadius: 6, transition: 'width 0.5s cubic-bezier(.4,2,.6,1)' }} />
          </div>
        </div>
      ))}
    </div>
  );

  // Visualización tipo donut (minimalista)
  const donut = (
    <div className="donut-chart" style={{ margin: '32px auto', width: svgSize, maxWidth: '100%' }}>
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}> 
        <circle cx={center} cy={center} r={98} fill="#23272f" />
        {donutUnits.map((unit, i) => (
          <DonutRing
            key={unit.key}
            value={unit.value}
            label={unit.label}
            color={unit.color}
            percent={unit.percent}
            radius={donutRings[i]}
            strokeWidth={donutStroke[i]}
            center={center}
            labelIndex={i}
            totalLabels={donutUnits.length}
          />
        ))}
      </svg>
    </div>
  );

  // Valores exactos (minimalista, alineados en columna, sin fondo)
  const exactValues = (
    <div className="exact-values" style={{ maxWidth: 520, margin: '38px auto 0 auto', padding: 0, color: '#b0b6c3', boxShadow: 'none', fontSize: 16, background: 'none' }}>
      <h3 style={{
        marginBottom: 18,
        color: '#fff',
        fontWeight: 800,
        fontSize: '1.45rem',
        textAlign: 'center',
        letterSpacing: 1,
        textShadow: '0 2px 12px #0006, 0 1px 0 #60a5fa33',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        background: 'linear-gradient(90deg, #60a5fa 10%, #a78bfa 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Cantidad exacta restante
      </h3>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', padding: 0, margin: 0, listStyle: 'none' }}>
        <li><strong style={{ color: '#60a5fa' }}>{(timeLeft.totalSeconds / (60 * 60 * 24 * 365.25)).toFixed(3)}</strong> años</li>
        <li><strong style={{ color: '#a78bfa' }}>{(timeLeft.totalSeconds / (60 * 60 * 24 * 30.4375)).toFixed(3)}</strong> meses</li>
        <li><strong style={{ color: '#f472b6' }}>{(timeLeft.totalSeconds / (60 * 60 * 24 * 7)).toFixed(3)}</strong> semanas</li>
        <li><strong style={{ color: '#facc15' }}>{(timeLeft.totalSeconds / (60 * 60 * 24)).toFixed(3)}</strong> días</li>
        <li><strong style={{ color: '#34d399' }}>{(timeLeft.totalSeconds / (60 * 60)).toFixed(3)}</strong> horas</li>
        <li><strong style={{ color: '#38bdf8' }}>{(timeLeft.totalSeconds / 60).toFixed(3)}</strong> minutos</li>
        <li><strong style={{ color: '#f87171' }}>{timeLeft.totalSeconds}</strong> segundos</li>
      </ul>
    </div>
  );

  // Quitar el contenedor principal, dejar solo el fragmento con el título y las visualizaciones
  return (
    <>
      <div className="countdown-title" style={{
        color: '#fff',
        textAlign: 'center',
        fontWeight: 800,
        fontSize: '2.5rem',
        margin: '38px 0 0 0',
        letterSpacing: 2,
        textShadow: '0 4px 24px #0007, 0 1px 0 #60a5fa44',
        lineHeight: 1.1,
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        background: 'linear-gradient(90deg, #60a5fa 10%, #a78bfa 50%, #f472b6 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Cuenta regresiva al <span style={{ color: '#fff', background: 'none', WebkitTextFillColor: 'unset', fontWeight: 900, textShadow: '0 2px 12px #23272f' }}>27 de enero de 2027</span>
      </div>
      {barsVertical}
      {circleCards}
      {timeline}
      {donut}
      {exactValues}
    </>
  );
}

export default App
