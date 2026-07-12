// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    nav.style.boxShadow = window.scrollY > 20
      ? '0 4px 20px rgba(0,0,0,.3)' : 'none';
  }
}, { passive: true });

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Intersection Observer for fade-in
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const observer = !reduceMotion && 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 }) : null;

observer && document.querySelectorAll('.svc-card, .proj-card, .con-card, .equip-sm, .equip-big').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// Count verified company statistics once they enter the viewport.
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const animateCounter = element => {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    if (reduceMotion) {
      element.textContent = target.toLocaleString('en-US') + suffix;
      return;
    }
    const started = performance.now();
    const duration = 1200;
    const tick = now => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .5 });
    counters.forEach(counter => countObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
}

// --- Dark Mode Toggle Logic ---
const storedTheme = localStorage.getItem('theme');
const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', initialTheme);

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const syncThemeButton = theme => {
    const useLight = theme === 'dark';
    themeToggle.textContent = useLight ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', useLight ? 'Use light theme' : 'Use dark theme');
    themeToggle.title = useLight ? 'Use light theme' : 'Use dark theme';
  };
  syncThemeButton(initialTheme);
  
  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    syncThemeButton(newTheme);
  });
});

// --- Mobile Hamburger Menu ---
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-controls', 'primary-navigation');
    navLinks.id = 'primary-navigation';
    hamburgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburgerBtn.setAttribute('aria-expanded', String(navLinks.classList.contains('active')));
    });
    navLinks.addEventListener('click', event => {
      if (event.target.closest('a')) {
        navLinks.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

// Mark the current page for sighted and screen-reader users.
document.querySelectorAll('.nav-links a').forEach(link => {
  const target = new URL(link.href, location.href);
  if (target.pathname === location.pathname) link.setAttribute('aria-current', 'page');
});
