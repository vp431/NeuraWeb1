/* ================================================
   NeuraCon Landing Page: Script
   ================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Navbar Scroll ---- //
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const update = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// ---- Mobile Menu ---- //
function toggleMobile(force) {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (!navLinks) return;

  const open = navLinks.classList.toggle('mobile-open', typeof force === 'boolean' ? force : undefined);
  if (hamburger) hamburger.setAttribute('aria-expanded', String(open));
}

function initMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  // Close the menu after picking a link
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleMobile(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMobile(false);
  });
}

// ---- Scroll Reveal ---- //
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('visible'));
    return;
  }

  // Stagger siblings that reveal together
  reveals.forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
    const index = siblings.indexOf(el);
    if (index > 0) el.style.transitionDelay = `${Math.min(index, 5) * 70}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('visible');
        observer.unobserve(el);
        // Drop the stagger delay so hover transitions respond immediately
        setTimeout(() => { el.style.transitionDelay = ''; }, 1200);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach((el) => observer.observe(el));
}

// ---- Voice Waveforms ---- //
function initWaves() {
  document.querySelectorAll('.wave').forEach((wave) => {
    const count = wave.classList.contains('wave-lg') ? 44 : 36;
    for (let i = 0; i < count; i++) {
      const bar = document.createElement('i');
      const height = 0.25 + Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37)) * 0.75;
      bar.style.setProperty('--h', height.toFixed(2));
      bar.style.setProperty('--d', `${((i * 137) % 900) / -1000}s`);
      wave.appendChild(bar);
    }
  });
}

// ---- Hero Agent Run ---- //
// Plays the sample lead through each step, then loops.
function initAgentRun() {
  const run = document.getElementById('agentRun');
  if (!run || prefersReducedMotion) return;

  const steps = Array.from(run.querySelectorAll('[data-step]'));
  const score = run.querySelector('[data-score]');
  if (!steps.length) return;

  const finalScore = score ? parseInt(score.dataset.score, 10) : 0;
  let timers = [];
  let frame = null;

  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
    if (frame) cancelAnimationFrame(frame);
  };

  const countScore = () => {
    if (!score) return;
    run.classList.add('is-scored');
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / 900, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      score.textContent = Math.round(finalScore * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Guarantee the final value even if animation frames are throttled
    timers.push(setTimeout(() => { score.textContent = finalScore; }, 1000));
  };

  const showFinal = () => {
    clear();
    steps.forEach((step) => step.classList.add('is-on'));
    run.classList.add('is-scored');
    if (score) score.textContent = finalScore;
  };

  const play = () => {
    clear();
    steps.forEach((step) => step.classList.remove('is-on'));
    run.classList.remove('is-scored');
    if (score) score.textContent = '--';

    let at = 0;
    steps.forEach((step) => {
      at += parseInt(step.dataset.delay, 10) || 1200;
      timers.push(setTimeout(() => {
        step.classList.add('is-on');
        if (step.hasAttribute('data-scores')) countScore();
      }, at));
    });
    timers.push(setTimeout(play, at + 6000));
  };

  run.classList.add('is-animated');
  play();

  // Don't run timers in a background tab
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) showFinal();
    else play();
  });
}

// ---- Waitlist Form ---- //
function handleWaitlist(e) {
  e.preventDefault();
  const form = document.getElementById('waitlistForm');
  const success = document.getElementById('waitlistSuccess');
  const error = document.getElementById('waitlistError');
  const emailInput = document.getElementById('waitlist-email');
  const submitBtn = form.querySelector('button[type="submit"]');
  const label = submitBtn.textContent;

  if (!emailInput.value) return;

  const fail = (message) => {
    submitBtn.disabled = false;
    submitBtn.textContent = label;
    if (error) error.textContent = message;
  };

  // Disable button while submitting
  if (error) error.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  fetch(form.action, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new FormData(form)
  })
  .then(response => {
    if (response.ok) {
      form.style.display = 'none';
      success.classList.add('show');
    } else {
      fail('Something went wrong. Please try again.');
    }
  })
  .catch(() => {
    fail('Network error. Please check your connection and try again.');
  });
}

// ---- Init Everything ---- //
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initWaves();
  initAgentRun();
});
