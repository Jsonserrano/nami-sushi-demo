/*
 * desintegrar.js
 * Efecto de desintegración en partículas (estilo HyperOS) para cualquier elemento.
 * Requiere html2canvas cargado antes de este archivo.
 *
 * Uso:
 *   await desintegrar(elemento, { paso: 3, velocidad: 1, ocultar: true });
 *   await desintegrarPantalla(contenedor);   // lo que se ve en pantalla de una página completa (botón MENU)
 *
 * Código entregado por el cliente. Cambios:
 *  - se corrigió la línea del color, que tenía un error de escritura;
 *  - html2canvas copia solo el elemento (no toda la página), para que empiece al instante;
 *  - al abrir la página con doble clic (file://) se omiten las fotos al "fotografiar", porque el navegador
 *    no deja leerlas en ese modo y el efecto fallaba (en internet o con ABRIR PAGINA.bat salen completas);
 *  - nueva función desintegrarPantalla() para la transición al menú, con partículas más grandes
 *    cuando el área es grande, para que siga siendo fluido en cualquier pantalla.
 */
(function () {
  let canvas, ctx, dpr, parts = [], running = false, last = 0;
  const local = location.protocol === 'file:';

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; };
    addEventListener('resize', fit);
    fit();
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    // Recorre las partículas sin crear listas ni textos nuevos en cada cuadro (más fluido)
    let n = 0;
    for (let k = 0; k < parts.length; k++) {
      const p = parts[k];
      p.t += dt * p.v;
      const a = p.t - p.delay;
      if (a > p.life) continue;
      parts[n++] = p;
      if (ctx.fillStyle !== p.c) ctx.fillStyle = p.c;
      if (a < 0) { ctx.globalAlpha = 1; ctx.fillRect(p.x, p.y, p.s, p.s); continue; }
      const q = a / p.life, sz = p.s * (1 - q * 0.7);
      ctx.globalAlpha = (1 - q) * (1 - q);
      ctx.fillRect(
        p.x + p.vx * a + Math.sin(p.ph + a * 8) * 7 * q,
        p.y + p.vy * a - 35 * a * a,
        sz, sz
      );
    }
    parts.length = n;
    ctx.globalAlpha = 1;
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  // Convierte una "foto" (canvas) en partículas sobre el rectángulo indicado de la pantalla
  function lanzar(snap, rect, paso, velocidad, retrasoMax) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const d = snap.getContext('2d').getImageData(0, 0, snap.width, snap.height).data;
    // Máximo ~9.000 partículas: se ven igual y la animación va a 60 cuadros por segundo
    paso = Math.max(paso, Math.ceil(Math.sqrt(snap.width * snap.height / 9000)));
    const kx = rect.width / snap.width, ky = rect.height / snap.height;
    let maxT = 0;
    for (let y = 0; y < snap.height; y += paso) {
      for (let x = 0; x < snap.width; x += paso) {
        const i = ((y + (paso >> 1)) * snap.width + (x + (paso >> 1))) * 4;
        if (i >= d.length || d[i + 3] < 30) continue;
        const nx = x / snap.width, ny = y / snap.height;
        const ang = -Math.PI / 2.5 + (Math.random() - 0.5) * 1.5;
        const sp = 40 + Math.random() * 170;
        const p = {
          x: rect.left + x * kx, y: rect.top + y * ky, s: paso * kx,
          c: `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
          delay: reduce ? 0 : nx * retrasoMax + (1 - ny) * 0.12 + Math.random() * 0.15,
          life: 0.6 + Math.random() * 0.7, t: 0, ph: Math.random() * 6.28, v: velocidad
        };
        maxT = Math.max(maxT, p.delay + p.life);
        parts.push(p);
      }
    }
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
    return maxT;
  }

  // Qué se omite al "fotografiar": todo lo que no es el elemento, y las fotos si se abrió con doble clic
  const omitir = el => n => (document.body.contains(n) && n !== document.body && !n.contains(el) && !el.contains(n)) ||
    (local && (n.tagName === 'IMG' || n.tagName === 'VIDEO'));

  // Foto de un elemento preparada de antemano (ej.: la ventana del plato mientras el cliente la mira)
  const fotosEl = new WeakMap();
  function claveEl(el) { const r = el.getBoundingClientRect(); return [el.dataset.version || 0, el.scrollTop, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join('|'); }
  function prepararElemento(el, escala = 1) {
    if (!el || typeof html2canvas !== 'function') return;
    const k = claveEl(el), previa = fotosEl.get(el);
    if (previa && previa.clave === k) return;
    const f = { clave: k, escala: escala, promesa: html2canvas(el, { scale: escala, backgroundColor: null, logging: false, ignoreElements: omitir(el) }) };
    f.promesa.catch(() => fotosEl.delete(el));
    fotosEl.set(el, f);
  }

  async function desintegrar(el, { paso = 3, velocidad = 1, ocultar = true, escala = 1 } = {}) {
    if (!el) return;
    init();
    const rect = el.getBoundingClientRect();
    const previa = fotosEl.get(el);
    fotosEl.delete(el);
    const usar = previa && previa.clave === claveEl(el) ? previa : null;
    const esc = usar ? usar.escala : escala;
    const snap = await (usar ? usar.promesa : html2canvas(el, { scale: esc, backgroundColor: null, logging: false, ignoreElements: omitir(el) }));
    const maxT = lanzar(snap, rect, Math.max(2, Math.round(paso * esc)), velocidad, 0.7);
    if (ocultar) el.style.visibility = 'hidden';
    // Resuelve un poco antes de que acabe la animación, para que lo siguiente aparezca mientras vuelan las últimas partículas
    return new Promise(r => setTimeout(r, Math.min(maxT, 0.9) * 1000 / velocidad));
  }

  // ---- Página completa (botón MENU): solo lo que se ve en pantalla, a media resolución ----
  let foto = null; // foto preparada de antemano (cuando el dedo o el mouse se acercan al botón)
  function clave(el) { return [el.dataset.vista, Math.round(scrollY), innerWidth, innerHeight].join('|'); }
  function fotografiar(el) {
    const r = el.getBoundingClientRect();
    const top = Math.max(0, r.top), bottom = Math.min(innerHeight, r.bottom);
    const area = { left: 0, top: top, width: innerWidth, height: Math.max(1, bottom - top) };
    const escala = 0.5;
    const promesa = html2canvas(el, {
      scale: escala, backgroundColor: '#141010', logging: false, ignoreElements: omitir(el),
      x: -r.left, y: top - r.top, width: area.width, height: area.height,
      windowWidth: document.documentElement.clientWidth, windowHeight: innerHeight
    });
    return { clave: clave(el), hora: performance.now(), area: area, escala: escala, promesa: promesa };
  }
  function prepararPantalla(el) {
    if (!el || (foto && foto.clave === clave(el) && performance.now() - foto.hora < 8000)) return;
    foto = fotografiar(el);
    foto.promesa.catch(() => { foto = null; });
  }
  // Devuelve la foto de la pantalla (la preparada de antemano si sigue sirviendo)
  async function fotoPantalla(el) {
    const f = (foto && foto.clave === clave(el) && performance.now() - foto.hora < 8000) ? foto : fotografiar(el);
    foto = null;
    f.snap = await f.promesa;
    return f;
  }
  // Lanza las partículas de esa foto (cubren toda la pantalla al principio y se deshacen)
  function lanzarPantalla(f, { velocidad = 1.25 } = {}) {
    init();
    const paso = Math.max(3, Math.ceil(Math.sqrt(f.area.width * f.area.height / 42000)));
    // El primer cuadro se dibuja antes de que el navegador pinte: la foto tapa la pantalla y debajo ya está el menú
    lanzar(f.snap, f.area, Math.max(2, Math.round(paso * f.escala)), velocidad, 0.45);
  }
  async function desintegrarPantalla(el, opciones) {
    if (!el) return;
    lanzarPantalla(await fotoPantalla(el), opciones);
  }
  window.fotoPantalla = fotoPantalla;
  window.lanzarPantalla = lanzarPantalla;

  window.desintegrar = desintegrar;
  window.desintegrarPantalla = desintegrarPantalla;
  window.prepararPantalla = prepararPantalla;
  window.prepararElemento = prepararElemento;
})();
