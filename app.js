// Open index.html in a browser
(() => {
  const body = document.body;
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const themeToggle = document.querySelector('.theme-toggle');
  const scrollTopButton = document.querySelector('.scroll-top');
  const toast = document.querySelector('.toast');
  const form = document.getElementById('contact-form');

  const sections = document.querySelectorAll('main section');
  sections.forEach((section) => section.classList.add('reveal'));

  const toggleMenu = (open) => {
    const isOpen = open ?? !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', () => toggleMenu());
  navLinks.forEach((link) =>
    link.addEventListener('click', () => {
      if (window.innerWidth <= 600) {
        toggleMenu(false);
      }
    })
  );

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      toggleMenu(false);
    }
  });

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.dataset.theme = savedTheme;
    themeToggle.setAttribute('aria-pressed', String(savedTheme === 'dark'));
  }

  themeToggle.addEventListener('click', () => {
    const nextTheme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    body.dataset.theme = nextTheme;
    themeToggle.setAttribute('aria-pressed', String(nextTheme === 'dark'));
    localStorage.setItem('theme', nextTheme);
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (entry.isIntersecting && link) {
          navLinks.forEach((nav) => nav.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  sections.forEach((section) => revealObserver.observe(section));

  window.addEventListener('scroll', () => {
    scrollTopButton.classList.toggle('show', window.scrollY > 400);
  });

  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const setError = (field, message) => {
    const errorEl = document.querySelector(`[data-error-for="${field}"]`);
    errorEl.textContent = message;
  };

  const validateEmail = (value) => /.+@.+\..+/.test(value);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    let valid = true;

    setError('name', '');
    setError('email', '');
    setError('message', '');

    if (!name) {
      setError('name', 'Please enter your name.');
      valid = false;
    }

    if (!email || !validateEmail(email)) {
      setError('email', 'Please enter a valid email.');
      valid = false;
    }

    if (!message) {
      setError('message', 'Tell me a bit about your project.');
      valid = false;
    }

    if (valid) {
      form.reset();
      showToast('Thanks! Your message is ready to send once a backend is connected.');
    }
  });
})();
