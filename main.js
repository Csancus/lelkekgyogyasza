// Nav scroll state
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile menu
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');
function closeMobileMenu() {
  menu.classList.remove('open');
  toggle.classList.remove('open');
  const dd = document.getElementById('navDropdown');
  if (dd) dd.classList.remove('open');
}
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
  if (!open) closeMobileMenu();
});
menu.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  // a Módszerek gomb mobilon almenüt nyit, nem zárhatja a menüt
  if (a.id === 'navDropdownBtn' && window.innerWidth <= 640) return;
  closeMobileMenu();
});

// "/#szekcio" linkek: ha a szekció ezen az oldalon is megvan, helyben görgetünk újratöltés nélkül
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="/#"]');
  if (!a) return;
  if (a.id === 'navDropdownBtn' && window.innerWidth <= 640) return; // mobilon almenüt nyit
  const el = document.getElementById(a.getAttribute('href').slice(2));
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: 'smooth' });
  history.replaceState(null, '', '#' + el.id);
});

// Nav dropdown – mobile: tap to toggle
const dropdownBtn = document.getElementById('navDropdownBtn');
const navDropdown = document.getElementById('navDropdown');
if (dropdownBtn && navDropdown) {
  dropdownBtn.addEventListener('click', (e) => {
    if (window.innerWidth <= 640) {
      e.preventDefault();
      navDropdown.classList.toggle('open');
    }
  });
}

// GYIK accordion
document.querySelectorAll('.faq-item__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
});

// Hero carousel
const carouselItems = document.querySelectorAll('.hero__carousel-item');
const carouselDots = document.querySelectorAll('.hero__carousel-dots span');
if (carouselItems.length) {
  let current = 0;
  function goTo(i) {
    carouselItems[current].classList.remove('active');
    carouselDots[current].classList.remove('active');
    current = i;
    carouselItems[current].classList.add('active');
    carouselDots[current].classList.add('active');
  }
  let timer = setInterval(() => goTo((current + 1) % carouselItems.length), 5000);
  carouselDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      timer = setInterval(() => goTo((current + 1) % carouselItems.length), 5000);
    });
  });
}

// Lightbox
(function(){
  const lb = document.getElementById('lightbox');
  if (!lb) return; // nincs galéria ezen az oldalon
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCaption');
  const lbCounter = document.createElement('div');
  lbCounter.className = 'lightbox__counter';
  lb.appendChild(lbCounter);

  let items = [], cur = 0;

  function show(i) {
    cur = (i + items.length) % items.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = items[cur].src;
      lbImg.alt = items[cur].caption;
      lbCap.textContent = items[cur].caption;
      lbCounter.textContent = (cur + 1) + ' / ' + items.length;
      lbImg.style.opacity = '1';
    }, 150);
  }

  function open(all, idx) {
    items = all;
    show(idx);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const grp = el.dataset.lightbox;
      const all = [...document.querySelectorAll('[data-lightbox="' + grp + '"]')]
        .map(a => ({ src: a.dataset.src, caption: a.dataset.caption || '' }));
      const idx = [...document.querySelectorAll('[data-lightbox="' + grp + '"]')].indexOf(el);
      open(all, idx);
    });
  });

  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => show(cur - 1));
  document.getElementById('lbNext').addEventListener('click', () => show(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
})();

// Next-section floating button (homepage only)
const nextBtn = document.getElementById('nextSectionBtn');
if (nextBtn) {
  const sections = [...document.querySelectorAll('section[id]')];
  function updateBtn() {
    const threshold = window.scrollY + window.innerHeight * 0.5;
    const hasNext = sections.some(s => s.getBoundingClientRect().top + window.scrollY > threshold + 60);
    nextBtn.classList.toggle('hidden', !hasNext);
  }
  nextBtn.addEventListener('click', () => {
    const threshold = window.scrollY + window.innerHeight * 0.5;
    const next = sections.find(s => s.getBoundingClientRect().top + window.scrollY > threshold + 60);
    if (next) next.scrollIntoView({ behavior: 'smooth' });
  });
  window.addEventListener('scroll', updateBtn, { passive: true });
  updateBtn();
  // kompakt hero-s oldalakon a nyíl nem lebeg: mindig az aktuális szekció aljára kerül
  if (document.querySelector('.hero--compact')) {
    nextBtn.classList.add('nsb--inhero');
    const place = () => {
      const threshold = window.scrollY + window.innerHeight * 0.5;
      const idx = sections.findIndex(s => s.getBoundingClientRect().top + window.scrollY > threshold + 60);
      if (idx === -1) return; // nincs következő — updateBtn már elrejtette
      const cur = sections[Math.max(0, idx - 1)];
      if (nextBtn.parentElement !== cur) cur.appendChild(nextBtn);
    };
    window.addEventListener('scroll', place, { passive: true });
    place();
  }
}

// Contact form — AJAX submit, inline thank-you
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Küldés…';
    btn.disabled = true;
    try {
      // FormSubmit AJAX — a Vercel hosting nem futtat PHP-t (mail.php megszűnt)
      const res = await fetch('https://formsubmit.co/ajax/csanad.peter.czarth@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: 'Új érdeklődő – lelkekgyogyasza.hu',
          _template: 'table',
          _cc: 'n.b.ildiko72@gmail.com',
          _captcha: 'false',
          'Név': form.querySelector('[name="name"]').value,
          'Email': form.querySelector('[name="email"]').value,
          'Telefon': form.querySelector('[name="phone"]').value,
          'Lakcím': form.querySelector('[name="address"]')?.value || '',
          'Érdekli': form.querySelector('[name="service"]').value,
          'Üzenet': form.querySelector('[name="message"]').value,
        })
      });
      if (res.ok) {
        form.querySelectorAll('h3,div.form__row,div.form__group,button,p.form__note').forEach(el => el.style.display = 'none');
        document.getElementById('formThanks').style.display = 'block';
      } else { throw new Error(); }
    } catch {
      btn.textContent = 'Hiba – írj emailben!';
      btn.style.background = '#c0392b';
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 4000);
    }
  });
}

// Booking prefill: data-booking gombok kitöltik a kapcsolat űrlapot
document.querySelectorAll('a[data-booking]').forEach(btn => {
  btn.addEventListener('click', () => {
    const msg = document.getElementById('message');
    if (msg) msg.value = btn.dataset.booking;
    const svc = document.getElementById('service');
    if (svc && btn.dataset.service) {
      for (const o of svc.options) {
        if (o.text.indexOf(btn.dataset.service) !== -1) { o.selected = true; break; }
      }
    }
  });
});

// Árkártya: kattintható sorok — a kiválasztott csomag kerül az üzenetbe
document.querySelectorAll('.mprice-card').forEach(card => {
  const btn = card.querySelector('a[data-booking]');
  const rows = card.querySelectorAll('.mprice-row[data-msg]');
  if (!btn || !rows.length) return;
  const select = row => {
    rows.forEach(r => r.classList.remove('mprice-row--selected'));
    row.classList.add('mprice-row--selected');
    btn.dataset.booking = row.dataset.msg;
  };
  rows.forEach(row => row.addEventListener('click', () => select(row)));
  select(rows[0]);
});

// Térkép: csak akkor tölt be, amikor a látótér közelébe ér
const mapFrame = document.querySelector('iframe[data-src]');
if (mapFrame) {
  const loadMap = () => { if (!mapFrame.getAttribute('src')) mapFrame.src = mapFrame.dataset.src; };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { loadMap(); io.disconnect(); } });
    }, { rootMargin: '600px' });
    io.observe(mapFrame);
  } else { loadMap(); }
}


// Események menüpont a headerben, ha van jövőbeli esemény
(function esemenyekNavLink() {
  var menu = document.getElementById('navMenu');
  if (!menu || menu.querySelector('a[href="/esemenyek"]')) return;
  var today = new Date().toISOString().slice(0, 10);
  function inject() {
    var a = document.createElement('a');
    a.href = '/esemenyek';
    a.textContent = 'Események';
    var blog = menu.querySelector('a[href="/blog"]');
    if (blog && blog.nextSibling) menu.insertBefore(a, blog.nextSibling);
    else menu.appendChild(a);
  }
  // 12 orás localStorage cache: nem kérdezzük le minden oldalletöltésnél
  try {
    var c = JSON.parse(localStorage.getItem('evNav') || 'null');
    if (c && c.exp > Date.now()) {
      if (c.next && c.next >= today) inject();
      return;
    }
  } catch (e) {}
  fetch('/api/events').then(function (r) { return r.json(); }).then(function (evs) {
    var next = '';
    if (Array.isArray(evs)) evs.forEach(function (e) {
      if (e && e.date >= today && (!next || e.date < next)) next = e.date;
    });
    try { localStorage.setItem('evNav', JSON.stringify({ exp: Date.now() + 12 * 3600 * 1000, next: next })); } catch (e) {}
    if (next) inject();
  }).catch(function () {});
})();
