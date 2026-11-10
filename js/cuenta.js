/* Tarjeta de cuenta de 2 caras (giro de 180°): adelante "Iniciar sesión", atrás "Crear cuenta".
   Al terminar se minimiza en un botón pequeño para volver a abrirla.
   Es un diseño de muestra: no guarda contraseñas. La cuenta real se usa en la tienda de Nami. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var todas = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  function leer(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  var avisar = function (m) { if (window.NAMI) window.NAMI.avisar(m); };

  var FB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5H14l.6-3.5h-3.1V7.6c0-.6.5-1.1 1.1-1.1H15z"/></svg>';
  var G = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"/></svg>';
  var OJO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';

  var html =
    '<div class="capa capa-cuenta" id="modalCuenta" hidden>' +
    '<div class="tarjeta-cuenta" id="tarjetaCuenta" role="dialog" aria-modal="true" aria-label="Mi cuenta Nami">' +
    '<div class="tc-giro" id="tcGiro">' +

    // Cara 1: iniciar sesión
    '<section class="tc-cara tc-frente" aria-label="Iniciar sesión">' +
    '<button class="cerrar" type="button" data-tc-cerrar aria-label="Minimizar">×</button>' +
    '<img class="tc-logo" src="img/logo.svg" alt="Nami">' +
    '<h2 class="titulo-orator">Iniciar sesión</h2>' +
    '<p class="tc-sub">Pide más rápido y acumula Nami Puntos.</p>' +
    '<p class="tc-hola" id="tcHola" hidden></p>' +
    '<div class="tc-redes"><button type="button" class="tc-red fb" data-tc-red="Facebook">' + FB + 'Continuar con Facebook</button>' +
    '<button type="button" class="tc-red gg" data-tc-red="Google">' + G + 'Continuar con Google</button></div>' +
    '<div class="md-separador"><span>o con tu correo</span></div>' +
    '<form id="tcLogin" novalidate>' +
    '<label>Correo electrónico<input type="email" name="correo" autocomplete="email" required placeholder="tucorreo@ejemplo.com"></label>' +
    '<label>Contraseña<span class="tc-clave"><input type="password" name="clave" autocomplete="current-password" required minlength="6" placeholder="••••••••"><button type="button" class="tc-ver" aria-label="Mostrar contraseña">' + OJO + '</button></span></label>' +
    '<button type="button" class="tc-olvido" data-tc-olvido>¿Olvidaste tu contraseña?</button>' +
    '<button class="boton-primario ancho" type="submit">Ingresar</button>' +
    '</form>' +
    '<p class="tc-cambiar">¿No tienes cuenta? <button type="button" data-tc-girar>Regístrate</button></p>' +
    '</section>' +

    // Cara 2: crear cuenta
    '<section class="tc-cara tc-atras" aria-label="Crear cuenta">' +
    '<button class="cerrar" type="button" data-tc-cerrar aria-label="Minimizar">×</button>' +
    '<h2 class="titulo-orator">Crear cuenta</h2>' +
    '<p class="tc-sub">Regístrate, gana puntos con tus compras y canjéalos por productos y más.</p>' +
    '<button type="button" class="tc-red fb ancho" data-tc-red="Facebook">' + FB + 'Registrarme con Facebook</button>' +
    '<div class="md-separador"><span>o con tu correo</span></div>' +
    '<form id="tcRegistro" novalidate>' +
    '<div class="tc-dos"><label>Nombre<input name="nombre" autocomplete="given-name" required placeholder="Tu nombre"></label>' +
    '<label>Celular<input type="tel" name="celular" autocomplete="tel" required inputmode="tel" placeholder="300 123 4567"></label></div>' +
    '<label>Correo electrónico<input type="email" name="correo" autocomplete="email" required placeholder="tucorreo@ejemplo.com"></label>' +
    '<label>Contraseña<span class="tc-clave"><input type="password" name="clave" autocomplete="new-password" required minlength="6" placeholder="Mínimo 6 caracteres"><button type="button" class="tc-ver" aria-label="Mostrar contraseña">' + OJO + '</button></span></label>' +
    '<label class="autorizo"><input type="checkbox" name="datos" required><span>Autorizo el tratamiento de mis datos según la <a href="#/politica-de-datos" data-tc-ir>política de datos</a> (Ley 1581 de 2012).</span></label>' +
    '<label class="autorizo"><input type="checkbox" name="correos"><span>Quiero recibir promociones de Nami en mi correo.</span></label>' +
    '<button class="boton-primario ancho" type="submit">Crear mi cuenta</button>' +
    '</form>' +
    '<p class="tc-cambiar">¿Ya tienes cuenta? <button type="button" data-tc-girar>Inicia sesión</button></p>' +
    '</section>' +

    '</div></div></div>' +
    // Botón pequeño para volver a abrir la tarjeta
    '<button class="tc-mini" id="tcMini" type="button" hidden aria-label="Abrir mi cuenta"><span class="tc-mini-icono">👤</span><span id="tcMiniTexto">Mi cuenta</span></button>';

  document.body.insertAdjacentHTML('beforeend', html);

  var capa = $('#modalCuenta'), giro = $('#tcGiro'), mini = $('#tcMini'), tarjeta = $('#tarjetaCuenta');
  var usuario = leer('nami_usuario', null); // solo el nombre/correo para saludar; nunca la contraseña

  // Textos que cambian con el idioma (saludo, avisos y botones de la sesión)
  var TX = {
    es: { hola: 'Hola', cuenta: 'Mi cuenta', puntos: 'Ver mis Nami Puntos', salir: 'Cerrar sesión', bienvenido: '¡Bienvenido de nuevo, {n}!', creada: '¡Cuenta creada! Bienvenido, {n}', saliste: 'Cerraste sesión' },
    en: { hola: 'Hi', cuenta: 'My account', puntos: 'See my Nami Points', salir: 'Sign out', bienvenido: 'Welcome back, {n}!', creada: 'Account created! Welcome, {n}', saliste: 'You signed out' },
    ja: { hola: 'こんにちは', cuenta: 'マイアカウント', puntos: 'ナミポイントを見る', salir: 'ログアウト', bienvenido: 'おかえりなさい、{n}さん！', creada: 'アカウントを作成しました！ようこそ、{n}さん', saliste: 'ログアウトしました' }
  };
  var tx = function (k, n) { var t = (TX[window.IDIOMA] || TX.es)[k]; return n ? t.replace('{n}', n) : t; };
  var saludo = function (n) { return window.IDIOMA === 'ja' ? n + 'さん、' + tx('hola') : tx('hola') + ', ' + n; };

  function pintarUsuario() {
    if (usuario) {
      $('#tcMiniTexto').textContent = saludo(usuario.nombre);
      $('#tcHola').hidden = false;
      $('#tcHola').innerHTML = (window.IDIOMA === 'ja'
        ? '<strong>' + window.NAMI.esc(usuario.nombre) + '</strong>さん、' + tx('hola') + '。'
        : tx('hola') + ', <strong>' + window.NAMI.esc(usuario.nombre) + '</strong>. ') +
        '<a href="#/puntos" data-tc-ir>' + tx('puntos') + '</a> · <button type="button" id="tcSalir">' + tx('salir') + '</button>';
      if (capa.hidden) mini.hidden = false;
    } else {
      $('#tcMiniTexto').textContent = tx('cuenta');
      $('#tcHola').hidden = true;
    }
  }
  document.addEventListener('nami:idioma', pintarUsuario); // al cambiar de idioma

  function abrirCuenta(cara) {
    giro.classList.toggle('girada', cara === 'registro');
    tarjeta.classList.remove('minimizando');
    todas('.tc-cara').forEach(function (c) { c.style.visibility = ''; });
    capa.classList.remove('desvaneciendo');
    capa.hidden = false; document.body.style.overflow = 'hidden';
    mini.hidden = true;
    setTimeout(function () {
      var cara1 = giro.classList.contains('girada') ? '.tc-atras' : '.tc-frente';
      var campo = $(cara1 + ' input'); if (campo) campo.focus({ preventScroll: true });
    }, 350);
  }
  function finCierre() {
    capa.hidden = true; document.body.style.overflow = '';
    capa.classList.remove('desvaneciendo');
    giro.classList.remove('tc-plano');
    tarjeta.classList.remove('minimizando');
    todas('.tc-cara').forEach(function (c) { c.style.visibility = ''; });
    mini.hidden = false;
  }
  // Cerrar con la (X): la tarjeta se desintegra en partículas (efecto desintegrar.js)
  var cerrando = false;
  function cerrarTarjeta() {
    if (cerrando || capa.hidden) return;
    cerrando = true;
    var cara = giro.classList.contains('girada') ? $('.tc-atras') : $('.tc-frente');
    if (typeof window.desintegrar !== 'function' || typeof window.html2canvas !== 'function') {
      // Sin internet (no cargó el efecto): se encoge hacia el botón pequeño
      tarjeta.classList.add('minimizando');
      setTimeout(function () { finCierre(); cerrando = false; }, 380);
      return;
    }
    giro.classList.add('tc-plano');           // quita el 3D un instante para poder "fotografiar" la cara visible
    capa.classList.add('desvaneciendo');
    window.desintegrar(cara, { paso: 3, velocidad: 1.1 }).then(function () {
      finCierre(); cerrando = false;
    }, function () { finCierre(); cerrando = false; });
  }
  var minimizar = cerrarTarjeta;

  capa.addEventListener('click', function (e) {
    if (e.target.closest('[data-tc-ir]')) { capa.hidden = true; document.body.style.overflow = ''; mini.hidden = false; return; }
    if (e.target === capa || e.target.closest('[data-tc-cerrar]')) cerrarTarjeta();
    if (e.target.closest('[data-tc-girar]')) giro.classList.toggle('girada');
    var ver = e.target.closest('.tc-ver');
    if (ver) { var i = ver.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; }
    var red = e.target.closest('[data-tc-red]');
    if (red) avisar('El ingreso con ' + red.dataset.tcRed + ' se activa cuando Nami conecte su cuenta de ' + red.dataset.tcRed);
    if (e.target.closest('[data-tc-olvido]')) avisar('Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña');
    if (e.target.id === 'tcSalir') { usuario = null; guardar('nami_usuario', null); pintarUsuario(); avisar(tx('saliste')); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !capa.hidden) minimizar(); });
  mini.addEventListener('click', function () { abrirCuenta('login'); });

  function valido(form) {
    var malo = Array.prototype.filter.call(form.elements, function (el) { return el.willValidate && !el.checkValidity(); })[0];
    if (malo) {
      malo.focus();
      avisar(malo.type === 'checkbox' ? 'Debes autorizar el tratamiento de datos' : malo.type === 'email' ? 'Revisa tu correo electrónico' : malo.name === 'clave' ? 'La contraseña debe tener mínimo 6 caracteres' : 'Completa todos los campos');
      return false;
    }
    return true;
  }
  $('#tcLogin').addEventListener('submit', function (e) {
    e.preventDefault(); if (!valido(this)) return;
    var correo = this.correo.value.trim();
    usuario = { nombre: correo.split('@')[0], correo: correo };
    guardar('nami_usuario', usuario); this.reset(); pintarUsuario();
    avisar(tx('bienvenido', usuario.nombre));
    minimizar();
  });
  $('#tcRegistro').addEventListener('submit', function (e) {
    e.preventDefault(); if (!valido(this)) return;
    usuario = { nombre: this.nombre.value.trim().split(' ')[0], correo: this.correo.value.trim() };
    guardar('nami_usuario', usuario); this.reset(); pintarUsuario();
    avisar(tx('creada', usuario.nombre));
    minimizar();
  });

  // Quién abre la tarjeta: ícono de sesión, "Únete", "Inicia sesión" del pedido y el pie de página
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cuenta]');
    if (a) {
      e.preventDefault();
      var otra = a.closest('.capa'); if (otra && otra !== capa) otra.hidden = true; // cierra la ventana de pedido si venía de ahí
      abrirCuenta(a.dataset.cuenta);
    }
  });
  var btnLogin = $('#btnLogin'); if (btnLogin) btnLogin.addEventListener('click', function () { abrirCuenta('login'); });
  var btnUnete = $('#btnUnete'); if (btnUnete) btnUnete.addEventListener('click', function () { abrirCuenta('registro'); });

  window.NAMI_CUENTA = { abrir: abrirCuenta };
  pintarUsuario();
})();
