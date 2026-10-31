/* byld — Google Analytics 4.
   GA_ID es el ID de medicion del flujo de datos web (G-XXXXXXXXXX).
   Mientras siga el valor de ejemplo, el script no carga nada.
   Ademas de las visitas, registra los clics a WhatsApp y al correo. */
(function(){
  const GA_ID = 'G-XXXXXXXXXX';
  if(!/^G-[A-Z0-9]+$/.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX') return;

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);

  /* ---------- clics de contacto ---------- */
  document.addEventListener('click', e=>{
    const a = e.target.closest && e.target.closest('a[href]');
    if(!a) return;
    const href = a.getAttribute('href');
    let name = null;
    if(/wa\.me\//.test(href)) name = 'clic_whatsapp';
    else if(/^mailto:/.test(href)) name = 'clic_correo';
    if(!name) return;
    const sec = a.closest('section[id], nav, footer');
    gtag('event', name, {
      ubicacion: sec ? (sec.id || sec.tagName.toLowerCase()) : 'pagina',
      texto: (a.textContent || '').trim().slice(0, 60)
    });
  });
})();
