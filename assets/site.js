(function () {
  var bar = document.getElementById('topbar');
  if (bar) {
    var onScroll = function () { bar.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  // Schede e regole entrano una dopo l'altra, cosi' una griglia non compare
  // tutta in una volta.
  var seen = 0;
  Array.prototype.forEach.call(items, function (el) {
    if (el.classList.contains('card') || el.classList.contains('rule')) {
      el.style.transitionDelay = ((seen % 3) * 80) + 'ms';
      seen++;
    }
    io.observe(el);
  });
})();

// Il menu delle lingue e' un <details>: funziona senza JavaScript, e qui si
// aggiunge solo cio' che il markup da solo non sa fare — chiuderlo con Esc o
// con un clic fuori.
(function () {
  var menu = document.querySelector('details.lang');
  if (!menu) return;

  document.addEventListener('click', function (e) {
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.open) {
      menu.open = false;
      var s = menu.querySelector('summary');
      if (s) s.focus();
    }
  });
})();

// Ogni link di lingua, nel menu e nel piede, porta ?lang=xx. Arrivare con quel
// marcatore vuol dire che la lingua l'ha scelta una persona, quindi si conserva:
// da li' in poi la pagina d'ingresso serve quella scelta invece di indovinare
// dal browser. Il marcatore viaggia nell'URL e non in un gestore di clic, cosi'
// sopravvive a un clic col tasto centrale, a un segnalibro, a un link passato a
// qualcun altro.
//
// index.html il marcatore se lo legge da sola, nello script in testa: deve
// decidere se rimandare altrove molto prima che questo file sia stato letto.
// Qui si serve le quattro pagine tradotte; su index.html a questo punto
// l'indirizzo e' gia' pulito. Dentro try/catch: un browser con l'archiviazione
// bloccata funziona lo stesso, si dimentica soltanto la scelta.
(function () {
  var asked = (location.search.match(/[?&]lang=([a-zA-Z-]+)/) || [])[1];
  if (!asked) return;

  var code = String(asked).toLowerCase().split('-')[0];
  if (['en', 'it', 'fr', 'es', 'de'].indexOf(code) === -1) return;

  try { localStorage.setItem('djharmonic.lang', code); } catch (err) {}

  // Tiene pulita la barra degli indirizzi, e tiene libero da un marcatore
  // buono per una visita sola cio' che finisce nei segnalibri o condiviso.
  if (window.history && history.replaceState) {
    history.replaceState(null, '', location.pathname + location.hash);
  }
})();

// L'avviso sull'archiviazione. Non chiede niente: la preferenza di lingua che
// descrive e' esente dal consenso ai sensi dell'articolo 5(3), quindi non c'e'
// un Accetta e non c'e' un Rifiuta — solo una presa d'atto, ricordata perche' la
// barra non torni. Se l'archiviazione e' bloccata la barra ricompare alla visita
// dopo, che e' il modo innocuo di guastarsi.
(function () {
  var bar = document.getElementById('notice');
  if (!bar) return;

  var KEY = 'djharmonic.notice';

  var seen = null;
  try { seen = localStorage.getItem(KEY); } catch (e) {}
  if (seen) return;

  bar.hidden = false;

  var ok = bar.querySelector('button');
  if (!ok) return;

  ok.addEventListener('click', function () {
    bar.hidden = true;
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  });
})();
