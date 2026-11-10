/* Una sola web, varias páginas: cambia de página según la dirección (#/inicio, #/menu, #/plato/ID, #/sucursales…)
   sin abrir otros archivos. Los botones Atrás/Adelante del navegador funcionan. */
(function () {
  'use strict';
  var TITULOS = {
    inicio: 'Sushi a Domicilio en Bogotá | Nami Sushi Bar',
    menu: 'Pide - Sushi a Domicilio en Bogotá | Nami Sushi Bar',
    plato: 'Nami Sushi Bar',
    sucursales: 'Sucursales | Nami Sushi Bar',
    franquicias: 'Franquicias | Nami Sushi Bar',
    salud: 'Salud | Nami Sushi Bar',
    nosotros: 'Nosotros | Nami Sushi Bar',
    contacto: 'Contacto | Nami Sushi Bar',
    'politica-de-datos': 'Política de datos | Nami Sushi Bar',
    cancelaciones: 'Política de Cancelación y Devoluciones | Nami Sushi Bar',
    'documentos-legales': 'Documentos legales | Nami Sushi Bar',
    puntos: 'Nami Puntos | Nami Sushi Bar'
  };
  var vistas = Array.prototype.slice.call(document.querySelectorAll('.vista'));

  function ir() {
    var partes = (location.hash.replace(/^#\/?/, '') || 'inicio').split('/');
    var nombre = TITULOS[partes[0]] ? partes[0] : 'inicio';
    var extra = partes[1] || '';
    window.VISTA = nombre;
    document.body.setAttribute('data-pagina', nombre);
    vistas.forEach(function (v) { v.hidden = v.getAttribute('data-vista') !== nombre; });
    document.querySelectorAll('.menu-principal a').forEach(function (a) {
      var destino = (a.getAttribute('href') || '').replace(/^#\/?/, '').split('/')[0];
      a.classList.toggle('activo', destino === nombre && !(nombre === 'menu' && /T4BJ/.test(a.getAttribute('href'))));
    });
    document.title = TITULOS[nombre];
    // Términos / Privacidad: pestaña activa
    document.querySelectorAll('.leg-pestanas a').forEach(function (a) {
      a.classList.toggle('activo', a.getAttribute('data-doc') === (extra || 'terminos'));
    });
    // cierra ventanas abiertas al cambiar de página
    document.querySelectorAll('.capa').forEach(function (c) { if (!c.hidden && c.id !== 'modalCuenta') c.hidden = true; });
    document.body.style.overflow = '';
    if (nombre === 'plato' && window.NAMI_MOSTRAR_PLATO) window.NAMI_MOSTRAR_PLATO(extra);
    if (window.NAMI_REFRESCAR) window.NAMI_REFRESCAR();
    // en el menú, ir a la categoría pedida; en las demás, arriba
    var destinoCat = nombre === 'menu' && extra ? document.getElementById('cat-' + extra) : null;
    if (destinoCat) setTimeout(function () { destinoCat.scrollIntoView({ behavior: 'instant', block: 'start' }); }, 0);
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.addEventListener('hashchange', ir);
  window.NAMI_IR = ir;
  ir();

  // Arma el menú (284 platos) en segundo plano cuando la página está tranquila, para que abrirlo sea instantáneo
  function precalentarMenu() {
    var menu = document.querySelector('.vista[data-vista="menu"]');
    if (!menu || !menu.hidden) return;
    menu.classList.add('precalentando');
    void menu.offsetHeight;                       // fuerza a dibujarlo una vez (invisible)
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.remove('precalentando'); }); });
  }
  window.NAMI_PRECALENTAR_MENU = precalentarMenu;
  var alCargar = function () {
    if ('requestIdleCallback' in window) requestIdleCallback(precalentarMenu, { timeout: 2000 }); else setTimeout(precalentarMenu, 800);
  };
  if (document.readyState === 'complete') alCargar(); else window.addEventListener('load', alCargar);

  // ----- Botón MENU: la página actual se desintegra en partículas y aparece el menú -----
  var enTransicion = false;
  // Prepara la "foto" de la pantalla apenas el dedo, el lápiz o el mouse se acercan al botón (así arranca al instante)
  var preparar = function (e) {
    var a = e.target.closest && e.target.closest('.menu-principal a[href="#/menu"]');
    if (a && window.VISTA !== 'menu' && window.prepararPantalla) window.prepararPantalla(document.querySelector('.vista:not([hidden])'));
  };
  // …y también cuando la persona deja de moverse por la página (en el celular el dedo toca y suelta muy rápido)
  var quieto;
  var prepararEnReposo = function () {
    clearTimeout(quieto);
    quieto = setTimeout(function () {
      if (window.VISTA === 'menu' || !window.prepararPantalla) return;
      var hacer = function () { window.prepararPantalla(document.querySelector('.vista:not([hidden])')); };
      if ('requestIdleCallback' in window) requestIdleCallback(hacer, { timeout: 1500 }); else hacer();
    }, 700);
  };
  window.addEventListener('hashchange', prepararEnReposo);
  window.addEventListener('load', prepararEnReposo);
  document.addEventListener('pointerover', preparar, { passive: true });
  document.addEventListener('pointerdown', preparar, { passive: true });
  document.addEventListener('focusin', preparar);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.menu-principal a[href="#/menu"]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || window.VISTA === 'menu' || enTransicion) return;
    if (typeof window.desintegrarPantalla !== 'function' || typeof window.html2canvas !== 'function') return; // sin el efecto: cambia normal
    e.preventDefault();
    enTransicion = true;
    var actual = document.querySelector('.vista:not([hidden])');
    a.classList.add('pulsado');
    var normal = function () { a.classList.remove('pulsado'); enTransicion = false; location.hash = '#/menu'; };
    if (typeof window.fotoPantalla !== 'function') { window.desintegrarPantalla(actual).then(normal, normal); return; }
    window.fotoPantalla(actual).then(function (f) {
      // 1) Se arma y se muestra el menú (todavía tapado: el navegador aún no pinta)…
      history.pushState(null, '', '#/menu');
      ir();
      void document.querySelector('.vista[data-vista="menu"]').offsetHeight;
      // 2) …y encima, la foto de la página anterior se deshace en partículas y deja ver el menú
      window.lanzarPantalla(f);
      a.classList.remove('pulsado');
      setTimeout(function () { enTransicion = false; }, 600);
    }, normal);
  });
})();
