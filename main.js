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

// Nav dropdown
const dropdownBtn = document.getElementById('navDropdownBtn');
const navDropdown = document.getElementById('navDropdown');
if (dropdownBtn && navDropdown) {
  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = navDropdown.classList.toggle('open');
    dropdownBtn.classList.toggle('open', open);
    dropdownBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', () => {
    navDropdown.classList.remove('open');
    dropdownBtn.classList.remove('open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
  });
  navDropdown.addEventListener('click', (e) => e.stopPropagation());
}

// Service card expand/collapse
document.querySelectorAll('.service-card__toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.service-card');
    const isExpanded = card.classList.contains('expanded');
    card.classList.toggle('expanded', !isExpanded);
    btn.setAttribute('aria-expanded', String(!isExpanded));
  });
});

// Hero carousel
const carouselItems = document.querySelectorAll('.hero__carousel-item');
const carouselDots = document.querySelectorAll('.hero__carousel-dots span');
if (carouselItems.length) {
  let current = 0;
  setInterval(() => {
    carouselItems[current].classList.remove('active');
    carouselDots[current].classList.remove('active');
    current = (current + 1) % carouselItems.length;
    carouselItems[current].classList.add('active');
    carouselDots[current].classList.add('active');
  }, 3000);
}

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
