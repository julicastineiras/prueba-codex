// app.js
(() => {
  const body = document.body;

  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const themeToggle = document.querySelector(".theme-toggle");
  const scrollTopButton = document.querySelector(".scroll-top");
  const toast = document.querySelector(".toast");
  const form = document.getElementById("contact-form");

  const sections = Array.from(document.querySelectorAll("main section"));

  // Add reveal class for animation
  sections.forEach((section) => section.classList.add("reveal"));

  // ----------------------------
  // Mobile menu
  // ----------------------------
  const toggleMenu = (open) => {
    if (!navMenu || !navToggle) return;
    const isOpen = open ?? !navMenu.classList.contains("open");
    navMenu.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => toggleMenu());
  }

  // Close menu when clicking a nav link (mobile)
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 600) toggleMenu(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") toggleMenu(false);
  });

  // ----------------------------
  // Theme
  // ----------------------------
  const applyTheme = (theme) => {
    body.dataset.theme = theme;
    if (themeToggle) themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  };

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("theme", nextTheme);
    });
  }

  // ----------------------------
  // Active nav link (stable)
  // ----------------------------
  let lockActiveUntil = 0;

  function setActiveLink(sectionId) {
    if (!sectionId) return;
    navLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === `#${sectionId}`;
      a.classList.toggle("active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  // Mark active on click and lock observer briefly
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#")) {
        setActiveLink(href.slice(1));
        lockActiveUntil = Date.now() + 600;
      }
    });
  });

  const initialId = (location.hash && document.querySelector(location.hash)?.id) || sections[0]?.id;
  if (initialId) setActiveLink(initialId);

  if (sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockActiveUntil) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) setActiveLink(visible.target.id);
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: "-20% 0px -60% 0px",
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // ----------------------------
  // Reveal on scroll
  // ----------------------------
  if (sections.length) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach((section) => revealObserver.observe(section));
  }

  // ----------------------------
  // Scroll to top
  // ----------------------------
  if (scrollTopButton) {
    window.addEventListener("scroll", () => {
      scrollTopButton.classList.toggle("show", window.scrollY > 400);
    });

    scrollTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ----------------------------
  // Toast + Form (messages from HTML dataset)
  // ----------------------------
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  };

  const setError = (field, message) => {
    const errorEl = document.querySelector(`[data-error-for="${field}"]`);
    if (errorEl) errorEl.textContent = message;
  };

  const validateEmail = (value) => /.+@.+\..+/.test(value);

  if (form) {
    // Defaults (EN) in case data-* is missing
    const msg = {
      errName: form.dataset.errName || "Please enter your name.",
      errEmail: form.dataset.errEmail || "Please enter a valid email.",
      errMsg: form.dataset.errMsg || "Tell me a bit about your project.",
      toastOk:
        form.dataset.toastOk ||
        "Thanks! Your message is ready to send once a backend is connected.",
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = form.elements.name?.value?.trim() ?? "";
      const email = form.elements.email?.value?.trim() ?? "";
      const message = form.elements.message?.value?.trim() ?? "";

      let valid = true;

      setError("name", "");
      setError("email", "");
      setError("message", "");

      if (!name) {
        setError("name", msg.errName);
        valid = false;
      }

      if (!email || !validateEmail(email)) {
        setError("email", msg.errEmail);
        valid = false;
      }

      if (!message) {
        setError("message", msg.errMsg);
        valid = false;
      }

      if (valid) {
        form.reset();
        showToast(msg.toastOk);
      }
    });
  }
})();
