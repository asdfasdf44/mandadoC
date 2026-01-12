document.addEventListener("DOMContentLoaded", () => {
  const sections = ["home", "about", "contact"];
  const navLinks = document.querySelectorAll(".nav-link");

  let isScrolling = false;
  let currentSectionIndex = 0;

  // Custom smooth scroll function
  const smoothScrollTo = (targetY, duration = 1000) => {
    const startY = window.scrollY;
    const difference = targetY - startY;
    let startTime = null;

    // Ease in-out quadratic
    const easeInOutQuad = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startY, difference, duration);

      window.scrollTo(0, run);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetY);
        isScrolling = false;
      }
    };

    requestAnimationFrame(animation);
  };

  // Scroll to section trigger
  window.scrollToSection = (id) => {
    const index = sections.indexOf(id);
    if (index >= 0) {
      const element = document.getElementById(id);
      if (element) {
        isScrolling = true;
        currentSectionIndex = index;

        // Calculate target position
        const targetY = element.offsetTop;
        smoothScrollTo(targetY, 800); // 800ms duration for visible scrolling
      }
    }
  };

  // Active section highlighting and index update
  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach((section, index) => {
      const element = document.getElementById(section);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          updateActiveLink(section);
          if (!isScrolling) {
            currentSectionIndex = index;
          }
        }
      }
    });
  };

  const updateActiveLink = (activeSection) => {
    navLinks.forEach((link) => {
      const section = link.getAttribute("data-section");
      if (section === activeSection) {
        link.classList.add("text-white");
        link.classList.remove("text-[rgba(255,255,255,0.8)]");
      } else {
        link.classList.remove("text-white");
        link.classList.add("text-[rgba(255,255,255,0.8)]");
      }
    });
  };

  window.addEventListener("scroll", handleScroll);

  // Wheel event for full page scrolling
  window.addEventListener(
    "wheel",
    (e) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }

      const currentSection = document.getElementById(
        sections[currentSectionIndex]
      );
      if (!currentSection) return;

      const { offsetTop, offsetHeight } = currentSection;
      const scrollY = window.scrollY;
      const innerHeight = window.innerHeight;
      const tolerance = 5;

      if (e.deltaY > 0) {
        // Scroll down
        if (
          scrollY + innerHeight >= offsetTop + offsetHeight - tolerance &&
          currentSectionIndex < sections.length - 1
        ) {
          e.preventDefault();
          window.scrollToSection(sections[currentSectionIndex + 1]);
        }
      } else {
        // Scroll up
        if (scrollY <= offsetTop + tolerance && currentSectionIndex > 0) {
          e.preventDefault();
          window.scrollToSection(sections[currentSectionIndex - 1]);
        }
      }
    },
    { passive: false }
  );

  // Mobile Menu Logic
  const burgerBtn = document.getElementById("burger-btn");
  const closeMenuBtn = document.getElementById("close-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  const toggleMenu = () => {
    mobileMenu.classList.toggle("translate-x-full");
    document.body.classList.toggle("overflow-hidden");
  };

  if (burgerBtn) burgerBtn.addEventListener("click", toggleMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", toggleMenu);

  window.mobileScrollTo = (id) => {
    toggleMenu();
    window.scrollToSection(id);
  };

  // Initial check
  handleScroll();
});
