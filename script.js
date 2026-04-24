const config = window.UPART_CONFIG || {};

const galleryPlaceholderMarkup = `
  <span
    data-gallery-placeholder="true"
    aria-hidden="true"
    style="display: grid; width: 100%; height: 100%; place-items: center; background: linear-gradient(145deg, #162636, #0d1823); color: rgba(246, 251, 255, 0.72); font-family: 'Syne', sans-serif; font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 700; letter-spacing: -0.04em;"
  >
    Image coming soon
  </span>
`;

const setConfigText = () => {
  document.querySelectorAll("[data-config]").forEach((element) => {
    const key = element.dataset.config;

    if (key && config[key]) {
      element.textContent = config[key];
    }
  });

  if (config.accentColor) {
    document.documentElement.style.setProperty("--accent", config.accentColor);
  }

  const emailLink = document.querySelector("[data-email-link]");
  if (emailLink && config.contactEmail) {
    emailLink.textContent = config.contactEmail;
    emailLink.href = `mailto:${config.contactEmail}`;
  }
};

const createGallery = () => {
  const galleryGrid = document.querySelector("#galleryGrid");
  if (!galleryGrid) return;

  if (!Array.isArray(config.images) || config.images.length === 0) {
    galleryGrid.innerHTML = `
      <div
        class="gallery-item reveal"
        role="status"
        style="display: grid; place-items: center; background: linear-gradient(145deg, #162636, #0d1823);"
      >
        <span class="gallery-meta" style="position: static; text-align: center;">
          <h3>Work coming soon</h3>
        </span>
      </div>
    `;
    return;
  }

  galleryGrid.innerHTML = config.images
    .map(
      (image, index) => `
        <button class="gallery-item reveal" type="button"${image.image ? ` data-gallery-index="${index}"` : ""}>
          ${
            image.image
              ? `<img src="${image.image}" alt="${image.alt}" loading="lazy">`
              : galleryPlaceholderMarkup
          }
          <span class="gallery-meta">
            <p${image.accentColor ? ` style="color: ${image.accentColor};"` : ""}>${image.category}</p>
            <h3>${image.title}</h3>
          </span>
        </button>
      `,
    )
    .join("");

  galleryGrid.querySelectorAll(".gallery-item img").forEach((img) => {
    img.addEventListener("error", () => {
      const card = img.closest(".gallery-item");
      if (!card) return;

      card.dataset.galleryMissing = "true";
      card.removeAttribute("data-gallery-index");
      img.remove();

      if (!card.querySelector("[data-gallery-placeholder]")) {
        card.insertAdjacentHTML("afterbegin", galleryPlaceholderMarkup);
      }
    });
  });
};

const setupRevealAnimations = () => {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  revealItems.forEach((item) => observer.observe(item));
};

const setupLightbox = () => {
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightboxImage");
  const lightboxTitle = document.querySelector("#lightboxTitle");
  const lightboxCategory = document.querySelector("#lightboxCategory");
  const closeButton = document.querySelector(".lightbox-close");

  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxCategory) return;

  const closeLightbox = () => {
    if (lightbox.open) {
      lightbox.close();
    }
    document.body.classList.remove("lightbox-open");
  };

  document.querySelectorAll("[data-gallery-index]").forEach((item) => {
    item.addEventListener("click", () => {
      if (item.dataset.galleryMissing === "true") return;

      const image = config.images?.[Number(item.dataset.galleryIndex)];
      if (!image || !image.image) return;

      lightboxImage.src = image.image;
      lightboxImage.alt = image.alt;
      lightboxTitle.textContent = image.title;
      lightboxCategory.textContent = image.category;
      document.body.classList.add("lightbox-open");

      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      }
    });
  });

  closeButton?.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  lightbox.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
  });
};

const setupNavbarBehavior = () => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  const threshold = 16;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;

    if (Math.abs(scrollDelta) >= threshold) {
      if (scrollDelta > 0 && currentScrollY > header.offsetHeight) {
        header.classList.add("nav-hidden");
      } else if (scrollDelta < 0) {
        header.classList.remove("nav-hidden");
      }

      lastScrollY = currentScrollY;
    }

    if (currentScrollY <= 0) {
      header.classList.remove("nav-hidden");
      lastScrollY = 0;
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true },
  );
};

const setupHeroTypewriter = () => {
  const headline = document.querySelector('.hero h1[data-config="headline"]');
  if (!headline) return;

  const fullText = headline.textContent?.trim();
  if (!fullText) return;

  headline.dataset.typed = "";
  headline.classList.add("typewriter-active");

  let index = 0;
  const typingInterval = window.setInterval(() => {
    index += 1;
    headline.dataset.typed = fullText.slice(0, index);

    if (index >= fullText.length) {
      window.clearInterval(typingInterval);
      headline.classList.remove("typewriter-active");
      headline.classList.add("typewriter-done");
    }
  }, 85);
};

const setupHeroSlideshow = () => {
  const slides = document.querySelectorAll(".hero-art-slide");
  if (slides.length < 2) return;

  let activeIndex = 0;

  window.setInterval(() => {
    slides[activeIndex].classList.remove("is-active");
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add("is-active");
  }, 2500);
};

setConfigText();
createGallery();
setupRevealAnimations();
setupLightbox();
setupNavbarBehavior();
setupHeroTypewriter();
setupHeroSlideshow();
