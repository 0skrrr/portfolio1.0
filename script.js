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
    { name: "home", top: 0, element: items[0] },
    { name: "about", top: 796, element: items[1] },
    { name: "services", top: 1781, element: items[2] },
    { name: "contact", top: 2950, element: items[3] },
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

function moveHighlightToElement(
  element,
  highlightTopLeft,
  highlightBottomRight,
  withPadding = false
) {
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

function setupNavbar(
  items,
  highlightTopLeft,
  highlightBottomRight,
  scrollSections
) {
  let isHovering = false;
  let hoverTimeout;

  const pathname = window.location.pathname;
  const currentPage = pathname.split("/").pop();
  const isGalleryPage = pathname.includes("/projects/");

  items.forEach((item, index) => {
    item.addEventListener("mouseenter", () => {
      isHovering = true;
      clearTimeout(hoverTimeout);
      moveHighlightToElement(
        item,
        highlightTopLeft,
        highlightBottomRight,
        true
      );
      highlightTopLeft.style.transition = "all 0.3s ease";
      highlightBottomRight.style.transition = "all 0.3s ease";
    });

    item.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        isHovering = false;
        const target = isGalleryPage
          ? items[2]
          : getCurrentSection(scrollSections).element;
        moveHighlightToElement(target, highlightTopLeft, highlightBottomRight);
        ["backgroundColor", "boxShadow", "transform"].forEach((prop) => {
          highlightTopLeft.style[prop] = "";
          highlightBottomRight.style[prop] = "";
        });
      }, 600);
    });

    item.addEventListener("click", () => {
      if (!isGalleryPage) {
        window.scrollTo({
          top: scrollSections[index].top,
          behavior: "smooth",
        });
      } else {
        
        window.location.href = "../index.html";
        document.cookie = "navbar-clicked=true; page=";
      }
    });
  });

  window.addEventListener("load", () => {
    const target = isGalleryPage
      ? items[2]
      : getCurrentSection(scrollSections).element;
    moveHighlightToElement(target, highlightTopLeft, highlightBottomRight);
    highlightTopLeft.style.opacity = "1";
    highlightBottomRight.style.opacity = "1";
  });

  if (!isGalleryPage) {
    setInterval(() => {
      if (!isHovering) {
        const currentSection = getCurrentSection(scrollSections);
        moveHighlightToElement(
          currentSection.element,
          highlightTopLeft,
          highlightBottomRight
        );
      }
    }, 1000);
  }
}

function aboutTransform(config) {
  const {
    textElementIds,
    buttonElementId,
    leftNavId,
    rightNavId,
    texts,
    buttons,
    transitionDuration = 100,
  } = config;

  let index = 0;
  let current = 0;

  const textEls = textElementIds.map((id) => document.getElementById(id));
  const buttonEl = document.getElementById(buttonElementId);
  const leftNav = document.getElementById(leftNavId);
  const rightNav = document.getElementById(rightNavId);

  if (textEls.some((el) => !el) || !buttonEl) {
    console.error("Missing elements.");
    return;
  }

  function showContent(direction) {
    const next = 1 - current;
    const outEl = textEls[current];
    const inEl = textEls[next];

    index =
      (index + (direction === "left" ? -1 : 1) + texts.length) % texts.length;

    inEl.innerHTML = texts[index];

    
    const span = document.createElement("span");
    span.className = "about-button-text";
    span.textContent = buttons[index];
    buttonEl.innerHTML = "";
    buttonEl.appendChild(span);

    
    inEl.className = "about-text";
    outEl.className = "about-text active";

    
    inEl.style.transition = "none";
    inEl.style.transform =
      direction === "left" ? "translateX(-100%)" : "translateX(100%)";
    inEl.style.opacity = "0";
    inEl.style.zIndex = "5";
    void inEl.offsetWidth; 
    inEl.style.transition = ""; 

    
    outEl.classList.add(
      direction === "left" ? "slide-out-right" : "slide-out-left"
    );
    inEl.classList.add(
      direction === "left" ? "slide-in-left" : "slide-in-right",
      "active"
    );
    span.classList.add("active");

    
    setTimeout(() => {
      outEl.className = "about-text";
      outEl.style.zIndex = "0";
      outEl.style.opacity = "0";
      outEl.style.transform =
        direction === "left" ? "translateX(100%)" : "translateX(-100%)";

      inEl.className = "about-text active";
      inEl.style.zIndex = "5";
      inEl.style.opacity = "1";
      inEl.style.transform = "translateX(0)";

      span.className = "about-button-text active";

      current = next;
    }, transitionDuration);
  }



  
  textEls[0].innerHTML = texts[index];
  textEls[0].classList.add("active");

  const initialSpan = document.createElement("span");
  initialSpan.className = "about-button-text active";
  initialSpan.textContent = buttons[index];
  buttonEl.innerHTML = "";
  buttonEl.appendChild(initialSpan);


  if (leftNav) leftNav.onclick = () => showContent("left");
  if (rightNav) rightNav.onclick = () => showContent("right");
}

function bodyFadeOut() {
  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.remove("fade-out");

    document.querySelectorAll(".gallery-item").forEach((el) => {
      el.addEventListener("click", () => {
        const targetUrl = el.getAttribute("data-url");
        if (!targetUrl) return;

        document.body.classList.add("fade-out");

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 300);
      });
    });
  });
}

/* dnes */
function scrollPosition(currentPage) {
  if (currentPage === "index.html") {
    window.addEventListener("load", function () {
      const match = document.cookie.match(/(?:^|; )scrollY=([^;]+)/);
      if (match) {
        const scrollY = parseInt(match[1], 10);
        if (!isNaN(scrollY)) window.scrollTo(0, scrollY);
      }
    });
    window.addEventListener("beforeunload", function () {
      const scrollY = window.scrollY;
      document.cookie = `scrollY=${scrollY}`;
    });
    document.addEventListener("scroll", function () {
      const scrollY = window.scrollY;
      document.cookie = `scrollY=${scrollY}`;
    });
  }
}

function handleContactSubmission() {
  const emailInput = document.querySelector('input[name="email"]');
  const messageInput = document.querySelector('textarea[name="message"]');

  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  if (!email || !message) {
    alert("Both email and message must be filled out.");
    return;
  }

  
  if (!/\S+@\S+\.\S+/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  
  console.log("Contact submission:", { email, message });

  return { email, message };
}

function emailLineExpand() {
  const line = document.getElementById("email-stroke");
  const trigger = document.getElementById("emaill");
  console.log("trigger" + trigger);
  console.log(line);
  var length = line.getTotalLength();
  console.log(length);
  trigger.addEventListener("focus", function () {
    console.log("Email clicked");
    line.animate([{ strokeDashoffset: 0 }], {
      duration: 200,
      easing: "ease-in-out",
      fill: "forwards",
    });
  });
  trigger.addEventListener("blur", function () {
    console.log("Email clicked");
    line.animate([{ strokeDashoffset: -70 }], {
      duration: 200,
      easing: "ease-in-out",
      fill: "forwards",
    });
  });
}


function setupHoverExpansion() {
  const ontrigger = document.querySelector('.footer');
  const target = document.querySelector('.nav-bar');
  const target2 = document.querySelector(".socials-div");
  const body = document.body;
  const className = 'expanded';
  let isLocked = false;

  if (!ontrigger || !target) {
    console.warn('Required elements not found for setupHoverExpansion');
    return;
  }

  function addClass() {
    target.classList.add(className);
    target2.classList.remove("display-none")
    body.classList.add("overflow-hidden")
  }

  function removeClass() {
    body.classList.remove("overflow-hidden")
    target2.classList.add("display-none")
    target.classList.add("nav-bar-reset")
    target.classList.remove(className);
    setTimeout(() => {
      target.classList.remove("nav-bar-reset")
    }, 100);
  }

  ontrigger.addEventListener('click', () => {
    isLocked = !isLocked;
    if (isLocked) {
      addClass();
    } else {
      removeClass();
    }
  });
}






document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();
  const items = document.querySelectorAll(".nav-bar-item");
  const highlightTopLeft = document.querySelector(".nav-bar-highlight-left");
  const highlightBottomRight = document.querySelector(
    ".nav-bar-highlight-right"
  );
  const scrollSections = getScrollSections(items);
  console.log("Current page: " + currentPage);
  bodyFadeOut();
  scrollPosition(currentPage);
  setupNavbar(items, highlightTopLeft, highlightBottomRight, scrollSections);
  aboutTransform({
    textElementIds: ["about-text-a", "about-text-b"],
    buttonElementId: "button-me",
    leftNavId: "about-nav-left",
    rightNavId: "about-nav-right",
    texts: ["    <div class=about-text-a>Lorem ipsum doplnitr fwrerh ejrhwer jwejrwekj rfrwrwerwjhrj wejhrjjhwer wherjhw erjhwerj hewrjwdadasdds adasdadasd adasddsddadddads dadada </div><img class=about-image-a src=images/about/about_me.JPG>",
      "Workk", "Hobbies", "School"],
    buttons: ["Me", "My Work", "My Hobbies", "My School"],
  });
  emailLineExpand();
  setupHoverExpansion('.footer', ['.footer', '.nav-bar']);
  document
    .getElementById("sendBtn")
    .addEventListener("click", handleContactSubmission);
  setupHoverExpansion();
});
