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

// Respect reduced-motion preferences without ever hiding page content.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    const closeMenu = () => {
      navLinks.classList.remove('active');
      navLinks.querySelectorAll('.dropdown.open').forEach(item => item.classList.remove('open'));
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };
    hamburgerBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('active');
      hamburgerBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
    navLinks.querySelectorAll('.dropdown > a').forEach(trigger => {
      trigger.addEventListener('click', event => {
        if (window.matchMedia('(max-width: 900px)').matches) {
          const dropdown = trigger.closest('.dropdown');
          if (!dropdown.classList.contains('open')) {
            event.preventDefault();
            navLinks.querySelectorAll('.dropdown.open').forEach(item => {
              if (item !== dropdown) item.classList.remove('open');
            });
            dropdown.classList.add('open');
          }
        }
      });
    });
    navLinks.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (link && !link.matches('.dropdown > a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (!window.matchMedia('(max-width: 900px)').matches) closeMenu();
    });
  }
});

// Mark the current page for sighted and screen-reader users.
document.querySelectorAll('.nav-links a').forEach(link => {
  const target = new URL(link.href, location.href);
  if (target.pathname === location.pathname) link.setAttribute('aria-current', 'page');
});

// Let visitors explore content by role without leaving the homepage.
const audienceTabs = [...document.querySelectorAll('[data-audience-tab]')];
const audiencePanels = [...document.querySelectorAll('[data-audience-panel]')];
if (audienceTabs.length && audiencePanels.length) {
  const activateAudience = (tab, focus = false) => {
    const audience = tab.dataset.audienceTab;
    audienceTabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    audiencePanels.forEach(panel => {
      panel.hidden = panel.dataset.audiencePanel !== audience;
    });
    if (focus) tab.focus();
  };
  audienceTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateAudience(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = audienceTabs.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % audienceTabs.length;
      else next = (index - 1 + audienceTabs.length) % audienceTabs.length;
      activateAudience(audienceTabs[next], true);
    });
  });
}
// Add fast client-side search to long project tables.
document.querySelectorAll('.proj-table').forEach((table, index) => {
  const rows = [...table.querySelectorAll('tbody tr')];
  if (rows.length < 20) return;
  const toolbar = document.createElement('div');
  toolbar.className = 'table-toolbar';
  const inputId = `project-search-${index + 1}`;
  toolbar.innerHTML = `<label for="${inputId}">Search project records</label><div class="table-search-row"><input id="${inputId}" type="search" placeholder="Project, client, service or date…" autocomplete="off"><span class="table-result-count" aria-live="polite">${rows.length} records</span></div>`;
  table.parentElement.insertBefore(toolbar, table);
  const input = toolbar.querySelector('input');
  const result = toolbar.querySelector('.table-result-count');
  input.addEventListener('input', () => {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    rows.forEach(row => {
      const match = !query || row.textContent.toLocaleLowerCase().includes(query);
      row.hidden = !match;
      if (match) visible += 1;
    });
    result.textContent = `${visible} of ${rows.length} records`;
  });
});

// Accessible image preview for the field gallery.
const galleryImages = document.querySelectorAll('.gallery-grid .gallery-item img');
if (galleryImages.length && typeof HTMLDialogElement !== 'undefined') {
  const dialog = document.createElement('dialog');
  dialog.className = 'image-lightbox';
  dialog.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close image preview">×</button><img alt=""><p></p>';
  document.body.appendChild(dialog);
  const preview = dialog.querySelector('img');
  const caption = dialog.querySelector('p');
  const close = dialog.querySelector('.lightbox-close');
  const openPreview = image => {
    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt;
    caption.textContent = image.closest('.gallery-item')?.querySelector('.g-title')?.textContent || image.alt;
    dialog.showModal();
    close.focus();
  };
  galleryImages.forEach(image => {
    const item = image.closest('.gallery-item');
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View larger image: ${image.alt}`);
    item.addEventListener('click', () => openPreview(image));
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPreview(image);
      }
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
}

// Provide a compact return control on long pages.
const backToTop = document.createElement('button');
backToTop.className = 'back-to-top';
backToTop.type = 'button';
backToTop.setAttribute('aria-label', 'Back to top');
backToTop.textContent = '↑';
document.body.appendChild(backToTop);
const syncBackToTop = () => backToTop.classList.toggle('visible', window.scrollY > 700);
window.addEventListener('scroll', syncBackToTop, { passive: true });
syncBackToTop();
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
