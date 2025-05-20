function pxToVw(px) {
  return (px / window.innerWidth) * 100;
}

function pxToVh(px) {
  return (px / window.innerHeight) * 100;
}

function vhToPx(vh) {
  return (vh / 100) * window.innerHeight;
}

function getScrollSections(items) {
  return [
    { name: 'home', top: 0, element: items[0] },
    { name: 'about', top: 796, element: items[1] },
    { name: 'services', top: 1781, element: items[2] },
    { name: 'contact', top: 3572, element: items[3] }
  ];
}

function getCurrentSection(scrollSections) {
  const scrollY = window.scrollY;
  let current = scrollSections[scrollSections.length - 1];

  for (let i = 0; i < scrollSections.length; i++) {
    if (scrollY < scrollSections[i].top) {
      current = scrollSections[Math.max(i - 1, 0)];
      break;
    }
  }
  return current;
}




function moveHighlightToElement(element, highlightTopLeft, highlightBottomRight, withPadding = false) {
  const rect = element.getBoundingClientRect();
  const containerRect = element.parentElement.getBoundingClientRect();
  const offset = withPadding ? vhToPx(1) : 0;

  const leftPx = rect.left - containerRect.left - offset;
  const topPx = rect.top - containerRect.top - offset;
  const rightPx = containerRect.right - rect.right - offset;
  const bottomPx = containerRect.bottom - rect.bottom - offset;

  highlightTopLeft.style.left = `${pxToVw(leftPx)}vw`;
  highlightTopLeft.style.top = `${pxToVh(topPx)}vh`;
  highlightBottomRight.style.right = `${pxToVw(rightPx)}vw`;
  highlightBottomRight.style.bottom = `${pxToVh(bottomPx)}vh`;
}




function setupNavbar(items, highlightTopLeft, highlightBottomRight, scrollSections) {
  const currentPage = window.location.pathname.split('/').pop();

  
  if (currentPage !== '' && currentPage !== 'index.html') {
    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        window.location.href = '../index.html';
      });
    });
    return;
  }

  let resetTimeout;

  items.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      clearTimeout(resetTimeout);
      moveHighlightToElement(item, highlightTopLeft, highlightBottomRight, true);
      highlightTopLeft.style.transition = 'all 0.3s ease';
      highlightBottomRight.style.transition = 'all 0.3s ease';
    });

    item.addEventListener('mouseleave', () => {
      clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => {
        const currentSection = getCurrentSection(scrollSections);
        moveHighlightToElement(currentSection.element, highlightTopLeft, highlightBottomRight);
        ['backgroundColor', 'boxShadow', 'transform'].forEach(prop => {
          highlightTopLeft.style[prop] = '';
          highlightBottomRight.style[prop] = '';
        });
      }, 600);
    });

    item.addEventListener('click', () => {
      window.scrollTo({
        top: scrollSections[index].top,
        behavior: 'smooth'
      });
    });
  });

  window.addEventListener("load", () => {
    const currentSection = getCurrentSection(scrollSections);
    moveHighlightToElement(currentSection.element, highlightTopLeft, highlightBottomRight);
  });
}






function setupGalleryScrollAlignment() {
  const galleries = document.querySelectorAll('.gallery-array-row');

  galleries.forEach(gallery => {
    const galleryItems = Array.from(gallery.children);
    galleryItems.forEach(item => {
      item.style.transform = 'translateY(0)';
      item.style.transition = 'transform 0.4s ease';
    });

    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    function updateAlignment() {
      const rowHeights = galleryItems.map(item => item.offsetHeight);
      const maxHeight = Math.max(...rowHeights);
      const allSameHeight = rowHeights.every(h => h === rowHeights[0]);

      const st = window.pageYOffset || document.documentElement.scrollTop;
      const scrollingDown = st > lastScrollTop;
      lastScrollTop = st <= 0 ? 0 : st;

      galleryItems.forEach((item, i) => {
        if (!allSameHeight && rowHeights[i] < maxHeight) {
          item.style.transform = scrollingDown ? `translateY(${maxHeight - rowHeights[i]}px)` : 'translateY(0)';
        } else {
          item.style.transform = 'translateY(0)';
        }
      });
    }

    window.addEventListener('scroll', updateAlignment);
  });
}






function setupHoverBlink() {
  const meButton = document.getElementById('button-me');
  const projectsButton = document.getElementById('button-projects');
  const aboutText = document.getElementById('about-text');
  const projectsText = document.getElementById('projects-text');

  if (!meButton || !projectsButton || !aboutText || !projectsText) {
    console.error('Missing one or more elements by ID');
    return;
  }

  
  let projectsClickCount = 0;

  function addHoverHandlers(hoverSource, targetButton, shouldBlinkCallback) {
    hoverSource.addEventListener('mouseenter', () => {
      if (shouldBlinkCallback()) {
        targetButton.classList.add('is-visible', 'is-hovered');
      }
    });

    hoverSource.addEventListener('mouseleave', () => {
      targetButton.classList.remove('is-visible', 'is-hovered');
    });
  }

  
  addHoverHandlers(meButton, projectsButton, () => true);

  
  addHoverHandlers(projectsButton, meButton, () => projectsClickCount >= 1);

  meButton.addEventListener('click', () => {
    projectsButton.classList.add("about-button-secondary-active");
    projectsText.innerText = "Less about my projects";

    aboutText.classList.add('hidden');
    meButton.classList.add("about-button-primary-hidden");
    meButton.innerHTML = "";
  });

  projectsButton.addEventListener("click", () => {
    projectsClickCount++;

    if (projectsClickCount === 1) {
      
      aboutText.innerHTML = `
        I’m not just a developer—I’m a builder of ideas and explorer of possibility.<br>
        This isn’t about titles; it’s about pushing limits and carving my own path.<br>
        Every project is an opportunity to evolve, and I’m here for all of it.
      `;
      aboutText.classList.remove('hidden');
      projectsText.innerText = "Less about my projects";

    } else if (projectsClickCount === 2) {
      
      aboutText.classList.add('hidden');

      projectsButton.classList.remove("about-button-secondary-active");
      projectsText.innerText = "?";

      meButton.classList.remove("about-button-primary-hidden");
      meButton.classList.add("about-button-primary");
      meButton.innerText = "Less about me";

      projectsClickCount = 0; 
    }
  });
}




function bodyFadeOut() {
  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.remove("fade-out");
  
    document.querySelectorAll(".gallery-item").forEach(el => {
      el.addEventListener("click", () => {
        const targetUrl = el.getAttribute("data-url");
        if (!targetUrl) return;
  
        document.body.classList.add("fade-out");
  
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 500);
      });
    });
  });
}







function scrollPosition() {
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === "index.html") {
    window.addEventListener('load', function () {
      const match = document.cookie.match(/(?:^|; )scrollY=([^;]+)/);
      if (match) {
        const scrollY = parseInt(match[1], 10);
        if (!isNaN(scrollY)) window.scrollTo(0, scrollY);
      }
    });
  }
}
















document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll('.nav-bar-item');
  const highlightTopLeft = document.querySelector('.nav-bar-highlight-left');
  const highlightBottomRight = document.querySelector('.nav-bar-highlight-right');
  const scrollSections = getScrollSections(items);

  scrollPosition();
  setupNavbar(items, highlightTopLeft, highlightBottomRight, scrollSections);
  setupGalleryScrollAlignment();
  setupHoverBlink();
  bodyFadeOut();
});
