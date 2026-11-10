/* Página de cada plato: #/plato/XXXX */
(function () {
  'use strict';
  var H = window.NAMI, $ = function (s) { return document.querySelector(s); };
  var p = null;
  var cant = 1;

  function pintar() {
    var cont = $('#plato');
    if (!p) {
      cont.innerHTML = '<div class="no-encontrado"><h1 class="titulo-orator">Plato no encontrado</h1><p>Puede que ya no esté en la carta.</p><a class="boton-primario" href="#/menu">Ver el menú</a></div>';
      return;
    }
    var cat = H.categoriaDe(p.id), n = H.nombre(p), d = H.descripcion(p);
    document.title = p.name + ' | Nami Sushi Bar';
    var relacionados = cat.items.filter(function (x) { return x.id !== p.id && x.img; }).slice(0, 4);

    cont.innerHTML =
      '<div class="plato">' +
      '<nav class="plato-migas"><a href="#/inicio">Inicio</a> / <a href="#/menu">Menú</a> / <a href="#/menu/' + cat.id + '">' + H.esc(cat.title) + '</a></nav>' +
      '<div class="plato-foto">' + (p.badge ? '<span class="descuento">' + p.badge + '</span>' : '') +
      (p.img ? '<img src="' + p.img + '" alt="' + H.esc(n) + '">' : '<img src="img/logo.svg" alt="" style="padding:3rem;background:#fff">') + '</div>' +
      '<div class="plato-info">' +
      '<h1>' + H.esc(n) + '</h1>' +
      (d ? '<p class="plato-desc">' + H.esc(d) + '</p>' : '') +
      '<div class="plato-precio">' + p.price + (p.old && p.old !== p.price ? '<s>' + p.old + '</s>' : '') + '</div>' +
      '<div id="plOpciones" class="op-lista">' + (window.OPC ? window.OPC.html(p.id) : '') + '</div>' +
      '<textarea id="plNota" class="mp-nota-campo" rows="2" placeholder="' + (window.OPC ? window.OPC.notaTexto() : '') + '"></textarea>' +
      '<div class="plato-comprar" style="margin-top:1rem"><div class="cantidad"><button id="plMenos" aria-label="Quitar uno">−</button><span id="plCant">' + cant + '</span><button id="plMas" aria-label="Agregar uno">+</button></div>' +
      '<button class="boton-primario" id="plAgregar">Agregar <span id="plTotal">' + H.aPesos(H.aNumero(p.price) * cant) + '</span></button></div>' +
      '</div></div>' +
      (relacionados.length ? '<section class="plato-relacionados"><h2 class="titulo-orator">También te puede gustar</h2><div class="grilla">' +
        relacionados.map(function (r) {
          return '<a class="producto" href="#/plato/' + r.id + '"><div class="foto"><img src="' + r.img + '" alt="" loading="lazy"></div>' +
            '<div class="info"><div><h3>' + H.esc(H.nombre(r)) + '</h3><p>' + H.esc(H.descripcion(r)) + '</p></div><div class="precios"><span>' + r.price + '</span></div></div><span class="mas" aria-hidden="true">+</span></a>';
        }).join('') + '</div></section>' : '');

    $('#plMenos').onclick = function () { if (cant > 1) { cant--; total(); } };
    $('#plMas').onclick = function () { cant++; total(); };
    $('#plOpciones').addEventListener('change', total);
    $('#plAgregar').onclick = function () {
      var error = window.OPC ? window.OPC.validar($('#plOpciones'), p.id) : '';
      if (error) { H.avisar(error); return; }
      H.agregar(p.id, cant, $('#plNota').value, window.OPC ? window.OPC.leer($('#plOpciones'), p.id) : []);
      cant = 1; pintar();
    };
  }
  function total() {
    var extra = window.OPC ? window.OPC.extra(window.OPC.leer($('#plOpciones'), p.id)) : 0;
    $('#plCant').textContent = cant; $('#plTotal').textContent = H.aPesos((H.aNumero(p.price) + extra) * cant);
  }

  // La abre rutas.js con la dirección #/plato/ID
  window.NAMI_MOSTRAR_PLATO = function (id) { p = H.productos[id] || null; cant = 1; pintar(); };
  window.NAMI_PAGINA_REPINTAR = function () { if (window.VISTA === 'plato') pintar(); }; // al cambiar de idioma
})();
