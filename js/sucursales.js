/* Página de sedes (ficticias) */
(function () {
  'use strict';
  var H = window.NAMI, $ = function (s) { return document.querySelector(s); };
  var MAPA = 'https://www.google.com/maps/search/?api=1&query=';
  var SEDES = [
    { n: 'Usaquén', d: 'Carrera 6 #119-24', foto: 'sede-1', geo: 'Usaquén, Bogotá' },
    { n: 'Chapinero', d: 'Calle 65 #9-30', foto: 'sede-2', geo: 'Chapinero Alto, Bogotá' },
    { n: 'Parque 93', d: 'Calle 93B #12-18', foto: 'sede-3', geo: 'Parque de la 93, Bogotá' }
  ];
  $('#sucGrilla').innerHTML = SEDES.map(function (s) {
    return '<article class="suc">' +
      '<div class="suc-foto"><img src="img/sedes/' + s.foto + '.webp" alt="" loading="lazy"></div>' +
      '<div class="suc-cuerpo"><h4>' + H.esc(s.n) + '</h4>' +
      '<span>Lunes a domingo · 12:00 m. a 10:00 p. m.</span>' +
      '<a href="' + MAPA + encodeURIComponent(s.geo) + '" target="_blank" rel="noopener">' + H.esc(s.d) + '</a></div></article>';
  }).join('');
})();
