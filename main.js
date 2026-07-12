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

// --- Dark Mode Toggle Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // Check local storage for theme
  const storedTheme = localStorage.getItem('theme');
  const currentTheme = storedTheme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Use light theme' : 'Use dark theme');
  
  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.setAttribute('aria-label', newTheme === 'dark' ? 'Use light theme' : 'Use dark theme');
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
