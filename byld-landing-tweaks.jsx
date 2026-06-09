// byld-landing-tweaks.jsx
// Panel de Tweaks para la landing: dirección (claro/oscuro), ángulo del hero, acento.

// Acentos — clave = el string oklch base (lo que TweakColor emite tal cual).
const ACCENTS = {
  'oklch(0.52 0.215 264)': { bright:'oklch(0.58 0.225 264)', deep:'oklch(0.42 0.18 264)', soft:'oklch(0.72 0.12 264)', t1:'oklch(0.965 0.02 264)', t2:'oklch(0.93 0.045 264)' },
  'oklch(0.52 0.20 245)':  { bright:'oklch(0.58 0.21 245)',  deep:'oklch(0.42 0.17 245)', soft:'oklch(0.72 0.11 245)', t1:'oklch(0.965 0.02 245)', t2:'oklch(0.93 0.045 245)' },
  'oklch(0.52 0.21 286)':  { bright:'oklch(0.58 0.22 286)',  deep:'oklch(0.42 0.18 286)', soft:'oklch(0.72 0.12 286)', t1:'oklch(0.965 0.02 286)', t2:'oklch(0.93 0.045 286)' },
  'oklch(0.55 0.13 200)':  { bright:'oklch(0.60 0.14 200)',  deep:'oklch(0.45 0.11 200)', soft:'oklch(0.74 0.09 200)', t1:'oklch(0.965 0.02 200)', t2:'oklch(0.93 0.045 200)' },
};
const ACCENT_DEFAULT = 'oklch(0.52 0.215 264)';

const HERO = {
  control: {
    title: 'Control operativo<br>en un solo <span class="blue">sistema.</span>',
    lede:  'Diseñamos e implementamos la infraestructura que centraliza, mide y controla tu operación —procesos, costos y productividad— bajo un mismo sistema de gestión.'
  },
  visibilidad: {
    title: 'Visibilidad operativa<br><span class="blue">en tiempo real.</span>',
    lede:  'Consolidamos la información de cada área en indicadores precisos y oportunos, para que la dirección opere sobre datos y no sobre suposiciones.'
  },
  gestion: {
    title: 'Sistemas de gestión<br>a la medida de tu <span class="blue">negocio.</span>',
    lede:  'Modelamos tu operación y desarrollamos el software que la mide y controla: KPIs, alertas y trazabilidad alineados a tus procesos reales.'
  },
  datos: {
    title: 'Decisiones basadas<br>en <span class="blue">datos.</span>',
    lede:  'Sustituimos la intuición por información estructurada: indicadores accionables, responsables definidos y una única fuente de verdad.'
  },
  trazabilidad: {
    title: 'De la dispersión<br>a la <span class="blue">trazabilidad total.</span>',
    lede:  'Centralizamos datos dispersos en una arquitectura de control que da seguimiento a cada proceso, costo e indicador de tu operación.'
  },
  rentabilidad: {
    title: 'Control de costos,<br>mayor <span class="blue">rentabilidad.</span>',
    lede:  'Identificamos fugas y desviaciones y las ponemos bajo control con un sistema que vuelve visible y entendible la rentabilidad de tu operación.'
  },
  optimizacion: {
    title: 'Mide, controla y<br><span class="blue">optimiza tu operación.</span>',
    lede:  'Implementamos el ciclo completo de control operativo —medición, seguimiento y mejora continua— sobre la infraestructura de datos de tu empresa.'
  },
  arquitectura: {
    title: 'Arquitectura de control<br>para tu <span class="blue">empresa.</span>',
    lede:  'Definimos qué medir, cómo medirlo y quién responde, y construimos el sistema de gestión que lo sostiene día a día.'
  },
};

function applyAccent(base){
  const a = ACCENTS[base] || ACCENTS[ACCENT_DEFAULT];
  const r = document.documentElement.style;
  r.setProperty('--blue', base);
  r.setProperty('--blue-bright', a.bright);
  r.setProperty('--blue-deep', a.deep);
  r.setProperty('--blue-soft', a.soft);
  if (document.documentElement.dataset.theme !== 'dark') {
    r.setProperty('--blue-tint', a.t1);
    r.setProperty('--blue-tint-2', a.t2);
  }
}

function applyHero(key){
  const h = HERO[key] || HERO.transformacion;
  const t = document.getElementById('heroTitle');
  const l = document.getElementById('heroLede');
  if (t) t.innerHTML = h.title;
  if (l) l.textContent = h.lede;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tema": "claro",
  "heroAngulo": "control",
  "acento": "oklch(0.52 0.215 264)"
}/*EDITMODE-END*/;

function LandingTweaks(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(()=>{ document.documentElement.dataset.theme = (t.tema === 'oscuro' ? 'dark' : 'light'); applyAccent(t.acento); }, [t.tema]);
  React.useEffect(()=>{ applyAccent(t.acento); }, [t.acento]);
  React.useEffect(()=>{ applyHero(t.heroAngulo); }, [t.heroAngulo]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Dirección" />
      <TweakRadio label="Tema" value={t.tema} options={['claro','oscuro']}
                  onChange={(v)=>setTweak('tema', v)} />
      <TweakSection label="Hero" />
      <TweakSelect label="Ángulo" value={t.heroAngulo}
                   options={[
                     {value:'control', label:'Control operativo'},
                     {value:'visibilidad', label:'Visibilidad operativa'},
                     {value:'gestion', label:'Sistemas de gestión'},
                     {value:'datos', label:'Decisiones con datos'},
                     {value:'trazabilidad', label:'Trazabilidad total'},
                     {value:'rentabilidad', label:'Control de costos'},
                     {value:'optimizacion', label:'Mide, controla, optimiza'},
                     {value:'arquitectura', label:'Arquitectura de control'},
                   ]}
                   onChange={(v)=>setTweak('heroAngulo', v)} />
      <TweakSection label="Acento" />
      <TweakColor label="Color de marca" value={t.acento}
                  options={[
                    'oklch(0.52 0.215 264)',
                    'oklch(0.52 0.20 245)',
                    'oklch(0.52 0.21 286)',
                    'oklch(0.55 0.13 200)',
                  ]}
                  onChange={(v)=>setTweak('acento', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<LandingTweaks />);
