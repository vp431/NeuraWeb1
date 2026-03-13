/* ================================================
   NeuraCon Landing Page — Script
   ================================================ */

// ---- Particle System ---- //
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.connections = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.resize();
    this.init();
    this.animate();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 18000), 80);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? 'rgba(0, 102, 255, 0.6)' : 'rgba(124, 58, 237, 0.6)',
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse interaction
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x += dx * force * 0.01;
          p.y += dy * force * 0.01;
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(100, 130, 255, ${0.08 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ---- Navbar Scroll ---- //
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  });
}

// ---- Mobile Menu ---- //
function toggleMobile() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('mobile-open');
  }
}

// ---- Scroll Reveal ---- //
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stagger children if they exist
        const children = entry.target.querySelectorAll('.glass-card');
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.1}s`;
        });
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  reveals.forEach((el) => observer.observe(el));
}

// ---- Animated Counters ---- //
function initCounters() {
  const counters = document.querySelectorAll('.hero-stat-value');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        if (isNaN(target)) return;

        const originalText = el.textContent;
        const suffix = originalText.replace(/[0-9]/g, '');
        let current = 0;
        const duration = 2000;
        const step = target / (duration / 16);

        const updateCounter = () => {
          current += step;
          if (current >= target) {
            current = target;
            el.textContent = target + suffix;
            return;
          }
          el.textContent = Math.floor(current) + suffix;
          requestAnimationFrame(updateCounter);
        };

        updateCounter();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
}

// ---- Typing Effect for Hero ---- //
function initTypingEffect() {
  const badge = document.querySelector('.hero-badge');
  if (!badge) return;

  // Subtle glow pulse on badge
  let glowIntensity = 0;
  let glowDirection = 1;

  function animateGlow() {
    glowIntensity += 0.01 * glowDirection;
    if (glowIntensity >= 1) glowDirection = -1;
    if (glowIntensity <= 0) glowDirection = 1;

    badge.style.boxShadow = `0 0 ${20 * glowIntensity}px rgba(0, 102, 255, ${0.15 * glowIntensity})`;
    requestAnimationFrame(animateGlow);
  }

  animateGlow();
}

// ---- Smooth Scroll ---- //
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close mobile menu if open
        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.remove('mobile-open');
      }
    });
  });
}

// ---- Waitlist Form ---- //
function handleWaitlist(e) {
  e.preventDefault();
  const form = document.getElementById('waitlistForm');
  const success = document.getElementById('waitlistSuccess');
  const emailInput = document.getElementById('waitlist-email');

  if (emailInput.value) {
    form.style.display = 'none';
    success.classList.add('show');

    // Confetti burst
    createConfetti();
  }
}

// ---- Mini Confetti ---- //
function createConfetti() {
  const colors = ['#0066FF', '#7C3AED', '#00D4AA', '#EC4899', '#F59E0B'];
  const container = document.querySelector('.cta-inner');
  if (!container) return;

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: absolute;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      top: 50%;
      left: 50%;
      pointer-events: none;
      z-index: 100;
      opacity: 1;
    `;

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 200 + 100;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    container.appendChild(confetti);

    let x = 0, y = 0, opacity = 1;

    function animateConfetti() {
      x += vx * 0.016;
      y += vy * 0.016 + 2;
      opacity -= 0.015;

      confetti.style.transform = `translate(${x}px, ${y}px) rotate(${x * 2}deg)`;
      confetti.style.opacity = Math.max(0, opacity);

      if (opacity > 0) {
        requestAnimationFrame(animateConfetti);
      } else {
        confetti.remove();
      }
    }

    requestAnimationFrame(animateConfetti);
  }
}

// ---- Parallax on Hero Visual ---- //
function initParallax() {
  const heroVisual = document.querySelector('.hero-visual');
  if (!heroVisual) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const rate = scrolled * 0.15;
    heroVisual.style.transform = `translateY(${rate}px)`;
  });
}

// ---- Card Tilt Effect ---- //
function initTilt() {
  const cards = document.querySelectorAll('.feature-card, .step-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -3;
      const rotateY = (x - centerX) / centerX * 3;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// ---- Cursor Glow ---- //
function initCursorGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 102, 255, 0.04) 0%, transparent 60%);
    pointer-events: none;
    z-index: 1;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ---- Init Everything ---- //
document.addEventListener('DOMContentLoaded', () => {
  // Particles
  const canvas = document.getElementById('particles-canvas');
  if (canvas) new ParticleSystem(canvas);

  // All modules
  initNavbar();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initTypingEffect();
  initParallax();
  initTilt();
  initCursorGlow();
});
