// Nav scroll state
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile menu
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.classList.remove('open');
}));

// Service accordion
document.querySelectorAll('.service__header').forEach(btn => {
  btn.addEventListener('click', () => {
    const service = btn.closest('.service');
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    const isOpen = service.classList.contains('open');

    // Close all
    document.querySelectorAll('.service.open').forEach(s => {
      s.classList.remove('open');
      s.querySelector('.service__header').setAttribute('aria-expanded', 'false');
      s.querySelector('.service__body').hidden = true;
    });

    // Open clicked (if it was closed)
    if (!isOpen) {
      service.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      body.hidden = false;
    }
  });
});

// Form submit feedback
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Küldés...';
    btn.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        btn.textContent = '✓ Elküldve! Hamarosan visszajelzek.';
        btn.style.background = '#3D7A4A';
        form.reset();
      } else {
        throw new Error();
      }
    } catch {
      btn.textContent = 'Hiba – próbáld meg emailben!';
      btn.style.background = '#c0392b';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 4000);
    }
  });
}
