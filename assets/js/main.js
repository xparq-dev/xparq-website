/* ============================================
   XPARQ Holdings Corp. — Main JS
   Cursor, scroll reveal, nav behavior
   ============================================ */

// Custom cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
})();

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => observer.observe(el));

// Nav hide/show on scroll
let lastY = 0;
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > lastY && y > 100) nav.style.transform = 'translateY(-100%)';
  else nav.style.transform = 'translateY(0)';
  lastY = y;
  nav.style.transition = 'transform 0.3s ease';
});

// Contact form validation (only runs on contact.html)
const contactSubmit = document.getElementById('contactSubmit');
if (contactSubmit) {
  contactSubmit.addEventListener('click', () => {
    let valid = true;

    // Clear previous errors
    document.querySelectorAll('.form-error-text').forEach(el => el.classList.remove('visible'));
    const successMsg = document.getElementById('formSuccess');
    if (successMsg) successMsg.classList.remove('visible');

    // Name — required
    const name = document.getElementById('fieldName');
    if (!name.value.trim()) {
      showError('errorName', 'Name is required');
      valid = false;
    }

    // Email — format check
    const email = document.getElementById('fieldEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      showError('errorEmail', 'Enter a valid email address');
      valid = false;
    }

    // Subject — must select
    const subject = document.getElementById('fieldSubject');
    if (!subject.value) {
      showError('errorSubject', 'Please select a subject');
      valid = false;
    }

    // Message — min 20 chars
    const message = document.getElementById('fieldMessage');
    if (message.value.trim().length < 20) {
      showError('errorMessage', 'Message must be at least 20 characters');
      valid = false;
    }

    if (valid && successMsg) {
      successMsg.classList.add('visible');
      // Reset fields
      name.value = '';
      email.value = '';
      subject.value = '';
      message.value = '';
    }
  });

  function showError(id, text) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
      el.classList.add('visible');
    }
  }
}
