/* byld — comportamiento compartido del sitio.
   Reveal en scroll, entrada escalonada, nav condensado y barra de progreso.
   El carrusel del hero queda inerte en paginas sin .step / .stack-card. */
const io = new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in'); io.unobserve(e.target);}})},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  function revealVisible(){
    const vh = window.innerHeight;
    document.querySelectorAll('.reveal:not(.in)').forEach(el=>{
      const r = el.getBoundingClientRect();
      if(r.top < vh*0.95 && r.bottom > 0){ el.classList.add('in'); io.unobserve(el); }
    });
  }
  revealVisible();
  window.addEventListener('load', revealVisible);

  // stagger + nav + progress
  document.querySelectorAll('.pillars, .proc, .agentgrid, .sectgrid, .cli-grid, .casos, .shift').forEach(g=>{
    g.classList.add('stagger');
    [...g.children].forEach((c,i)=>c.style.setProperty('--i',i));
    if(!g.classList.contains('reveal')) g.classList.add('reveal');
    io.observe(g);
  });
  const navEl = document.getElementById('nav'), bar = document.getElementById('sprog-bar');
  function onScroll(){
    const y = window.scrollY || 0;
    if(navEl) navEl.classList.toggle('small', y > 60);
    if(bar){
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y/max)*100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  const steps = [...document.querySelectorAll('.step')];
  const panes = [...document.querySelectorAll('.vpane')];
  let cur = 1, timer = null, held = false;
  function setStage(n){
    cur = n;
    steps.forEach(s=>{ const i=+s.dataset.s; s.classList.toggle('on', i===n); s.classList.toggle('done', i<n); });
    panes.forEach(p=>p.classList.toggle('on', +p.dataset.s===n));
  }
  function tick(){ setStage(cur>=4 ? 1 : cur+1); }
  function play(){ if(!held && !timer) timer = setInterval(tick, 3400); }
  function stop(){ clearInterval(timer); timer = null; }
  steps.forEach(s=>s.addEventListener('click',()=>{ held = true; stop(); setStage(+s.dataset.s); }));
  const card = document.querySelector('.stack-card');
  if(card){
    const cio = new IntersectionObserver(es=>es.forEach(e=>{ e.isIntersecting ? play() : stop(); }),{threshold:.3});
    cio.observe(card);
  }
