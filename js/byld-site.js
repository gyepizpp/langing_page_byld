/* byld — comportamiento compartido del sitio.
   Reveal en scroll, entrada escalonada, nav condensado, barra de progreso,
   titulares palabra por palabra, parallax del hero, tarjeta 3D y luz en tarjetas.
   El carrusel del hero queda inerte en paginas sin .step / .stack-card. */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ease = 'cubic-bezier(.22,1,.36,1)';

  /* ---------- titulares: cada palabra entra por separado ---------- */
  function splitWords(el, stepMs, startMs){
    if(!el || el.classList.contains('split')) return;
    let n = 0;
    const walk = (node)=>{
      [...node.childNodes].forEach(child=>{
        if(child.nodeType === 3){
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(part=>{
            if(!part) return;
            if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--d', (startMs + n * stepMs) + 'ms');
            n++;
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if(child.nodeType === 1 && child.tagName !== 'BR'){
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add('split');
  }
  if(!reduce){
    document.querySelectorAll('.hero h1, .page-hero h1').forEach(h=>splitWords(h, 55, 120));
    document.querySelectorAll('.sec-head h2, .geo-copy h2, .final h2').forEach(h=>{ if(h.closest('.reveal')) splitWords(h, 45, 60); });
  }

  /* ---------- reveal en scroll ---------- */
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

  /* ---------- entrada escalonada de rejillas ---------- */
  document.querySelectorAll('.pillars, .proc, .agentgrid, .sectgrid, .cli-grid, .casos, .shift, .linkgrid').forEach(g=>{
    g.classList.add('stagger');
    [...g.children].forEach((c,i)=>c.style.setProperty('--i',i));
    if(!g.classList.contains('reveal')) g.classList.add('reveal');
    io.observe(g);
  });

  /* ---------- luz que sigue al cursor en tarjetas ---------- */
  const spots = document.querySelectorAll('.pillar, .phase, .agent, .sectcard, .linkcard, .cli-card');
  spots.forEach(c=>c.classList.add('spot'));
  if(finePointer && !reduce){
    spots.forEach(c=>{
      c.addEventListener('pointermove', e=>{
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, {passive:true});
    });
  }

  /* ---------- nav condensado, barra de progreso y parallax del hero ---------- */
  const navEl = document.getElementById('nav'), bar = document.getElementById('sprog-bar');
  const heroCopy = document.querySelector('.hero .hero-copy');
  const heroVisual = document.querySelector('.hero .hero-visual');
  const hero = document.querySelector('.hero');
  let ticking = false;
  function onScroll(){
    if(ticking) return; ticking = true;
    requestAnimationFrame(()=>{
      const y = window.scrollY || 0;
      if(navEl) navEl.classList.toggle('small', y > 40);
      if(bar){
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (y/max)*100 : 0) + '%';
      }
      if(hero && !reduce){
        const h = hero.offsetHeight || 1;
        const p = Math.min(1, y / h);
        if(heroCopy){
          heroCopy.style.setProperty('--py', (p * 70).toFixed(1) + 'px');
          heroCopy.style.setProperty('--po', (1 - p * 1.15).toFixed(3));
        }
        if(heroVisual) heroVisual.style.setProperty('--pv', (p * 28).toFixed(1) + 'px');
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- tarjeta del hero: inclinacion 3D y brillo ---------- */
  const card = document.querySelector('.stack-card');
  if(card && heroVisual && finePointer && !reduce){
    const glare = document.createElement('div'); glare.className = 'glare'; card.appendChild(glare);
    const zone = hero.querySelector('.hero-in') || heroVisual;
    let raf = null, tx = 0, ty = 0, gx = 30, gy = 20;
    function apply(){
      card.style.setProperty('--rx', ty.toFixed(2) + 'deg');
      card.style.setProperty('--ry', tx.toFixed(2) + 'deg');
      card.style.setProperty('--gx', gx.toFixed(1) + '%');
      card.style.setProperty('--gy', gy.toFixed(1) + '%');
      raf = null;
    }
    zone.addEventListener('pointermove', e=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      const inside = px >= -0.35 && px <= 1.35 && py >= -0.35 && py <= 1.35;
      heroVisual.classList.toggle('tilting', inside);
      if(!inside){ tx = 0; ty = 0; } else {
        tx = (px - 0.5) * 9;      // rotateY
        ty = (0.5 - py) * 7;      // rotateX
        gx = px * 100; gy = py * 100;
      }
      if(!raf) raf = requestAnimationFrame(apply);
    }, {passive:true});
    zone.addEventListener('pointerleave', ()=>{ heroVisual.classList.remove('tilting'); tx = 0; ty = 0; if(!raf) raf = requestAnimationFrame(apply); });
  }

  /* ---------- carrusel del hero ---------- */
  const steps = [...document.querySelectorAll('.step')];
  const panes = [...document.querySelectorAll('.vpane')];
  let cur = 1, timer = null, held = false;
  function setStage(n){
    cur = n;
    steps.forEach(s=>{ const i=+s.dataset.s; s.classList.toggle('on', i===n); s.classList.toggle('done', i<n); });
    panes.forEach(p=>p.classList.toggle('on', +p.dataset.s===n));
  }
  function tick(){ setStage(cur>=4 ? 1 : cur+1); }
  function play(){ if(!held && !timer){ timer = setInterval(tick, 3400); if(card) card.classList.add('playing'); } }
  function stop(){ clearInterval(timer); timer = null; if(card) card.classList.remove('playing'); }
  steps.forEach(s=>s.addEventListener('click',()=>{ held = true; stop(); setStage(+s.dataset.s); }));
  if(card){
    const cio = new IntersectionObserver(es=>es.forEach(e=>{ e.isIntersecting ? play() : stop(); }),{threshold:.3});
    cio.observe(card);
  }
})();
