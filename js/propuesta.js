/* Propuesta: favoritos en movimiento, enlaces de compra (Justo / WhatsApp) e idiomas (Español / English / 日本語) */
(function () {
  'use strict';
  var WA = window.WHATSAPP_NAMI || '';
  var JUSTO = window.ENLACES_JUSTO || {};
  var MENU = window.MENU || [];
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };
  var waLink = function (txt) { return 'https://wa.me/' + WA + (txt ? '?text=' + encodeURIComponent(txt) : ''); };

  var porId = {};
  MENU.forEach(function (c) { c.items.forEach(function (p) { porId[p.id] = porId[p.id] || p; }); });

  // ----- Los favoritos de Nami (Favoritos + Los nuevos), en movimiento -----
  var vistos = {}, lista = [];
  MENU.filter(function (c) { return c.title === 'Favoritos' || c.title === 'Los nuevos'; })
    .forEach(function (c) { c.items.forEach(function (p) { if (p.img && !vistos[p.id]) { vistos[p.id] = 1; lista.push(p); } }); });
  var carrusel = $('#carrusel') || document.createElement('div'); // solo existe en el menú
  function pintarCarrusel() {
    var N = window['NAME_' + String(window.IDIOMA || 'es').toUpperCase()] || {};
    var html = lista.map(function (p) {
      var n = N[p.id] || p.name;
      return '<button class="destacado" data-id="' + p.id + '"><img src="' + p.img + '" alt="' + esc(n) + '" loading="lazy">' +
        '<div><strong>' + esc(n) + '</strong><span>' + p.price + '</span></div></button>';
    }).join('');
    carrusel.innerHTML = html + html; // dos vueltas para que el movimiento sea continuo
  }
  pintarCarrusel();
  carrusel.addEventListener('click', function (e) {
    var b = e.target.closest('.destacado'); if (!b) return;
    var card = document.querySelector('.producto[data-id="' + b.dataset.id + '"]');
    if (card) card.click();
  });
  // Se mueve solo; se detiene cuando el cliente pasa el mouse o lo toca
  var quieto = false, sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  carrusel.addEventListener('mouseenter', function () { quieto = true; });
  carrusel.addEventListener('mouseleave', function () { quieto = false; });
  var reanudar;
  carrusel.addEventListener('touchstart', function () { quieto = true; clearTimeout(reanudar); }, { passive: true });
  carrusel.addEventListener('touchend', function () { reanudar = setTimeout(function () { quieto = false; }, 3000); });
  if (!sinMovimiento && carrusel.isConnected) {
    // Movimiento suave sincronizado con la pantalla (60/120 Hz), solo cuando el menú está visible
    var pos = 0, antes = 0;
    var mover = function (ahora) {
      var dt = antes ? Math.min(50, ahora - antes) : 16; antes = ahora;
      if (!quieto && window.VISTA === 'menu' && !document.hidden) {
        var mitad = carrusel.scrollWidth / 2;
        pos = (Math.abs(pos - carrusel.scrollLeft) > 2 ? carrusel.scrollLeft : pos) + dt * 0.04; // ~40 px por segundo
        if (pos >= mitad) pos -= mitad;
        carrusel.scrollLeft = pos;
      }
      requestAnimationFrame(mover);
    };
    requestAnimationFrame(mover);
  }

  // ----- Enlaces de WhatsApp -----
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink('Hola Nami 🍣, quiero hacer un pedido'); a.target = '_blank'; a.rel = 'noopener';
  });

  // ----- Ventana del plato: comprar en Justo o por WhatsApp -----
  document.addEventListener('click', function (e) {
    var card = e.target.closest('.producto'); if (!card || !$('#mpJusto')) return;
    var p = porId[card.dataset.id]; if (!p) return;
    $('#mpJusto').href = JUSTO[p.id] || '#/menu';
    $('#mpWa').href = waLink('Hola Nami 🍣, quiero pedir: ' + p.name + ' (' + p.price + ')');
  }, true);

  // ----- Idiomas -----
  // Cada fila: texto en español → [inglés, japonés]
  var T = {
    // ----- Textos de Nami -----
    '🔥 2x1 Philadelphia $29.900': ['🔥 2-for-1 Philadelphia $29.900', '🔥 フィラデルフィア 2本で1本分 $29.900'],
    '🍣 Combo Pareja -20%': ['🍣 Couple Combo -20%', '🍣 ペアセット 20%オフ'],
    '🍜 Ramen tonkotsu $38.900': ['🍜 Tonkotsu ramen $38.900', '🍜 豚骨ラーメン $38.900'],
    '🥢 Nuevo: Tuna Crunch': ['🥢 New: Tuna Crunch', '🥢 新登場：ツナクランチ'],
    '🍵 Matcha latte $12.900': ['🍵 Matcha latte $12.900', '🍵 抹茶ラテ $12.900'],
    'Una ola de sabor.': ['A wave of flavor.', '味の波が、'],
    'Directo a tu mesa.': ['Straight to your table.', 'あなたの食卓へ。'],
    'Rolls, ramen y pokes preparados al momento.': ['Rolls, ramen and pokes made to order.', '注文を受けてから作るロール、ラーメン、ポケ。'],
    'Pokes': ['Pokes', 'ポケ'],
    'Ramen': ['Ramen', 'ラーメン'],
    'Postres': ['Desserts', 'デザート'],
    'Nami Roll': ['Nami Roll', 'ナミロール'],
    'Dragón Teriyaki': ['Teriyaki Dragon', 'テリヤキドラゴン'],
    'Ramen tonkotsu': ['Tonkotsu ramen', '豚骨ラーメン'],
    'Nuestro roll de la casa: salmón flameado, queso crema y aguacate, con salsa de la casa y cebollín.': ['Our house roll: torched salmon, cream cheese and avocado, with house sauce and chives.', '当店自慢のロール：炙りサーモン・クリームチーズ・アボカドに特製ソースとネギ。'],
    'Langostino tempura y pepino, cubierto de aguacate y bañado en salsa teriyaki.': ['Prawn tempura and cucumber, topped with avocado and teriyaki sauce.', '海老天ときゅうりを巻き、アボカドと照り焼きソースをのせて。'],
    'Caldo cremoso de cerdo cocinado por horas, con chashu, huevo marinado y cebollín.': ['Creamy pork broth simmered for hours, with chashu, marinated egg and scallions.', '何時間も煮込んだクリーミーな豚骨スープに、チャーシュー・味玉・ネギ。'],
    '¿QUIERES ABRIR UN NAMI EN TU CIUDAD?': ['WANT TO OPEN A NAMI IN YOUR CITY?', 'あなたの街でナミを開きませんか？'],
    'Cuéntanos de ti y te enviamos toda la información': ['Tell us about yourself and we’ll send you all the details', 'ご連絡いただければ詳しい資料をお送りします'],
    'ESCRÍBENOS': ['CONTACT US', 'お問い合わせ'],
    'Té verde': ['Green tea', '緑茶'],
    'El sushi combina arroz preparado con vinagre de arroz, pescado fresco y vegetales. Es una comida liviana que aporta energía, proteína y grasas buenas.': ['Sushi combines rice seasoned with rice vinegar, fresh fish and vegetables. It is a light meal that gives you energy, protein and healthy fats.', '寿司は酢飯・新鮮な魚・野菜を組み合わせた料理。軽くて、エネルギー・たんぱく質・良質な脂質がとれます。'],
    'El alga nori que envuelve los rolls aporta yodo, minerales y fibra, con muy pocas calorías.': ['The nori seaweed that wraps the rolls provides iodine, minerals and fiber, with very few calories.', 'ロールを包む海苔は、低カロリーでヨウ素・ミネラル・食物繊維を含みます。'],
    'El salmón es rico en omega-3 y en proteína de alta calidad, que ayudan a cuidar el corazón.': ['Salmon is rich in omega-3 and high-quality protein, which help keep your heart healthy.', 'サーモンはオメガ3と良質なたんぱく質が豊富で、心臓の健康を助けます。'],
    'El té verde y el matcha tienen antioxidantes naturales y acompañan muy bien una comida japonesa.': ['Green tea and matcha have natural antioxidants and pair perfectly with Japanese food.', '緑茶や抹茶には天然の抗酸化物質が含まれ、和食との相性も抜群です。'],
    'Nami significa “ola” en japonés. Nacimos con una idea sencilla: llevar sushi fresco, hecho al momento, a cada rincón de Bogotá.': ['Nami means “wave” in Japanese. We started with a simple idea: bring fresh, made-to-order sushi to every corner of Bogotá.', 'ナミは日本語で「波」。作りたての新鮮なお寿司をボゴタの隅々まで届けたい、という思いから生まれました。'],
    'En nuestra cocina cada roll se arma a mano, con pescado seleccionado cada mañana y salsas de la casa. Nos gusta mezclar la tradición japonesa con sabores de Colombia, como el mango, la maracuyá y el aguacate.': ['In our kitchen every roll is made by hand, with fish selected every morning and our own sauces. We love mixing Japanese tradition with Colombian flavors like mango, passion fruit and avocado.', '毎朝仕入れる魚と自家製ソースで、ロールはすべて手巻き。マンゴーやパッションフルーツ、アボカドなどコロンビアの味と日本の伝統を組み合わせています。'],
    'Texto de ejemplo para esta página de demostración. Un restaurante real debe publicar aquí su propia política, según la Ley 1581 de 2012.': ['Sample text for this demo page. A real restaurant must publish its own policy here, as required by Colombian Law 1581 of 2012.', 'デモ用のサンプル文です。実際の店舗は、コロンビアの法律（2012年第1581号）に従い独自の方針を掲載する必要があります。'],
    '¿Qué datos pedimos?': ['What data do we ask for?', 'お預かりする情報'],
    'Nombre, teléfono, correo y dirección de entrega, solo para preparar y llevar tu pedido.': ['Name, phone, email and delivery address, only to prepare and deliver your order.', 'お名前・電話番号・メール・お届け先。ご注文の準備とお届けにのみ使用します。'],
    '¿Para qué los usamos?': ['What do we use it for?', '利用目的'],
    'Para entregar tu pedido, avisarte cómo va y, si lo autorizas, enviarte promociones.': ['To deliver your order, keep you updated and, if you allow it, send you deals.', 'ご注文のお届け、状況のお知らせ、ご同意いただいた場合のキャンペーン案内のため。'],
    'Tus derechos': ['Your rights', 'お客様の権利'],
    'Puedes pedir en cualquier momento que actualicemos o borremos tus datos.': ['You can ask us to update or delete your data at any time.', 'いつでも情報の更新・削除をご依頼いただけます。'],
    'Esta es una página de demostración: aquí irían los términos del restaurante.': ['This is a demo page: the restaurant’s terms would go here.', 'これはデモページです。ここに店舗の規約が入ります。'],
    'Esta es una página de demostración: aquí el cliente pagaría en línea.': ['This is a demo page: here the customer would pay online.', 'これはデモページです。ここでオンライン決済を行います。'],
    'Página de demostración: el pago en línea no está conectado.': ['Demo page: online payment is not connected.', 'デモページのため、オンライン決済は接続されていません。'],
    'Nami Sushi Bar · Restaurante ficticio de demostración': ['Nami Sushi Bar · Fictional demo restaurant', 'ナミ・スシバー · デモ用の架空レストラン'],
    'Diseño y desarrollo:': ['Design & development:', 'デザイン・開発：'],
    'Lunes a domingo · 12:00 m. a 10:00 p. m.': ['Monday to Sunday · 12 pm to 10 pm', '月〜日 · 12:00〜22:00'],
    'Bebidas🥤': ['Drinks🥤', 'ドリンク🥤'],
    'Pide ya el Mejor sushi': ['Order the best sushi now!', '最高のお寿司を今すぐ注文！'],
    ', Recuerda que tu pedido puede tener un tiempo máximo de espera de 60-120 min, pero puede llegar antes.':
      [' Your order may take up to 60–120 min, but it can arrive sooner.', ' お届けまで最大60〜120分かかる場合がありますが、早く届くこともあります。'],
    // Inicio
    'NAMI SUSHI BAR · BOGOTÁ': ['NAMI SUSHI BAR · BOGOTÁ', 'ナミ・スシバー · ボゴタ'],
    'Bogotá tiene un antojo.': ['Bogotá is craving something.', 'ボゴタが食べたいもの。'],
    'Y sabe a Nami.': ['And it tastes like Nami.', 'それはナミの味。'],
    'Sushi, combos y sabores para salir de la rutina.': ['Sushi, combos and flavors to break the routine.', 'いつもと違う寿司、セット、味わいを。'],
    'Pedir ahora': ['Order now', '今すぐ注文'], 'Ver menú →': ['See menu →', 'メニューを見る →'], 'Ver todo el menú →': ['See the full menu →', 'すべてのメニュー →'],
    'Sushi': ['Sushi', '寿司'], 'Combos': ['Combos', 'セット'], 'Sushi pizza': ['Sushi pizza', '寿司ピザ'], 'Baos': ['Baos', 'バオ'], 'Arroces': ['Rice dishes', 'ご飯もの'],
    'Ver producto': ['View dish', '詳しく見る'], 'Ver promociones': ['See deals', 'キャンペーンを見る'],
    'Nos vemos': ['See you', 'ボゴタで'], 'en Bogotá.': ['in Bogotá.', 'お会いしましょう。'],
    'Encuentra tu sede y consulta': ['Find your location and check', 'お近くの店舗と'], 'la cobertura para tu dirección.': ['delivery coverage for your address.', '配達エリアをご確認ください。'],
    'Ver sedes': ['See locations', '店舗を見る'],
    // Ventana de pedido
    '¿Cómo quieres tu pedido?': ['How would you like your order?', 'ご注文方法を選択'], 'Retiro': ['Pick up', '店舗受け取り'],
    '¿Ya tienes una cuenta?': ['Already have an account?', 'アカウントをお持ちですか？'], 'Inicia sesión con ella': ['Sign in', 'ログイン'],
    'Compartir ubicación': ['Share my location', '現在地を共有'], 'O busca tu dirección': ['Or search your address', 'または住所を検索'],
    'Ciudad': ['City', '都市'], 'Selecciona una ciudad': ['Select a city', '都市を選択'], 'Ingresa una nueva dirección': ['Enter a new address', '新しい住所を入力'],
    'Confirmar dirección': ['Confirm address', '住所を確定'], 'Cerrar': ['Close', '閉じる'],
    'Selecciona una ciudad ': ['Select a city', '都市を選択'], 'Escribe tu dirección': ['Type your address', '住所を入力してください'],
    // Tarjeta de cuenta
    'Pide más rápido y acumula Nami Puntos.': ['Order faster and earn Nami Points.', 'もっと早く注文して、ナミポイントを貯めよう。'],
    'Continuar con Facebook': ['Continue with Facebook', 'Facebookで続ける'], 'Continuar con Google': ['Continue with Google', 'Googleで続ける'],
    'o con tu correo': ['or with your email', 'またはメールで'], 'Correo electrónico': ['Email', 'メールアドレス'], 'Contraseña': ['Password', 'パスワード'],
    '¿Olvidaste tu contraseña?': ['Forgot your password?', 'パスワードをお忘れですか？'], 'Ingresar': ['Sign in', 'ログイン'],
    '¿No tienes cuenta?': ['No account yet?', 'アカウントをお持ちでない方'], 'Regístrate': ['Sign up', '新規登録'],
    'Crear cuenta': ['Create account', 'アカウント作成'],
    'Regístrate, gana puntos con tus compras y canjéalos por productos y más.': ['Sign up, earn points with every order and redeem them for food and more.', '会員登録でポイントが貯まり、商品などと交換できます。'],
    'Registrarme con Facebook': ['Sign up with Facebook', 'Facebookで登録'], 'Nombre': ['Name', 'お名前'], 'Celular': ['Mobile', '携帯電話'],
    'Autorizo el tratamiento de mis datos según la': ['I authorize the processing of my data under the', ''],
    '(Ley 1581 de 2012).': ['(Colombian Law 1581 of 2012).', 'に基づく個人情報の取り扱いに同意します（2012年法律第1581号）。'],
    'Quiero recibir promociones de Nami en mi correo.': ['I want to receive Nami deals by email.', 'ナミのお得な情報をメールで受け取る'],
    'Crear mi cuenta': ['Create my account', 'アカウントを作成'], '¿Ya tienes cuenta?': ['Already have an account?', 'すでにアカウントをお持ちの方'],
    'Inicia sesión': ['Sign in', 'ログイン'], 'Mi cuenta': ['My account', 'マイアカウント'],
    // Plato, sucursales y franquicias
    'Inicio': ['Home', 'ホーム'], 'Menú': ['Menu', 'メニュー'], 'También te puede gustar': ['You may also like', 'こちらもおすすめ'],
    'Ver la página del plato →': ['See dish page →', '料理ページを見る →'],
    '¡Busca tu local más cercano!': ['Find your nearest location!', 'お近くの店舗を探す'],
    'Encuentra tu sede y consulta la cobertura para tu dirección.': ['Find your location and check delivery coverage for your address.', 'お近くの店舗と配達エリアをご確認ください。'],
    'Puedes recoger aquí': ['Pick-up available', '店舗受け取り可'], 'Cómo llegar ↗': ['Directions ↗', '道順 ↗'], 'Llamar': ['Call', '電話する'],
    'La cobertura y el costo del domicilio se calculan con tu dirección al momento de pagar en la tienda oficial de Nami.': ['Delivery coverage and fee are calculated from your address when you pay in Nami’s official store.', '配達エリアと配達料は、ナミ公式ストアでのお支払い時に住所から計算されます。'],
    'Franquicias': ['Franchises', 'フランチャイズ'],
    'ATENCION DILIGENCIA EL FORMULARIO DEL SIGUIENTE LINK': ['ATTENTION: FILL OUT THE FORM AT THE FOLLOWING LINK', 'ご注意：以下のリンクのフォームにご記入ください'],
    'ESTE ES EL PIMER PASO PARA TU INDEPENDENCIA': ['THIS IS THE FIRST STEP TOWARD YOUR INDEPENDENCE', 'これがあなたの独立への第一歩です'],
    'DILIGENCIAR FORMULARIO, CLICK ACA': ['FILL OUT THE FORM, CLICK HERE', 'フォームに記入する（ここをクリック）'],
    'Powered by': ['Powered by', 'Powered by'],
    'Pedir por': ['Order on', 'ご注文は'],
    // ----- Cinta de promociones -----
    // ----- Cancelaciones (respuestas) -----
    'Si, el pedido se puede cancelar pero debido a que se trata de comida preparada, solo dispones de':
      ['Yes, you can cancel your order, but since it is freshly prepared food, you only have', 'はい、キャンセルできます。ただし調理済みの料理のため、お店が注文を受け付けてから'],
    '10 minutos': ['10 minutes', '10分以内'],
    'para solicitar la cancelación a partir del momento en que el restaurante acepta el pedido.':
      ['to request the cancellation from the moment the restaurant accepts the order.', 'にキャンセルをご依頼ください。'],
    'Una vez pasado este tiempo, el pedido entra en proceso de preparación y no será posible cancelar ni realizar devoluciones.':
      ['After that, the order goes into preparation and it can no longer be cancelled or refunded.', 'それを過ぎると調理が始まるため、キャンセルや返金はできません。'],
    'Para gestionar la cancelación debes comunicarte de inmediato al siguiente número:':
      ['To cancel, contact us right away at this number:', 'キャンセルは、すぐに次の番号までご連絡ください：'],
    'Reembolsamos el dinero en el mismo medio de pago que usaste para comprar.':
      ['We refund the money to the same payment method you used.', 'ご購入時と同じお支払い方法で返金します。'],
    'Si tu pago fue por PSE, te llegará al correo un formulario que debes diligenciar y a los 10 días se hará el reembolso.':
      ['If you paid with PSE, you will receive a form by email; once you fill it out, the refund is made within 10 days.', 'PSEでお支払いの場合、メールで届くフォームにご記入いただくと、10日後に返金されます。'],
    'Cada pasarela de pago maneja tiempos diferentes, si tu pago fue a través de:':
      ['Each payment provider has different times. If you paid with:', '決済サービスごとに返金までの期間が異なります：'],
    '15 días hábiles (comercios en Colombia 🇨🇴) en verse reflejado como nota de crédito por parte de la entidad bancaria en el estado de cuenta.':
      ['15 business days (Colombian merchants 🇨🇴) to appear as a credit on your bank statement.', '15営業日（コロンビアの加盟店 🇨🇴）で、銀行の明細に返金として反映されます。'],
    'de 1 a 30 días hábiles.': ['1 to 30 business days.', '1〜30営業日。'],
    '10 días hábiles después de diligenciar el formulario para hacer la transferencia.':
      ['10 business days after you fill out the transfer form.', 'フォームにご記入後、10営業日で振り込まれます。'],
    // ----- Documentos legales -----
    'Documento legal publicado en español, el idioma oficial de Colombia. Si tienes dudas, escríbenos por WhatsApp.':
      ['This legal document is published in Spanish, the official language of Colombia. If you have questions, message us on WhatsApp.',
       'この法的文書は、コロンビアの公用語であるスペイン語で掲載しています。ご不明な点はWhatsAppでお問い合わせください。'],
    'Nami todavía no ha publicado este documento en su tienda (la página oficial también aparece vacía).':
      ['Nami has not yet published this document in its store (the official page is also empty).', 'ナミはまだこの文書をストアに掲載していません（公式ページも空白です）。'],
    'Mientras tanto, el tratamiento de tus datos se rige por la': ['In the meantime, your data is handled under the', 'それまでの間、個人情報の取り扱いは'],
    'Política de tratamiento de datos': ['Data processing policy', '個人情報の取り扱い方針'],
    'y las cancelaciones por la': ['and cancellations under the', 'に、キャンセルは'],
    // ----- Moneda -----
    'Los precios en dólares o yenes son de referencia: el cobro se hace en pesos colombianos (COP).':
      ['Prices in US dollars are for reference: you are charged in Colombian pesos (COP).', '円の価格は目安です。お支払いはコロンビア・ペソ（COP）で行われます。'],
    'SALUD ': ['HEALTHY', 'ヘルシー'], 'Salud': ['Health', '健康'], 'Temas de interés para cuidar tu salud': ['Topics to help you take care of your health', '健康のための豆知識'],
    'Algas nori': ['Nori seaweed', '海苔'], 'Anguila': ['Eel', 'うなぎ'], 'Salmón': ['Salmon', 'サーモン'],
    'Nosotros': ['About us', '私たちについて'], 'Visítanos': ['Visit us', 'ご来店ください'],
    '¿Dudas o Consultas?': ['Questions?', 'お問い合わせ'], 'Completa nuestro formulario y te responderemos a la brevedad!': ['Fill out our form and we’ll get back to you shortly!', 'フォームにご記入いただければ、すぐにご返信します！'],
    'Email': ['Email', 'メール'], 'Mensaje': ['Message', 'メッセージ'], 'Enviar mensaje': ['Send message', '送信する'],
    'Tu mensaje se envía por WhatsApp a Nami.': ['Your message is sent to Nami via WhatsApp.', 'メッセージはWhatsAppでナミに送信されます。'],
    'Ver nuestras sedes': ['See our locations', '店舗一覧を見る'],
    // ----- Páginas legales y Nami Puntos -----
    'Políticas de tratamiento de base de datos': ['Data processing policy', '個人情報の取り扱い方針'],
    'Política de Cancelación y Devoluciones ': ['Cancellation & refund policy', 'キャンセル・返金ポリシー'],
    'En nuestro restaurante trabajamos con productos preparados al momento, por lo que aplican las siguientes condiciones:': ['Our food is made to order, so the following conditions apply:', '当店の料理は注文を受けてから調理するため、以下の条件が適用されます：'],
    '¿Puedo cancelar mi pedido?': ['Can I cancel my order?', '注文をキャンセルできますか？'], '¿Cómo cancelar mi pedido?': ['How do I cancel my order?', 'キャンセルの方法は？'],
    '¿Dónde me reembolsarán el dinero?': ['Where will I get my refund?', '返金先はどこですか？'], '¿Cuándo me reembolsan el dinero?': ['When will I get my refund?', '返金はいつですか？'],
    'Documentos legales': ['Legal documents', '法的文書'], 'Términos y Condiciones': ['Terms & Conditions', '利用規約'], 'Política de Privacidad': ['Privacy Policy', 'プライバシーポリシー'],
    'Documento pendiente.': ['Pending document.', '準備中の文書です。'],
    'de cada compra vuelve a ti en puntos': ['of every purchase comes back to you as points', 'のお買い物ごとにポイント還元'],
    'mínimo para canjear en un pedido': ['minimum to redeem on an order', '1回の注文で利用できる最低額'], 'máximo que puedes canjear por pedido': ['maximum you can redeem per order', '1回の注文で利用できる上限額'],
    'Acumulas puntos cada vez que pides con tu cuenta iniciada.': ['You earn points every time you order while signed in.', 'ログインして注文するたびにポイントが貯まります。'],
    'Los puntos no se pueden usar junto con cupones de descuento.': ['Points cannot be combined with discount coupons.', 'ポイントは割引クーポンと併用できません。'],
    'Cuando canjeas puntos, ese pedido no acumula puntos nuevos.': ['Orders paid with points do not earn new points.', 'ポイントを使った注文では新たなポイントは貯まりません。'],
    'Crear mi cuenta ': ['Create my account', 'アカウントを作成'], 'Ya tengo cuenta': ['I already have an account', 'アカウントをお持ちの方'],
    'Categorías': ['Categories', 'カテゴリー'], '¿Dónde quieres pedir?': ['Where do you want to order?', 'お届け先を選択'],
    'INICIO': ['HOME', 'ホーム'], 'PROMOCIONES': ['DEALS', 'キャンペーン'], 'MENU': ['MENU', 'メニュー'], 'SALUD': ['HEALTHY', 'ヘルシー'],
    'SUCURSALES': ['LOCATIONS', '店舗'], 'NOSOTROS': ['ABOUT US', '私たちについて'], 'CONTACTO': ['CONTACT', 'お問い合わせ'], 'FRANQUICIAS': ['FRANCHISES', 'フランチャイズ'],
    'Sushi a domicilio': ['Sushi delivery', 'お寿司のデリバリー'], 'en': ['in', ''], 'Bogotá': ['Bogotá', 'ボゴタ'],
    'Disfruta el mejor sabor del sushi en Bogotá con Nami Sushi Bar. Encuentra rolls, combos y promociones especiales. ¡Pide online y recibe a domicilio!':
      ['Enjoy the best sushi in Bogotá with Nami Sushi Bar. Discover rolls, combos and special deals. Order online and get it delivered!',
       'ナミ・スシバーでボゴタ最高のお寿司をお楽しみください。ロール、セット、特別キャンペーンをご用意しています。オンラインで注文して、ご自宅へお届けします！'],
    'Los favoritos de Nami': ['Nami favorites', 'ナミの人気メニュー'],
    'Ver la carta': ['See the menu', 'メニューを見る'], 'Pedir por WhatsApp': ['Order on WhatsApp', 'WhatsAppで注文'],
    'platos': ['dishes', '品'], 'min a domicilio': ['min delivery', '分でお届け'], 'títulos Sushi Master': ['Sushi Master titles', 'スシマスター優勝'],
    'Acumula Nami Puntos': ['Earn Nami Points', 'ナミポイントを貯めよう'],
    'Regístrate, gana puntos con tus compras y canjealos por productos y más': ['Sign up, earn points with every order and redeem them for food and more', '会員登録でお買い物ごとにポイントが貯まり、商品などと交換できます'],
    'Únete': ['Join', '登録する'], 'Tu Carrito': ['Your Cart', 'カート'], 'Tu carrito esta vacío': ['Your cart is empty', 'カートは空です'],
    'Los productos que agregues aparecerán aquí': ['Items you add will show up here', '追加した商品がここに表示されます'],
    'Subtotal': ['Subtotal', '小計'], 'Total': ['Total', '合計'], 'Ver carrito': ['View cart', 'カートを見る'], 'Ir a pagar': ['Go to checkout', 'お会計へ進む'],
    'Autorizo el tratamiento de mis datos personales según la': ['I authorize the processing of my personal data under Nami’s', 'ナミの'],
    'política de datos': ['data policy', '個人情報保護方針'],
    'de Nami (Ley 1581 de 2012).': ['(Colombian Law 1581 of 2012).', 'に基づく個人情報の取り扱いに同意します（2012年法律第1581号）。'],
    'El pago se hace en la tienda oficial de Nami: tarjeta, Mercado Pago, efectivo o pago en el local.':
      ['Payment is made in Nami’s official store: card, Mercado Pago, cash or pay at the restaurant.', 'お支払いはナミ公式ストアで：カード、Mercado Pago、現金、または店頭払い。'],
    'Agregar': ['Add', '追加'], 'Comentarios para la cocina (opcional)': ['Notes for the kitchen (optional)', 'キッチンへのご要望（任意）'],
    'Comprar en la app de Nami ↗': ['Buy in the Nami app ↗', 'ナミのアプリで購入 ↗'], 'Pedir este plato por WhatsApp': ['Order this dish on WhatsApp', 'この料理をWhatsAppで注文'],
    'Domicilio': ['Delivery', 'デリバリー'], 'Recoger en tienda': ['Pick up', '店舗受け取り'], 'Dirección': ['Address', '住所'],
    'Sede donde recoges': ['Pick-up location', '受け取り店舗'], 'Confirmar': ['Confirm', '確定'],
    'Conócenos': ['About us', '私たちについて'], 'Política de datos': ['Data policy', '個人情報保護方針'],
    'Política de Cancelación y Devoluciones': ['Cancellation & refund policy', 'キャンセル・返金ポリシー'],
    'Términos y condiciones': ['Terms & conditions', '利用規約'], 'Política de privacidad': ['Privacy policy', 'プライバシーポリシー'],
    'Redes sociales': ['Social media', 'SNS'], 'Mi cuenta': ['My account', 'マイアカウント'], 'Pedir': ['Order', '注文する'],
    'Nami Puntos': ['Nami Points', 'ナミポイント'], 'Iniciar sesión': ['Sign in', 'ログイン'],
    'Debes autorizar el tratamiento de datos para continuar': ['Please authorize data processing to continue', '続行するには個人情報の取り扱いに同意してください'],
    'Experiencias': ['Experiences', '体験'], 'Promociones': ['Deals', 'キャンペーン'], 'Los nuevos': ['New', '新メニュー'], 'Favoritos': ['Favorites', '人気メニュー'],
    'Entradas': ['Starters', '前菜'], 'Combos sushi': ['Sushi combos', '寿司セット'], 'Sushi🍣': ['Sushi🍣', '寿司🍣'], 'Bao🥟': ['Bao🥟', 'バオ🥟'],
    'Arroces🥡🥢': ['Rice & noodles🥡🥢', 'ご飯・麺類🥡🥢'], 'Sopas': ['Soups', 'スープ'], 'Pokes🥙': ['Pokes🥙', 'ポケ🥙'], 'Kit de sushi': ['Sushi kit', '寿司キット'],
    'Jugos limonadas y cheladas🥤': ['Juices, lemonades & micheladas🥤', 'ジュース・レモネード・ミチェラーダ🥤'], 'Postres🍮': ['Desserts🍮', 'デザート🍮'],
    'Gaseosas': ['Soft drinks', 'ソフトドリンク'], 'Cócteles vinos y tragos': ['Cocktails, wine & drinks', 'カクテル・ワイン・お酒'], 'Cerveza': ['Beer', 'ビール'],
    'Aca encontraras experiencias que tienen que ver con Nami sushi , tales como libro de la Historia y recetas  y pintura en casa':
      ['Here you’ll find Nami Sushi experiences, like our history & recipe book and paint-at-home kits', 'ナミ寿司の歴史とレシピの本や、おうちで楽しむペイント体験などをご紹介します']
  };
  var PH = {
    'Buscar en la carta… (ej: salmón, ramen, poke)': ['Search the menu… (e.g. salmon, ramen, poke)', 'メニューを検索…（例：サーモン、ラーメン、ポケ）'],
    'Ej: Calle 93 # 11-27, Bogotá': ['E.g. Calle 93 # 11-27, Bogotá', '例：Calle 93 # 11-27, Bogotá'],
    'Ej: sin aguacate, salsa aparte…': ['E.g. no avocado, sauce on the side…', '例：アボカド抜き、ソース別添え…'],
    'Ej: Calle 93 # 11-27': ['E.g. Calle 93 # 11-27', '例：Calle 93 # 11-27'],
    'Buscar local por nombre o dirección': ['Search location by name or address', '店舗名または住所で検索'],
    'tucorreo@ejemplo.com': ['you@example.com', 'you@example.com'], 'Tu nombre': ['Your name', 'お名前'],
    'Mínimo 6 caracteres': ['At least 6 characters', '6文字以上']
  };
  var POS = { en: 0, ja: 1 };

  var idioma = 'es';
  try { idioma = localStorage.getItem('nami_idioma') || 'es'; } catch (e) { /* sin almacenamiento */ }
  if (!(idioma in POS)) idioma = 'es';
  var original = new WeakMap();

  // ----- Precios en dólares (inglés) y yenes (japonés), con el precio en pesos colombianos al lado -----
  // Tasas en vivo (se guardan 12 horas); si no hay internet, se usan las del 9 nov 2026.
  var TASAS = { USD: 3247, JPY: 20.48, fecha: 0 }; // pesos colombianos por 1 dólar / 1 yen
  try { var guardadas = JSON.parse(localStorage.getItem('nami_tasas') || 'null'); if (guardadas && guardadas.USD) TASAS = guardadas; } catch (e) { /* sin almacenamiento */ }
  if (Date.now() - (TASAS.fecha || 0) > 12 * 3600 * 1000 && window.fetch) {
    fetch('https://open.er-api.com/v6/latest/COP').then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.rates || !d.rates.USD || !d.rates.JPY) return;
      TASAS = { USD: 1 / d.rates.USD, JPY: 1 / d.rates.JPY, fecha: Date.now() };
      try { localStorage.setItem('nami_tasas', JSON.stringify(TASAS)); } catch (e) { /* sin almacenamiento */ }
      if (idioma !== 'es') traducir(document.body);
    }).catch(function () { /* se quedan las tasas guardadas */ });
  }
  function convertir(texto) {
    return texto.replace(/(\+?)\$\s?(\d{1,3}(?:\.\d{3})+|\d+)(?![\d.,])/g, function (todo, mas, monto) {
      var cop = parseInt(monto.replace(/\./g, ''), 10), copTxt = 'COP $' + monto;
      if (idioma === 'en') return mas + 'US$' + (cop / TASAS.USD).toFixed(2) + ' (' + copTxt + ')';
      if (idioma === 'ja') return mas + '¥' + Math.round(cop / TASAS.JPY).toLocaleString('ja-JP') + '（' + copTxt + '）';
      return todo;
    });
  }
  window.NAMI_PRECIO = function (cop) { // para otras partes de la página
    var monto = cop.toLocaleString('es-CO').replace(/,/g, '.');
    return idioma === 'es' ? '$' + monto : convertir('$' + monto);
  };

  function traducir(raiz) {
    var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      if (n.parentElement && (/SCRIPT|STYLE|TEXTAREA/.test(n.parentElement.tagName) || n.parentElement.closest('#selIdioma'))) continue;
      var es = original.has(n) ? original.get(n) : n.nodeValue, clave = es.trim();
      var enDic = clave in T, conPrecio = /\$\s?\d/.test(es);
      if (!enDic && !conPrecio) continue;
      if (!original.has(n)) original.set(n, es);
      var nuevo = es;
      if (idioma !== 'es') {
        if (enDic) nuevo = es.replace(clave, T[clave][POS[idioma]]);
        if (conPrecio) nuevo = convertir(nuevo);
      }
      if (n.nodeValue !== nuevo) n.nodeValue = nuevo;
    }
    document.querySelectorAll('[placeholder]').forEach(function (i) {
      if (!i.dataset.phEs) i.dataset.phEs = i.placeholder;
      var tr = PH[i.dataset.phEs];
      if (tr) i.placeholder = idioma === 'es' ? i.dataset.phEs : tr[POS[idioma]];
    });
    document.documentElement.lang = idioma;
  }

  var sel = $('#selIdioma');
  function cambiarIdioma(nuevo) {
    idioma = nuevo;
    try { localStorage.setItem('nami_idioma', idioma); } catch (e) { /* sin almacenamiento */ }
    sel.value = idioma;
    window.IDIOMA = idioma;
    if (window.NAMI_REPINTAR) window.NAMI_REPINTAR();
    pintarCarrusel();
    traducir(document.body);
    pintarSelector();
    document.dispatchEvent(new CustomEvent('nami:idioma', { detail: idioma })); // saludo de la cuenta, etc.
  }
  sel.addEventListener('change', function () { cambiarIdioma(sel.value); });

  // ----- Lista de idiomas con vida: banderas, borde de colores que gira y menú animado -----
  var BANDERAS = {
    es: '<svg viewBox="0 0 30 20"><rect width="30" height="10" fill="#FCD116"/><rect y="10" width="30" height="5" fill="#003893"/><rect y="15" width="30" height="5" fill="#CE1126"/></svg>',
    en: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#B22234"/><g fill="#fff"><rect y="1.54" width="30" height="1.54"/><rect y="4.62" width="30" height="1.54"/><rect y="7.69" width="30" height="1.54"/><rect y="10.77" width="30" height="1.54"/><rect y="13.85" width="30" height="1.54"/><rect y="16.92" width="30" height="1.54"/></g><rect width="13" height="10.77" fill="#3C3B6E"/></svg>',
    ja: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/></svg>'
  };
  var NOMBRES = { es: 'Español', en: 'English', ja: '日本語' };
  var caja = sel.closest('.idioma');
  caja.classList.add('idioma-vivo');
  caja.insertAdjacentHTML('beforeend',
    '<button type="button" class="idioma-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Idioma · Language · 言語"><span class="idioma-bandera"></span><span class="idioma-nombre"></span><svg class="idioma-flecha" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>' +
    '<ul class="idioma-menu" role="listbox" hidden>' + ['es', 'en', 'ja'].map(function (k, i) {
      return '<li role="option" data-lang="' + k + '" style="--i:' + i + '" tabindex="-1"><span class="idioma-bandera">' + BANDERAS[k] + '</span>' + NOMBRES[k] + '<span class="idioma-check">✓</span></li>';
    }).join('') + '</ul>');
  var btnIdioma = caja.querySelector('.idioma-btn'), menuIdioma = caja.querySelector('.idioma-menu');
  function pintarSelector() {
    if (!btnIdioma) return;
    btnIdioma.querySelector('.idioma-bandera').innerHTML = BANDERAS[idioma];
    btnIdioma.querySelector('.idioma-nombre').textContent = NOMBRES[idioma];
    menuIdioma.querySelectorAll('li').forEach(function (li) { li.setAttribute('aria-selected', String(li.dataset.lang === idioma)); });
    btnIdioma.classList.remove('salto'); void btnIdioma.offsetWidth; btnIdioma.classList.add('salto');
  }
  function abrirMenu(abre) {
    menuIdioma.hidden = !abre; btnIdioma.setAttribute('aria-expanded', String(abre));
    caja.classList.toggle('abierto', abre);
    if (abre) { var actual = menuIdioma.querySelector('[aria-selected="true"]'); if (actual) actual.focus(); }
  }
  btnIdioma.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); abrirMenu(menuIdioma.hidden); });
  menuIdioma.addEventListener('click', function (e) {
    var li = e.target.closest('li'); if (!li) return;
    e.preventDefault(); e.stopPropagation();
    abrirMenu(false); if (li.dataset.lang !== idioma) cambiarIdioma(li.dataset.lang);
    btnIdioma.focus();
  });
  menuIdioma.addEventListener('keydown', function (e) {
    var items = Array.prototype.slice.call(menuIdioma.querySelectorAll('li')), i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(i + items.length - 1) % items.length].focus(); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.activeElement.click(); }
    if (e.key === 'Escape') { abrirMenu(false); btnIdioma.focus(); }
  });
  document.addEventListener('click', function (e) { if (!caja.contains(e.target)) abrirMenu(false); });
  pintarSelector();
  if (idioma !== 'es') cambiarIdioma(idioma);

  // Vuelve a traducir lo que se dibuja después (carrito, búsquedas, avisos)
  var pendiente;
  new MutationObserver(function () {
    if (idioma === 'es') return;
    clearTimeout(pendiente); pendiente = setTimeout(function () { traducir(document.body); }, 30);
  }).observe(document.body, { childList: true, subtree: true });
})();
