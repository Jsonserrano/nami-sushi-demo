/* Opciones de cada plato, igual que en la tienda de Nami:
   "¿Qué no quieres?", "¿Quieres salsa extra?", entradas, bebidas… con sus reglas (opcional / obligatorio,
   cuántas elegir) y sus precios. Los datos vienen de opciones.js (se actualizan solos cada día). */
(function () {
  'use strict';
  var esc = function (s) { return String(s || '').replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); };
  var pesos = function (n) { return '$' + n.toLocaleString('es-CO').replace(/,/g, '.'); };

  // Texto de la regla de cada grupo (como lo muestra Nami)
  var TX = {
    es: { opc: 'Opcional', obl: 'Obligatorio', entre: 'Selecciona entre {a} y {b}', almenos: 'Selecciona al menos {a}', exacto: 'Selecciona {a}', si: 'Si eliges opciones: ', sel: '{n} seleccionados', nota: 'Incluye una nota', falta: 'Elige una opción en "{g}"', max: 'En "{g}" puedes elegir máximo {b}' },
    en: { opc: 'Optional', obl: 'Required', entre: 'Choose between {a} and {b}', almenos: 'Choose at least {a}', exacto: 'Choose {a}', si: 'If you choose: ', sel: '{n} selected', nota: 'Add a note', falta: 'Choose an option in "{g}"', max: 'In "{g}" you can choose up to {b}' },
    ja: { opc: '任意', obl: '必須', entre: '{a}〜{b}個選択', almenos: '{a}個以上選択', exacto: '{a}個選択', si: '選ぶ場合：', sel: '{n}個選択中', nota: 'メモを追加', falta: '「{g}」から選んでください', max: '「{g}」は最大{b}個まで選べます' }
  };
  function t(k, v) {
    var s = (TX[window.IDIOMA] || TX.es)[k];
    Object.keys(v || {}).forEach(function (x) { s = s.replace('{' + x + '}', v[x]); });
    return s;
  }
  function regla(g) {
    var r = g.max === 0 ? t('almenos', { a: g.min }) : g.min === g.max ? t('exacto', { a: g.min }) : t('entre', { a: g.min, b: g.max });
    return (g.opcional ? t('si') : '') + r;
  }
  function grupos(id) { return (window.OPCIONES || {})[id] || []; }
  // Traduce el nombre de un grupo u opción al idioma elegido (los nombres de rolls se quedan igual)
  function tr(texto) {
    var lang = window.IDIOMA;
    if (!lang || lang === 'es') return texto;
    var dic = (window.OPCIONES_IDIOMAS || {})[lang] || {};
    var k = String(texto).toLowerCase().trim();
    if (dic[k]) return dic[k];
    var m = k.match(/^(\d+)\s*makis?\b\s*(.*)$/);
    if (m) return m[1] + (lang === 'ja' ? '貫' : ' makis') + (m[2] ? ' ' + m[2] : '');
    return texto;
  }

  function html(id) {
    return grupos(id).map(function (g, gi) {
      var unaSola = g.max === 1;
      return '<fieldset class="op-grupo" data-g="' + gi + '">' +
        '<legend><span class="op-titulo">' + esc(tr(g.n)) + '</span><span class="op-etiqueta' + (g.opcional ? '' : ' obligatorio') + '">' + (g.opcional ? t('opc') : t('obl')) + '</span></legend>' +
        '<p class="op-regla">' + esc(regla(g)) + ' · <span class="op-cuenta">' + t('sel', { n: 0 }) + '</span></p>' +
        g.ops.map(function (o, oi) {
          var precio = o.p ? '<span class="op-precio">+' + pesos(o.p) + '</span>' : '';
          if (o.max === 1 || unaSola) {
            return '<label class="op-fila"><input type="' + (unaSola ? 'radio' : 'checkbox') + '" name="g' + gi + '" data-o="' + oi + '"><span class="op-nombre">' + esc(tr(o.n)) + '</span>' + precio + '</label>';
          }
          return '<div class="op-fila op-contador"><span class="op-nombre">' + esc(tr(o.n)) + '</span>' + precio +
            '<span class="cantidad op-cant"><button type="button" data-op-menos aria-label="− ' + esc(tr(o.n)) + '">−</button><span data-o="' + oi + '">0</span><button type="button" data-op-mas aria-label="+ ' + esc(tr(o.n)) + '">+</button></span></div>';
        }).join('') + '</fieldset>';
    }).join('');
  }

  // Lo elegido: [{g: grupo, n: opción, q: cantidad, p: precio}]
  function leer(cont, id) {
    var gs = grupos(id), out = [];
    cont.querySelectorAll('.op-grupo').forEach(function (fs) {
      var g = gs[+fs.dataset.g];
      fs.querySelectorAll('[data-o]').forEach(function (el) {
        var q = el.tagName === 'INPUT' ? (el.checked ? 1 : 0) : +el.textContent;
        if (q > 0) { var o = g.ops[+el.dataset.o]; out.push({ g: g.n, n: o.n, q: q, p: o.p }); }
      });
    });
    return out;
  }
  function extra(ops) { return ops.reduce(function (s, o) { return s + o.p * o.q; }, 0); }

  // Revisa las reglas; devuelve el mensaje del primer error o '' si todo está bien
  function validar(cont, id) {
    var gs = grupos(id), msg = '';
    cont.querySelectorAll('.op-grupo').forEach(function (fs) {
      if (msg) return;
      var g = gs[+fs.dataset.g], n = 0;
      fs.querySelectorAll('[data-o]').forEach(function (el) { n += el.tagName === 'INPUT' ? (el.checked ? 1 : 0) : +el.textContent; });
      if ((n > 0 || !g.opcional) && n < g.min) msg = t('falta', { g: tr(g.n) });
      else if (g.max > 0 && n > g.max) msg = t('max', { g: tr(g.n), b: g.max });
      if (msg) { fs.classList.add('op-error'); fs.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(function () { fs.classList.remove('op-error'); }, 1400); }
    });
    return msg;
  }

  function contar(fs) {
    var n = 0;
    fs.querySelectorAll('[data-o]').forEach(function (el) { n += el.tagName === 'INPUT' ? (el.checked ? 1 : 0) : +el.textContent; });
    fs.querySelector('.op-cuenta').textContent = t('sel', { n: n });
    fs.classList.toggle('op-listo', n > 0);
    return n;
  }

  // Botones + / − y casillas (un solo escuchador para toda la página)
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-op-mas],[data-op-menos]'); if (!b) return;
    var span = b.parentElement.querySelector('[data-o]'), fs = b.closest('.op-grupo');
    var v = +span.textContent + (b.hasAttribute('data-op-mas') ? 1 : -1);
    span.textContent = Math.max(0, v);
    contar(fs);
    fs.dispatchEvent(new Event('change', { bubbles: true }));
  });
  document.addEventListener('change', function (e) {
    var fs = e.target.closest && e.target.closest('.op-grupo'); if (fs && e.target.tagName === 'INPUT') contar(fs);
  });

  window.OPC = { html: html, leer: leer, extra: extra, validar: validar, notaTexto: function () { return t('nota'); },
    resumen: function (ops) { return (ops || []).map(function (o) { return (o.q > 1 ? o.q + '× ' : '') + tr(o.n); }).join(', '); }, tr: tr };
})();
