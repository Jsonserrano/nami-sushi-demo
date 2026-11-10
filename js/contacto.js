/* Formulario de contacto: el mensaje se envía por WhatsApp a Nami (no se guarda en ningún lado) */
(function () {
  'use strict';
  var form = document.getElementById('formContacto');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var malo = Array.prototype.filter.call(form.elements, function (el) { return el.willValidate && !el.checkValidity(); })[0];
    if (malo) {
      malo.focus();
      window.NAMI.avisar(malo.type === 'checkbox' ? 'Debes autorizar el tratamiento de datos' : malo.type === 'email' ? 'Revisa tu correo electrónico' : 'Completa todos los campos');
      return;
    }
    var texto = 'Hola Nami, les escribo desde la página web.\n\nNombre: ' + form.nombre.value.trim() +
      '\nEmail: ' + form.email.value.trim() + '\n\nMensaje: ' + form.mensaje.value.trim();
    window.open('https://wa.me/' + (window.WHATSAPP_NAMI || '') + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    form.reset();
    window.NAMI.avisar('¡Gracias! Te responderemos a la brevedad.');
  });
})();
