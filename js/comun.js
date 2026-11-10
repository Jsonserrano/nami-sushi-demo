/* Partes comunes de todas las páginas: barra roja, encabezado, pie de página, botones de redes y ventanas.
   Cada página solo pone su contenido; este archivo agrega lo demás. */
(function () {
  'use strict';
  var pagina = document.body.getAttribute('data-pagina') || '';
  var activo = function (p) { return pagina === p ? ' class="activo"' : ''; };

  var ICONO = {
    lugar: '<svg viewBox="0 0 24 24" class="icono"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    flecha: '<svg viewBox="0 0 24 24" class="icono flecha"><path d="m6 9 6 6 6-6"/></svg>',
    fb: '<svg viewBox="0 0 24 24" class="icono"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" class="icono"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/></svg>'
  };

  var arriba =
    '<div class="barra-mensaje"><div class="contenedor"><span class="palpita">Pide ya el Mejor sushi</span>, Recuerda que tu pedido puede tener un tiempo máximo de espera de 60-120 min, pero puede llegar antes.</div></div>' +
    '<header class="encabezado" id="encabezado">' +
    '<div class="contenedor encabezado-fila">' +
    '<a href="#/inicio" class="logo" aria-label="Nami Sushi Bar - inicio"><img src="img/logo.svg" alt="Nami Sushi Bar"></a>' +
    '<div class="menu-categorias"><button class="boton-borde" id="btnCategorias" aria-haspopup="true" aria-expanded="false">' +
    '<svg viewBox="0 0 24 24" class="icono"><path d="M4 5h16M4 12h16M4 19h16"/></svg><span>Categorías</span></button>' +
    '<div class="desplegable" id="listaCategorias" hidden></div></div>' +
    '<button class="boton-borde boton-direccion" data-abrir-direccion>' + ICONO.lugar + '<span class="texto-direccion">¿Dónde quieres pedir?</span>' + ICONO.flecha + '</button>' +
    '<div class="acciones">' +
    '<div class="idioma" title="Idioma · Language · 言語"><svg viewBox="0 0 24 24" class="icono" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>' +
    '<select id="selIdioma" aria-label="Idioma · Language · 言語"><option value="es">Español</option><option value="en">English</option><option value="ja">日本語</option></select></div>' +
    '<button class="boton-icono" id="btnBuscar" aria-label="Buscar"><svg viewBox="0 0 24 24" class="icono"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>' +
    '<button class="boton-icono" id="btnLogin" aria-label="Iniciar sesión"><svg viewBox="0 0 24 24" class="icono"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg></button>' +
    '<button class="boton-icono boton-carrito" id="btnCarrito" aria-label="Ver carrito"><svg viewBox="0 0 24 24" class="icono"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg><span class="contador" id="contadorCarrito" hidden>0</span></button>' +
    '</div></div>' +
    '<div class="buscador" id="buscador" hidden><div class="contenedor"><input type="search" id="campoBuscar" placeholder="Buscar en la carta… (ej: salmón, ramen, poke)" autocomplete="off"></div></div>' +
    '<nav class="menu-principal"><div class="contenedor">' +
    '<a href="#/inicio"' + activo('inicio') + '>INICIO</a>' +
    '<a href="#/menu/c-promos">PROMOCIONES</a>' +
    '<a href="#/menu"' + activo('pedir') + '>MENU</a>' +
    '<a href="#/salud">SALUD</a>' +
    '<a href="#/sucursales"' + activo('sucursales') + '>SUCURSALES</a>' +
    '<a href="#/nosotros">NOSOTROS</a>' +
    '<a href="#/contacto">CONTACTO</a>' +
    '<a href="#/franquicias"' + activo('franquicias') + '>FRANQUICIAS</a>' +
    '</div></nav></header>';

  var abajo =
    '<footer class="pie"><div class="contenedor pie-columnas">' +
    '<div><h4>Conócenos</h4>' +
    '<a href="#/politica-de-datos">Política de datos</a>' +
    '<a href="#/franquicias">FRANQUICIAS</a>' +
    '<a href="#/cancelaciones">Política de Cancelación y Devoluciones</a>' +
    '<a href="https://www.sic.gov.co" target="_blank" rel="noopener">https://www.sic.gov.co</a>' +
    '<a href="#/documentos-legales/terminos">Términos y condiciones</a>' +
    '<a href="#/documentos-legales/privacidad">Política de privacidad</a></div>' +
    '<div><h4>Redes sociales</h4><div class="redes">' +
    '<a class="red-btn facebook" href="#/contacto" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5H14l.6-3.5h-3.1V7.6c0-.6.5-1.1 1.1-1.1H15z"/></svg></a>' +
    '<a class="red-btn instagram" href="#/contacto" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r=".9"/></svg></a>' +
    '<a class="red-btn whatsapp" id="whatsapp" href="#" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.5c-.1-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg></a>' +
    '</div></div>' +
    '<div><h4>Mi cuenta</h4>' +
    '<a href="#/menu">Pedir</a>' +
    '<a href="#/puntos">Nami Puntos</a>' +
    '<a href="#" data-cuenta="login">Iniciar sesión</a></div>' +
    '<div class="pie-logo"><img src="img/logo.svg" alt="Nami Sushi Bar"></div>' +
    '</div>' +
    '<div class="contenedor pie-legal"><span>© <span id="anio"></span> Nami Sushi Bar · Restaurante ficticio de demostración</span>' +
    '<a class="justo" href="https://github.com/Jsonserrano" target="_blank" rel="noopener"><span>Diseño y desarrollo:</span><strong>Jeison Serrano</strong></a></div>' +
    // Botón flotante de WhatsApp: brilla en verde para invitar a pedir por ahí
    '<a class="wa-flotante" href="https://wa.me/?text=' + encodeURIComponent('Hola Nami 🍣, quiero hacer un pedido') + '" target="_blank" rel="noopener" aria-label="Pedir por WhatsApp">' +
    '<span class="wa-texto">Pedir por</span>' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.5c-.1-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>' +
    '</a>' +
    '</footer>' +

    // Barra inferior del carrito (celular)
    '<button class="barra-carrito" id="barraCarrito" hidden><span class="barra-cantidad" id="barraCantidad">0</span><span>Ver carrito</span><span id="barraTotal">$0</span></button>' +


    // Ventana del plato (carta)
    '<div class="capa" id="modalProducto" hidden><div class="modal modal-producto" role="dialog" aria-modal="true" aria-labelledby="mpNombre">' +
    '<button class="cerrar" data-cerrar aria-label="Cerrar">×</button>' +
    '<div class="mp-imagen"><img id="mpImagen" alt=""></div>' +
    '<div class="mp-cuerpo"><h2 id="mpNombre" class="titulo-orator"></h2><p id="mpDesc" class="mp-desc"></p>' +
    '<div class="mp-precio"><span id="mpPrecio"></span> <s id="mpAntes"></s></div>' +
    '<div id="mpOpciones" class="op-lista"></div>' +
    '<textarea id="mpNota" class="mp-nota-campo" rows="2" placeholder="Incluye una nota" aria-label="Incluye una nota"></textarea></div>' +
    '<div class="mp-pie"><div class="cantidad"><button id="mpMenos" aria-label="Quitar uno">−</button><span id="mpCantidad">1</span><button id="mpMas" aria-label="Agregar uno">+</button></div>' +
    '<button class="boton-primario boton-agregar" id="mpAgregar">Agregar <span id="mpTotal"></span></button></div>' +
    '</div></div>' +

    // Ventana "¿Cómo quieres tu pedido?" (igual a la de Nami, en oscuro)
    '<div class="capa" id="modalDireccion" hidden><div class="modal modal-chico modal-pedido" role="dialog" aria-modal="true" aria-labelledby="mdTitulo">' +
    '<button class="cerrar" data-cerrar aria-label="Cerrar">×</button>' +
    '<h2 id="mdTitulo">¿Cómo quieres tu pedido?</h2>' +
    '<div class="pestanas"><button class="pestana activa" data-modo="Domicilio">Domicilio</button><button class="pestana" data-modo="Recoger en tienda">Retiro</button></div>' +
    '<div id="panelDomicilio">' +
    '<p class="md-cuenta">¿Ya tienes una cuenta? <a href="#" data-cuenta="login">Inicia sesión con ella</a></p>' +
    '<button class="boton-primario ancho" id="mdUbicacion" type="button">Compartir ubicación</button>' +
    '<div class="md-separador"><span>O busca tu dirección</span></div>' +
    '<label class="md-campo">' + ICONO.lugar + ' Ciudad<select id="mdCiudad"><option value="">Selecciona una ciudad</option><option>Bogotá</option><option>Bucaramanga</option></select></label>' +
    '<label class="md-campo">' + ICONO.lugar + ' Ingresa una nueva dirección<input id="mdDireccion" placeholder="Ej: Calle 93 # 11-27" autocomplete="street-address"></label>' +
    '<button class="boton-primario ancho" id="mdGuardar" type="button">Confirmar dirección</button>' +
    '</div>' +
    '<div id="panelRetiro" hidden>' +
    '<input id="mdBuscarSede" class="md-buscar" placeholder="Buscar local por nombre o dirección" autocomplete="off">' +
    '<div class="lista-sedes" id="listaSedes"></div>' +
    '</div>' +
    '<button class="md-cerrar" data-cerrar type="button">Cerrar</button>' +
    '</div></div>' +

    '<div class="aviso" id="aviso" hidden></div>';

  document.body.insertAdjacentHTML('afterbegin', arriba);
  document.body.insertAdjacentHTML('beforeend', abajo);

  // Botones de redes: brillan con su color al tocarlos con el dedo, el lápiz o el mouse
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.red-btn, .wa-flotante'); if (!b) return;
    b.classList.remove('brilla'); void b.offsetWidth; b.classList.add('brilla');
    setTimeout(function () { b.classList.remove('brilla'); }, 900);
  });

  // Sedes de Nami para recoger (ficticias)
  window.SEDES_RETIRO = [
    { nombre: 'Local Usaquén', direccion: 'Carrera 6 #119-24, Usaquén' },
    { nombre: 'Local Chapinero', direccion: 'Calle 65 #9-30, Chapinero Alto' },
    { nombre: 'Local Parque 93', direccion: 'Calle 93B #12-18, Chicó Norte' }
  ];
})();
