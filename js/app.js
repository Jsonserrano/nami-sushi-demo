/* Nami Sushi Bar — carrito, carta, ventana de pedido y búsqueda (funciona en todas las páginas) */
(function () {
  'use strict';

  // ===== Configuración =====
  var WHATSAPP = window.WHATSAPP_NAMI || '';

  var MENU = window.MENU || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var enCarta = !!$('#carta');

  // Índice de productos por id (un mismo plato puede aparecer en varias categorías)
  var PRODUCTOS = {}, CATEGORIA = {};
  MENU.forEach(function (c) { c.items.forEach(function (p) { if (!PRODUCTOS[p.id]) { PRODUCTOS[p.id] = p; CATEGORIA[p.id] = c; } }); });

  var aNumero = function (txt) { return parseInt(String(txt || '0').replace(/[^\d]/g, ''), 10) || 0; };
  var aPesos = function (n) { return '$' + n.toLocaleString('es-CO').replace(/,/g, '.'); };
  var esc = function (s) { return String(s || '').replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); };
  // Idioma (inglés: menu-en.js · japonés: menu-ja.js)
  var sufijo = function () { return String(window.IDIOMA || 'es').toUpperCase(); };
  var nombre = function (p) { return (window['NAME_' + sufijo()] || {})[p.id] || p.name; };
  var descripcion = function (p) { return (window['DESC_' + sufijo()] || {})[p.id] || p.desc; };
  var AGREGASTE = { ES: 'Agregaste ', EN: 'Added ', JA: '追加しました：' };
  var normal = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };

  // ===== Almacenamiento seguro =====
  function leer(clave, def) { try { var v = localStorage.getItem(clave); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function guardar(clave, v) { try { localStorage.setItem(clave, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }

  var carrito = leer('nami_carrito', []);
  var entrega = leer('nami_entrega', { modo: 'Domicilio', direccion: '', ciudad: '' });
  var autorizado = leer('nami_autorizo', false);

  // ===== Carta (solo en pedir.html) =====
  function tarjeta(p) {
    var foto = p.img ? '<div class="foto"><img src="' + p.img + '" alt="' + esc(nombre(p)) + '" loading="lazy"></div>' : '';
    var d = descripcion(p);
    return '<div class="producto" role="button" tabindex="0" data-id="' + p.id + '">' +
      (p.badge ? '<span class="descuento">' + p.badge + '</span>' : '') + foto +
      '<div class="info"><div><h3>' + esc(nombre(p)) + '</h3>' + (d ? '<p>' + esc(d) + '</p>' : '') + '</div>' +
      '<div class="precios"><span>' + p.price + '</span>' + (p.old && p.old !== p.price ? '<span class="antes">' + p.old + '</span>' : '') + '</div></div>' +
      '<span class="mas" aria-hidden="true">+</span></div>';
  }
  function pintarCarta(filtro) {
    if (!enCarta) return;
    var q = normal(filtro), html = '';
    MENU.forEach(function (c) {
      var items = q ? c.items.filter(function (p) { return normal(p.name + ' ' + p.desc + ' ' + nombre(p) + ' ' + descripcion(p)).indexOf(q) > -1; }) : c.items;
      if (!items.length) return;
      html += '<section class="categoria" id="cat-' + c.id + '"><h2>' + esc(c.title) + '</h2>' +
        (c.desc && !q ? '<p class="descripcion">' + esc(c.desc) + '</p>' : '') +
        '<div class="grilla">' + items.map(tarjeta).join('') + '</div></section>';
    });
    $('#carta').innerHTML = html || '<div class="sin-resultados">No encontramos platos para “' + esc(filtro) + '”.</div>';
  }
  function pintarCategorias() {
    $('#listaCategorias').innerHTML = MENU.map(function (c) {
      return '<a href="#/menu/' + c.id + '">' + esc(c.title) + '</a>';
    }).join('');
  }

  // ===== Ventanas =====
  function abrir(sel) { $(sel).hidden = false; document.body.style.overflow = 'hidden'; }
  function cerrar(el) { el.hidden = true; if (!$$('.capa').some(function (c) { return !c.hidden; })) document.body.style.overflow = ''; }
  // Ventanas que se desintegran en partículas al cerrarlas con la X: la del plato y la del carrito
  var CON_PARTICULAS = { modalProducto: true, modalCarrito: true };
  function activarCapa(capa) {
    capa.addEventListener('click', function (e) {
      if (CON_PARTICULAS[capa.id] && e.target.closest('[data-cerrar]')) { cerrarConParticulas(capa); return; }
      if (e.target === capa || e.target.closest('[data-cerrar]')) cerrar(capa);
    });
  }
  var cerrando = {};
  function cerrarConParticulas(capa, alTerminar) {
    if (cerrando[capa.id]) return;
    var ventana = capa.querySelector('.modal');
    if (typeof window.desintegrar !== 'function' || typeof window.html2canvas !== 'function') { cerrar(capa); if (alTerminar) alTerminar(); return; }
    cerrando[capa.id] = true;
    capa.classList.add('desvaneciendo');
    var fin = function () {
      cerrar(capa);
      capa.classList.remove('desvaneciendo');
      ventana.style.visibility = '';
      cerrando[capa.id] = false;
      if (alTerminar) alTerminar();
    };
    window.desintegrar(ventana, { paso: 3, velocidad: 1.2, escala: 0.6 }).then(fin, fin);
  }
  var cerrarPlatoConParticulas = cerrarConParticulas;
  // Mientras el cliente mira la ventana, se prepara su "foto"; si cambia algo (opciones, cantidad, desplazamiento)
  // se vuelve a preparar. Así, al tocar la X, las partículas salen al instante.
  var prepT = {};
  function prepararVentana(capa, espera) {
    clearTimeout(prepT[capa.id]);
    prepT[capa.id] = setTimeout(function () {
      if (capa.hidden || cerrando[capa.id] || !window.prepararElemento) return;
      var hacer = function () { window.prepararElemento(capa.querySelector('.modal'), 0.6); };
      if ('requestIdleCallback' in window) requestIdleCallback(hacer, { timeout: 250 }); else hacer();
    }, espera);
  }
  function vigilarVentana(capa) {
    var ventana = capa.querySelector('.modal');
    var cambio = function (e) {
      if (e && e.target && e.target.closest && e.target.closest('[data-cerrar],[data-pedir]')) return; // tocar la X o "Ir a pagar" no es un cambio
      ventana.dataset.version = (+ventana.dataset.version || 0) + 1; prepararVentana(capa, 250);
    };
    ventana.addEventListener('click', cambio);
    ventana.addEventListener('input', cambio);
    ventana.addEventListener('scroll', function () { prepararVentana(capa, 350); }, { passive: true });
    return cambio;
  }
  window.NAMI_PLATO_CAMBIO = vigilarVentana($('#modalProducto'));
  $('#mpImagen').addEventListener('load', function () { window.NAMI_PLATO_CAMBIO(); });
  $$('.capa').forEach(activarCapa);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') $$('.capa').forEach(function (c) { if (!c.hidden) cerrar(c); });
  });

  // ===== Agregar al carrito (lo usan la carta y la página del plato) =====
  // Precio de una línea del carrito: plato + opciones elegidas (salsas, entradas, bebidas…)
  function precioUnidad(l) { var p = PRODUCTOS[l.id]; return p ? aNumero(p.price) + (l.ops || []).reduce(function (s, o) { return s + o.p * o.q; }, 0) : 0; }
  function agregar(id, cuantos, nota, ops) {
    var p = PRODUCTOS[id]; if (!p) return;
    nota = (nota || '').trim(); ops = ops || [];
    var firma = JSON.stringify(ops);
    var existente = carrito.filter(function (l) { return l.id === id && l.nota === nota && JSON.stringify(l.ops || []) === firma; })[0];
    if (existente) existente.cant += cuantos; else carrito.push({ id: id, cant: cuantos, nota: nota, ops: ops });
    guardar('nami_carrito', carrito);
    pintarCarrito();
    avisar((AGREGASTE[sufijo()] || AGREGASTE.ES) + cuantos + ' × ' + nombre(p));
  }

  // ===== Ventana del plato =====
  var actual = null, cant = 1;
  function abrirProducto(id) {
    actual = PRODUCTOS[id]; if (!actual) return;
    cant = 1;
    $('#mpImagen').parentElement.hidden = !actual.img;
    if (actual.img) { $('#mpImagen').src = actual.img; $('#mpImagen').alt = nombre(actual); }
    $('#mpNombre').textContent = nombre(actual);
    $('#mpDesc').textContent = descripcion(actual);
    $('#mpPrecio').textContent = actual.price;
    $('#mpAntes').textContent = actual.old && actual.old !== actual.price ? actual.old : '';
    $('#mpNota').value = '';
    $('#mpNota').placeholder = window.OPC ? window.OPC.notaTexto() : '';
    $('#mpOpciones').innerHTML = window.OPC ? window.OPC.html(actual.id) : '';
    $('#modalProducto .modal').scrollTop = 0;
    totalProducto();
    abrir('#modalProducto');
    if (window.NAMI_PLATO_CAMBIO) window.NAMI_PLATO_CAMBIO();
  }
  function totalProducto() {
    $('#mpCantidad').textContent = cant;
    var extra = window.OPC ? window.OPC.extra(window.OPC.leer($('#mpOpciones'), actual.id)) : 0;
    $('#mpTotal').textContent = aPesos((aNumero(actual.price) + extra) * cant);
  }
  $('#mpOpciones').addEventListener('change', function () { if (actual) totalProducto(); });
  $('#mpMenos').addEventListener('click', function () { if (cant > 1) { cant--; totalProducto(); } });
  $('#mpMas').addEventListener('click', function () { cant++; totalProducto(); });
  $('#mpAgregar').addEventListener('click', function () {
    var error = window.OPC ? window.OPC.validar($('#mpOpciones'), actual.id) : '';
    if (error) { avisar(error); return; }
    var ops = window.OPC ? window.OPC.leer($('#mpOpciones'), actual.id) : [];
    cerrar($('#modalProducto'));
    agregar(actual.id, cant, $('#mpNota').value, ops);
  });
  if (enCarta) {
    $('#carta').addEventListener('click', function (e) {
      var card = e.target.closest('.producto'); if (card) abrirProducto(card.dataset.id);
    });
    $('#carta').addEventListener('keydown', function (e) {
      var card = e.target.closest('.producto');
      if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrirProducto(card.dataset.id); }
    });
  }

  // ===== Carrito =====
  function totalCarrito() {
    return carrito.reduce(function (s, l) { return s + precioUnidad(l) * l.cant; }, 0);
  }
  function unidades() { return carrito.reduce(function (s, l) { return s + l.cant; }, 0); }

  function htmlCarrito() {
    if (!carrito.length) {
      return '<div class="carrito-vacio"><strong>Tu carrito esta vacío</strong><span>Los productos que agregues aparecerán aquí</span></div>';
    }
    var lista = carrito.map(function (l, i) {
      var p = PRODUCTOS[l.id]; if (!p) return '';
      return '<li class="item-carrito mini">' +
        (p.img ? '<img src="' + p.img + '" alt="">' : '<span class="sin-foto"></span>') +
        '<div><div class="nombre">' + esc(nombre(p)) + '</div>' + (l.ops && l.ops.length ? '<div class="nota">' + esc(window.OPC ? window.OPC.resumen(l.ops) : '') + '</div>' : '') + (l.nota ? '<div class="nota">' + esc(l.nota) + '</div>' : '') +
        '<div class="cantidad"><button data-menos="' + i + '" aria-label="Quitar uno">−</button><span>' + l.cant + '</span><button data-mas="' + i + '" aria-label="Agregar uno">+</button></div></div>' +
        '<div class="valor">' + aPesos(precioUnidad(l) * l.cant) + '</div></li>';
    }).join('');
    return '<ul class="lista-carrito">' + lista + '</ul>' +
      '<div class="resumen"><div><span>Subtotal</span><span>' + aPesos(totalCarrito()) + '</span></div>' +
      '<div class="total"><span>Total</span><span>' + aPesos(totalCarrito()) + '</span></div></div>' +
      '<label class="autorizo"><input type="checkbox" data-autorizo' + (autorizado ? ' checked' : '') + '>' +
      '<span>Autorizo el tratamiento de mis datos personales según la <a href="#/politica-de-datos">política de datos</a> de Nami (Ley 1581 de 2012).</span></label>' +
      '<button class="boton-primario ancho" data-pedir' + (autorizado ? '' : ' disabled') + '>Ir a pagar</button>' +
      '<p class="nota-pago">Página de demostración: el pago en línea no está conectado.</p>' +
      '<p class="nota-pago nota-moneda">Los precios en dólares o yenes son de referencia: el cobro se hace en pesos colombianos (COP).</p>';
  }

  function pintarCarrito() {
    var html = htmlCarrito();
    if ($('#contenidoCarrito')) $('#contenidoCarrito').innerHTML = html;
    $('#contenidoCarritoMovil').innerHTML = html;
    var n = unidades();
    $('#contadorCarrito').textContent = n; $('#contadorCarrito').hidden = !n;
    $('#barraCantidad').textContent = n; $('#barraTotal').textContent = aPesos(totalCarrito());
    $('#barraCarrito').hidden = !n || (window.VISTA === 'menu' && window.innerWidth > 860);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.dataset.menos !== undefined) {
      var i = +t.dataset.menos; carrito[i].cant--; if (carrito[i].cant <= 0) carrito.splice(i, 1);
      guardar('nami_carrito', carrito); pintarCarrito();
    } else if (t.dataset.mas !== undefined) {
      carrito[+t.dataset.mas].cant++; guardar('nami_carrito', carrito); pintarCarrito();
    } else if (t.closest('[data-pedir]')) {
      irAPagar();
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target.hasAttribute('data-autorizo')) {
      autorizado = e.target.checked;
      guardar('nami_autorizo', autorizado);
      pintarCarrito();
    }
  });

  // Ventana del carrito: se abre encima de la página, sin desplazarla
  var capaCarrito = document.createElement('div');
  capaCarrito.className = 'capa'; capaCarrito.id = 'modalCarrito'; capaCarrito.hidden = true;
  capaCarrito.innerHTML = '<div class="modal modal-chico" role="dialog" aria-modal="true"><button class="cerrar" data-cerrar aria-label="Cerrar">×</button>' +
    '<h2 class="titulo-orator">Tu Carrito</h2><div id="contenidoCarritoMovil"></div></div>';
  document.body.appendChild(capaCarrito);
  activarCapa(capaCarrito);
  var carritoCambio = vigilarVentana(capaCarrito);

  function verCarrito() { pintarCarrito(); abrir('#modalCarrito'); carritoCambio(); }
  $('#btnCarrito').addEventListener('click', verCarrito);
  $('#barraCarrito').addEventListener('click', verCarrito);
  window.addEventListener('resize', pintarCarrito);

  // El pago se hace igual que hoy: en la tienda oficial de Nami (plataforma Justo)
  function irAPagar() {
    if (!autorizado) { avisar('Debes autorizar el tratamiento de datos para continuar'); return; }
    avisar('Esta es una página de demostración: aquí el cliente pagaría en línea.');
    // Si se pidió desde la ventana del carrito, la ventana se desintegra en partículas
    var capa = $('#modalCarrito');
    if (capa && !capa.hidden) cerrarConParticulas(capa);
  }

  // ===== "¿Cómo quieres tu pedido?" =====
  function pintarDireccion() {
    var txt = '¿Dónde quieres pedir?';
    var RETIRAR = { es: ', para retirar', en: ' (pick up)', ja: '（店舗受け取り）' };
    if (entrega.modo === 'Recoger en tienda' && entrega.direccion) txt = entrega.direccion + (RETIRAR[window.IDIOMA] || RETIRAR.es);
    else if (entrega.direccion) txt = entrega.direccion + (entrega.ciudad ? ', ' + entrega.ciudad : '');
    $$('.texto-direccion').forEach(function (s) { s.textContent = txt; });
  }
  function modoEntrega(modo) {
    var retiro = modo === 'Recoger en tienda';
    $$('.pestana').forEach(function (p) { p.classList.toggle('activa', p.dataset.modo === modo); });
    $('#panelDomicilio').hidden = retiro;
    $('#panelRetiro').hidden = !retiro;
  }
  function pintarSedes(filtro) {
    var q = normal(filtro);
    var sedes = (window.SEDES_RETIRO || []).filter(function (s) { return !q || normal(s.nombre + ' ' + s.direccion).indexOf(q) > -1; });
    $('#listaSedes').innerHTML = sedes.map(function (s) {
      var elegido = entrega.modo === 'Recoger en tienda' && entrega.direccion === s.nombre;
      return '<button type="button" class="sede' + (elegido ? ' elegida' : '') + '" data-sede="' + esc(s.nombre) + '"><strong>' + esc(s.nombre) + '</strong><span>' + esc(s.direccion) + '</span></button>';
    }).join('') || '<p class="sin-sedes">No encontramos locales con ese nombre.</p>';
  }
  function abrirDireccion() {
    modoEntrega(entrega.modo || 'Domicilio');
    $('#mdDireccion').value = entrega.modo === 'Domicilio' ? entrega.direccion : '';
    $('#mdCiudad').value = entrega.ciudad || '';
    $('#mdBuscarSede').value = '';
    pintarSedes('');
    abrir('#modalDireccion');
  }
  $$('[data-abrir-direccion]').forEach(function (b) { b.addEventListener('click', abrirDireccion); });
  $$('.pestana').forEach(function (p) { p.addEventListener('click', function () { modoEntrega(p.dataset.modo); }); });
  $('#mdBuscarSede').addEventListener('input', function (e) { pintarSedes(e.target.value); });
  $('#listaSedes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-sede]'); if (!b) return;
    entrega = { modo: 'Recoger en tienda', direccion: b.dataset.sede, ciudad: '' };
    guardar('nami_entrega', entrega); pintarDireccion(); cerrar($('#modalDireccion'));
  });
  $('#mdGuardar').addEventListener('click', function () {
    var dir = $('#mdDireccion').value.trim(), ciudad = $('#mdCiudad').value;
    if (!ciudad) { avisar('Selecciona una ciudad'); $('#mdCiudad').focus(); return; }
    if (!dir) { avisar('Escribe tu dirección'); $('#mdDireccion').focus(); return; }
    entrega = { modo: 'Domicilio', direccion: dir, ciudad: ciudad };
    guardar('nami_entrega', entrega); pintarDireccion(); cerrar($('#modalDireccion'));
  });
  $('#mdUbicacion').addEventListener('click', function () {
    var b = this;
    if (!navigator.geolocation) { avisar('Tu navegador no permite compartir la ubicación'); return; }
    b.disabled = true; b.textContent = 'Cargando...';
    navigator.geolocation.getCurrentPosition(function () {
      b.disabled = false; b.textContent = 'Compartir ubicación';
      entrega = { modo: 'Domicilio', direccion: 'Mi ubicación actual', ciudad: entrega.ciudad || '' };
      guardar('nami_entrega', entrega); pintarDireccion(); cerrar($('#modalDireccion'));
    }, function () {
      b.disabled = false; b.textContent = 'Compartir ubicación';
      avisar('No pudimos obtener tu ubicación. Escribe tu dirección.');
    }, { timeout: 10000 });
  });

  // ===== Categorías (desplegable) =====
  var btnCat = $('#btnCategorias'), lista = $('#listaCategorias');
  btnCat.addEventListener('click', function (e) {
    e.stopPropagation(); lista.hidden = !lista.hidden; btnCat.setAttribute('aria-expanded', String(!lista.hidden));
  });
  lista.addEventListener('click', function () { lista.hidden = true; });
  document.addEventListener('click', function () { lista.hidden = true; btnCat.setAttribute('aria-expanded', 'false'); });

  // ===== Buscador (desde cualquier página lleva al menú y abre la búsqueda) =====
  $('#btnBuscar').addEventListener('click', function () {
    var b = $('#buscador');
    if (window.VISTA !== 'menu') { location.hash = '#/menu'; b.hidden = false; $('#campoBuscar').focus(); return; }
    b.hidden = !b.hidden;
    if (!b.hidden) $('#campoBuscar').focus(); else { $('#campoBuscar').value = ''; pintarCarta(''); }
  });
  var espera;
  $('#campoBuscar').addEventListener('input', function (e) {
    clearTimeout(espera); var v = e.target.value;
    espera = setTimeout(function () { pintarCarta(v.trim()); window.scrollTo({ top: 0 }); }, 150);
  });

  // ===== Varios =====
  var avisoT;
  function avisar(msg) {
    var a = $('#aviso'); a.textContent = msg; a.hidden = false;
    clearTimeout(avisoT); avisoT = setTimeout(function () { a.hidden = true; }, 2600);
  }
  var wa = $('#whatsapp');
  if (WHATSAPP) wa.href = 'https://wa.me/' + WHATSAPP;
  $('#anio').textContent = new Date().getFullYear();

  // Para las demás partes de la página (plato, inicio, idiomas)
  window.NAMI = {
    productos: PRODUCTOS, categoriaDe: function (id) { return CATEGORIA[id]; },
    nombre: nombre, descripcion: descripcion, aPesos: aPesos, aNumero: aNumero, esc: esc,
    agregar: agregar, abrirProducto: abrirProducto, avisar: avisar, abrir: abrir, cerrar: cerrar, activarCapa: activarCapa
  };
  window.NAMI_REPINTAR = function () {
    var b = $('#campoBuscar');
    pintarCarta(b && !$('#buscador').hidden ? b.value.trim() : '');
    pintarCarrito();
    pintarDireccion();
    if (window.NAMI_PAGINA_REPINTAR) window.NAMI_PAGINA_REPINTAR();
  };

  // Al cambiar de página (rutas.js): el buscador solo se queda abierto en el menú
  window.NAMI_REFRESCAR = function () {
    if (window.VISTA !== 'menu' && !$('#buscador').hidden) { $('#buscador').hidden = true; $('#campoBuscar').value = ''; pintarCarta(''); }
    pintarCarrito();
  };

  pintarCategorias();
  pintarCarta('');
  pintarCarrito();
  pintarDireccion();
})();
