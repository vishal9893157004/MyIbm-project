/**
 * TITAN INDUSTRIAL CONTRACTORS — script.js
 * Handles: Preloader, Navbar, Hamburger, Smooth Scroll,
 *          Scroll Reveal, Counters, Project Filter,
 *          Testimonial Carousel, Form Validation, Back-to-Top
 */

'use strict';

/* ============================================================
   PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // Minimum display time for branded feel
  setTimeout(() => {
    preloader.classList.add('hidden');
    // Remove from DOM after transition
    preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
  }, 900);
});

/* ============================================================
   STICKY NAVBAR + ACTIVE LINK HIGHLIGHT
   ============================================================ */
const navbar  = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateNavbar() {
  // Add scrolled class for opaque background
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active link based on scroll position
  let currentSection = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) {
      currentSection = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href')?.replace('#', '');
    if (href === currentSection) link.classList.add('active');
  });
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar(); // Run once on load

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const mobileNav  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  // Prevent body scroll when menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu on link click (mobile)
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on backdrop click
document.addEventListener('click', e => {
  if (
    mobileNav.classList.contains('open') &&
    !mobileNav.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* ============================================================
   SMOOTH SCROLL FOR ALL ANCHOR LINKS
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight;
    const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  });
});

/* ============================================================
   SCROLL REVEAL (Intersection Observer)
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el, i) => {
  revealObserver.observe(el);
});

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function animateCounter(el) {
  const target  = parseInt(el.dataset.target, 10);
  const suffix  = el.dataset.suffix || '';
  const prefix  = el.dataset.prefix || '';
  const duration = 2200;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Easing: ease-out-quart
    const eased = 1 - Math.pow(1 - progress, 4);
    const value = Math.floor(eased * target);

    // Format large numbers
    let display = value;
    if (target >= 1000000) {
      display = (value / 1000000).toFixed(1) + 'M';
    } else if (target >= 1000) {
      display = value.toLocaleString();
    }

    el.textContent = prefix + display + (progress < 1 ? '' : suffix);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Final value
      let final = target >= 1000000
        ? (target / 1000000).toFixed(1) + 'M'
        : target >= 1000
          ? target.toLocaleString()
          : target;
      el.textContent = prefix + final + suffix;
    }
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.counter-val').forEach(el => {
  counterObserver.observe(el);
});

/* ============================================================
   PROJECT FILTER
   ============================================================ */
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectItems = document.querySelectorAll('.project-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    const filter = btn.dataset.filter;

    projectItems.forEach(item => {
      const cat = item.dataset.category;
      if (filter === 'all' || cat === filter) {
        item.classList.remove('hidden');
        // Re-trigger reveal animation
        item.style.animation = 'none';
        requestAnimationFrame(() => {
          item.style.animation = '';
          item.classList.remove('visible');
          // Small delay then add visible
          setTimeout(() => item.classList.add('visible'), 50);
        });
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

/* ============================================================
   TESTIMONIAL CAROUSEL
   ============================================================ */
const track    = document.getElementById('testimonialTrack');
const dots     = document.querySelectorAll('.dot');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');
const slides   = document.querySelectorAll('.testimonial-slide');
let current    = 0;
let autoPlay;

function goToSlide(index) {
  current = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${current * 100}%)`;

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === current);
    dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
  });

  slides.forEach((slide, i) => {
    slide.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
  });
}

function startAutoPlay() {
  autoPlay = setInterval(() => goToSlide(current + 1), 5500);
}
function stopAutoPlay() {
  clearInterval(autoPlay);
}

prevBtn?.addEventListener('click', () => {
  stopAutoPlay();
  goToSlide(current - 1);
  startAutoPlay();
});
nextBtn?.addEventListener('click', () => {
  stopAutoPlay();
  goToSlide(current + 1);
  startAutoPlay();
});

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    stopAutoPlay();
    goToSlide(i);
    startAutoPlay();
  });
  dot.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      stopAutoPlay();
      goToSlide(i);
      startAutoPlay();
    }
  });
});

// Touch/swipe support
let touchStartX = 0;
track?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track?.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) {
    goToSlide(diff > 0 ? current + 1 : current - 1);
  }
});

// Keyboard navigation
track?.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { stopAutoPlay(); goToSlide(current - 1); startAutoPlay(); }
  if (e.key === 'ArrowRight') { stopAutoPlay(); goToSlide(current + 1); startAutoPlay(); }
});

// Initialize carousel
goToSlide(0);
startAutoPlay();

// Pause autoplay on hover
track?.closest('.testimonial-carousel')?.addEventListener('mouseenter', stopAutoPlay);
track?.closest('.testimonial-carousel')?.addEventListener('mouseleave', startAutoPlay);

/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
const contactForm = document.getElementById('contactForm');

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) error.textContent = message;
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.remove('error');
  if (error) error.textContent = '';
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

contactForm?.addEventListener('submit', e => {
  e.preventDefault();

  const name    = document.getElementById('name');
  const email   = document.getElementById('email');
  const message = document.getElementById('message');
  let valid = true;

  // Clear previous errors
  clearError('name', 'nameError');
  clearError('email', 'emailError');
  clearError('message', 'messageError');

  // Validate name
  if (!name.value.trim()) {
    showError('name', 'nameError', 'Please enter your full name.');
    valid = false;
  } else if (name.value.trim().length < 2) {
    showError('name', 'nameError', 'Name must be at least 2 characters.');
    valid = false;
  }

  // Validate email
  if (!email.value.trim()) {
    showError('email', 'emailError', 'Please enter your email address.');
    valid = false;
  } else if (!validateEmail(email.value.trim())) {
    showError('email', 'emailError', 'Please enter a valid email address.');
    valid = false;
  }

  // Validate message
  if (!message.value.trim()) {
    showError('message', 'messageError', 'Please describe your project or inquiry.');
    valid = false;
  } else if (message.value.trim().length < 20) {
    showError('message', 'messageError', 'Please provide at least 20 characters of detail.');
    valid = false;
  }

  if (valid) {
    // Success state (replace with real form submission)
    const btn = contactForm.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('formSuccess');

    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      contactForm.reset();
      btn.textContent = 'Send Message →';
      btn.disabled = false;
      if (successMsg) successMsg.style.display = 'block';

      setTimeout(() => {
        if (successMsg) successMsg.style.display = 'none';
      }, 6000);
    }, 1200);
  }
});

// Live validation on blur
['name', 'email', 'message'].forEach(id => {
  const el = document.getElementById(id);
  el?.addEventListener('blur', () => {
    const errorMap = { name: 'nameError', email: 'emailError', message: 'messageError' };
    if (el.value.trim()) clearError(id, errorMap[id]);
  });
  el?.addEventListener('input', () => {
    const errorMap = { name: 'nameError', email: 'emailError', message: 'messageError' };
    if (el.classList.contains('error') && el.value.trim()) {
      clearError(id, errorMap[id]);
    }
  });
});

/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, { passive: true });

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   HERO PARALLAX (subtle)
   ============================================================ */
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  if (heroBg && window.scrollY < window.innerHeight) {
    heroBg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
  }
}, { passive: true });

/* ============================================================
   STAGGER REVEAL FOR GRID CHILDREN
   ============================================================ */
// Add staggered delays to service cards and project items
document.querySelectorAll('.services-grid .service-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.08}s`;
});
document.querySelectorAll('.projects-grid .project-item').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.08}s`;
});
document.querySelectorAll('.about-features .feature-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.12}s`;
});

/* ============================================================
   KEYBOARD ACCESSIBILITY: ESC to close mobile menu
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }
});

/* ============================================================
   LOG init
   ============================================================ */
console.log('%cTitan Industrial Contractors', 'color:#E8591A;font-size:20px;font-weight:900;');
console.log('%cWebsite initialized successfully.', 'color:#2C3E50;font-size:12px;');
