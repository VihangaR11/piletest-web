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
      history.pushState(null, '', `#${id}`);
      syncCurrentNavigation();
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

// Animate service activity bars only when the dashboard enters view.
document.querySelectorAll('.service-dashboard').forEach(dashboard => {
  if (reduceMotion || !('IntersectionObserver' in window)) {
    dashboard.classList.add('is-visible');
    return;
  }
  dashboard.classList.add('enhanced');
  const dashboardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dashboard.classList.add('is-visible');
        dashboardObserver.disconnect();
      }
    });
  }, { threshold: .2 });
  dashboardObserver.observe(dashboard);
});
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

// --- Mobile Navigation ---
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('primary-navigation');
  const navScrim = document.getElementById('nav-scrim');
  if (!hamburgerBtn || !navLinks) return;

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;
  const dropdowns = [...navLinks.querySelectorAll('.dropdown')];

  const closeDropdowns = except => {
    dropdowns.forEach(dropdown => {
      if (dropdown !== except) {
        dropdown.classList.remove('open');
        dropdown.querySelector(':scope > .nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      }
    });
  };

  const setMenu = open => {
    const shouldOpen = Boolean(open && isMobile());
    navLinks.classList.toggle('active', shouldOpen);
    navScrim?.classList.toggle('active', shouldOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(shouldOpen));
    hamburgerBtn.setAttribute('aria-label', shouldOpen ? 'Close navigation' : 'Open navigation');
    hamburgerBtn.textContent = shouldOpen ? 'Close' : 'Menu';
    document.body.classList.toggle('nav-open', shouldOpen);
    if (!shouldOpen) closeDropdowns();
  };

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector(':scope > .nav-dropdown-toggle');
    const parentLink = dropdown.querySelector(':scope > a');
    if (!toggle) return;
    const toggleDropdown = () => {
      if (!isMobile()) return;
      const shouldOpen = !dropdown.classList.contains('open');
      closeDropdowns(shouldOpen ? dropdown : undefined);
      dropdown.classList.toggle('open', shouldOpen);
      toggle.setAttribute('aria-expanded', String(shouldOpen));
    };
    toggle.addEventListener('click', toggleDropdown);
    parentLink?.addEventListener('click', event => {
      if (!isMobile() || !parentLink.hasAttribute('data-mobile-submenu-trigger')) return;
      event.preventDefault();
      toggleDropdown();
    });
  });

  hamburgerBtn.addEventListener('click', () => {
    setMenu(hamburgerBtn.getAttribute('aria-expanded') !== 'true');
  });
  navScrim?.addEventListener('click', () => setMenu(false));
  navLinks.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link && !event.defaultPrevented) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && hamburgerBtn.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      hamburgerBtn.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (!isMobile()) setMenu(false);
  });
});
// Mark the current page or subsection for sighted and screen-reader users.
const syncCurrentNavigation = () => {
  document.querySelectorAll('.nav-links a').forEach(link => {
    const target = new URL(link.href, location.href);
    link.removeAttribute('aria-current');
    if (target.pathname === location.pathname && target.hash === location.hash) {
      link.setAttribute('aria-current', 'page');
    }
  });
};
syncCurrentNavigation();
window.addEventListener('hashchange', syncCurrentNavigation);

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

// Defer large embedded PDFs until the visitor explicitly opens the viewer.
document.querySelectorAll('[data-pdf-loader]').forEach(loader => {
  const button = loader.querySelector('[data-pdf-load]');
  const preview = loader.querySelector('[data-pdf-preview]');
  const loading = loader.querySelector('[data-pdf-loading]');
  const frame = loader.querySelector('.pdf-viewer[data-src]');
  if (!button || !preview || !loading || !frame) return;

  button.addEventListener('click', event => {
    // Mobile browsers handle PDFs more reliably in their native full-page viewer.
    if (window.matchMedia('(max-width: 900px), (pointer: coarse)').matches) return;

    event.preventDefault();
    button.setAttribute('aria-disabled', 'true');
    preview.hidden = true;
    loading.hidden = false;
    frame.hidden = false;
    frame.addEventListener('load', () => {
      loading.hidden = true;
    }, { once: true });
    frame.src = frame.dataset.src;
  }, { once: true });
});

// Rotate the homepage field-work reel every two seconds with accessible controls.
(() => {
  const reel = document.querySelector('[data-hero-reel]');
  if (!reel) return;

  const slides = [...reel.querySelectorAll('[data-reel-slide]')];
  const dots = [...reel.querySelectorAll('[data-reel-dot]')];
  const pauseButton = reel.querySelector('[data-reel-toggle]');
  if (slides.length < 2 || dots.length !== slides.length || !pauseButton) return;

  let current = 0;
  let timer;
  let userPaused = false;
  let reelVisible = !('IntersectionObserver' in window);
  const saveData = navigator.connection?.saveData === true;

  const loadSlide = slide => new Promise(resolve => {
    if (slide.complete && slide.getAttribute('src')) {
      resolve();
      return;
    }
    const source = slide.dataset.src;
    if (!source && !slide.getAttribute('src')) {
      resolve();
      return;
    }
    slide.addEventListener('load', resolve, { once: true });
    slide.addEventListener('error', resolve, { once: true });
    if (source && !slide.getAttribute('src')) slide.src = source;
  });

  const showSlide = async index => {
    const nextIndex = (index + slides.length) % slides.length;
    await loadSlide(slides[nextIndex]);
    current = nextIndex;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === current;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (!saveData && reelVisible) void loadSlide(slides[(current + 1) % slides.length]);
  };

  const stopReel = () => {
    window.clearInterval(timer);
    timer = undefined;
  };

  const startReel = () => {
    stopReel();
    if (reduceMotion || saveData || userPaused || document.hidden || !reelVisible) return;
    timer = window.setInterval(() => void showSlide(current + 1), 2000);
  };

  const syncPauseButton = () => {
    pauseButton.setAttribute('aria-pressed', String(userPaused));
    pauseButton.setAttribute('aria-label', userPaused ? 'Play image reel' : 'Pause image reel');
    pauseButton.querySelector('span').textContent = userPaused ? '▶' : 'Ⅱ';
  };

  dots.forEach(dot => dot.addEventListener('click', () => {
    void showSlide(Number(dot.dataset.reelDot));
    startReel();
  }));
  pauseButton.addEventListener('click', () => {
    userPaused = !userPaused;
    syncPauseButton();
    if (userPaused) stopReel();
    else startReel();
  });
  reel.addEventListener('mouseenter', stopReel);
  reel.addEventListener('mouseleave', startReel);
  reel.addEventListener('focusin', stopReel);
  reel.addEventListener('focusout', () => window.setTimeout(() => {
    if (!reel.contains(document.activeElement)) startReel();
  }, 0));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopReel();
    else startReel();
  });

  if ('IntersectionObserver' in window) {
    const reelObserver = new IntersectionObserver(entries => {
      reelVisible = entries[0]?.isIntersecting === true;
      if (reelVisible) startReel();
      else stopReel();
    }, { rootMargin: '200px 0px', threshold: .01 });
    reelObserver.observe(reel);
  }

  pauseButton.hidden = reduceMotion || saveData;
  void showSlide(0);
  syncPauseButton();
  startReel();
})();

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
