/* ============================================================
   BYLD — Brand web components
   <byld-mark size tone>  → símbolo (corchetes + dato azul)
   <byld-lock size tone>  → símbolo + wordmark "byld·"
   tone: ink (default) · invert · onblue · mono · blue
   Requires css/byld-tokens.css for color vars + wordmark.
   ============================================================ */
(function () {
  function tones(tone) {
    switch (tone) {
      case 'invert': return { ink: '#ffffff', blue: 'var(--blue-soft)' };
      case 'onblue': return { ink: '#ffffff', blue: '#ffffff' };
      case 'mono':   return { ink: 'var(--ink-900)', blue: 'var(--ink-900)' };
      case 'monoinv':return { ink: '#ffffff', blue: '#ffffff' };
      default:       return { ink: 'var(--ink-900)', blue: 'var(--blue)' };
    }
  }
  function markSVG(size, tone, blueOverride, inkOverride) {
    const t = tones(tone);
    const ink = inkOverride || t.ink;
    const blue = blueOverride || t.blue;
    const sw = Math.max(2, size * 0.11);
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M40 22 H26 a4 4 0 00-4 4 V74 a4 4 0 004 4 H40" stroke="${ink}" stroke-width="11" stroke-linecap="round"/>
      <path d="M60 22 H74 a4 4 0 014 4 V74 a4 4 0 01-4 4 H60" stroke="${ink}" stroke-width="11" stroke-linecap="round"/>
      <rect x="40" y="40" width="20" height="20" rx="5" fill="${blue}"/>
    </svg>`;
  }

  class ByldMark extends HTMLElement {
    connectedCallback() {
      const size = parseFloat(this.getAttribute('size')) || 40;
      const tone = this.getAttribute('tone') || 'ink';
      this.style.display = 'inline-flex';
      this.style.lineHeight = '0';
      this.innerHTML = markSVG(size, tone, this.getAttribute('blue'), this.getAttribute('ink'));
    }
  }

  class ByldLock extends HTMLElement {
    connectedCallback() {
      const size = parseFloat(this.getAttribute('size')) || 28;      // wordmark font-size
      const tone = this.getAttribute('tone') || 'ink';
      const t = tones(tone);
      const wordInk = this.getAttribute('ink') || t.ink;
      const dotBlue = this.getAttribute('blue') || t.blue;
      const mk = Math.round(size * 1.5);
      const gap = Math.round(size * 0.5);
      this.style.display = 'inline-flex';
      this.style.alignItems = 'center';
      this.style.gap = gap + 'px';
      this.style.whiteSpace = 'nowrap';
      this.innerHTML =
        markSVG(mk, tone, this.getAttribute('blue'), this.getAttribute('ink')) +
        `<span class="byld-logo" style="--logo-size:${size}px; --logo-ink:${wordInk}; --logo-blue:${dotBlue};">` +
          `<span class="word">byld</span><span class="dot"></span></span>`;
    }
  }

  if (!customElements.get('byld-mark')) customElements.define('byld-mark', ByldMark);
  if (!customElements.get('byld-lock')) customElements.define('byld-lock', ByldLock);
})();
