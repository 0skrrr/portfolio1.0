const currentPage = window.location.pathname.split("/").pop();

function pxToVw(px) {
  return (px / window.innerWidth) * 100;
}

function pxToVh(px) {
  return (px / window.innerHeight) * 100;
}

function vhToPx(vh) {
  return (vh / 100) * window.innerHeight;
}

function getDeviceType() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = +(width / height).toFixed(2);

  const knownRatios = [
    // Mobile ratios  
    { ratio: 0.56, label: "9:16" },      // Common mobile ratio
    { ratio: 0.60, label: "3:5" },       // Some mobile devices
    { ratio: 0.67, label: "2:3" },       // Classic mobile ratio
    
    // Tablet & Desktop ratios
    { ratio: 1.00, label: "1:1" },       // Square
    { ratio: 1.33, label: "4:3" },       // Classic monitor
    { ratio: 1.50, label: "3:2" },       // Surface devices
    { ratio: 1.60, label: "16:10" },     // Some laptops
    { ratio: 1.67, label: "5:3" },       // Some displays 
    { ratio: 1.78, label: "16:9" },      // Common widescreen
    { ratio: 2.00, label: "18:9" },      // Ultrawide
    { ratio: 2.17, label: "19.5:9" },    // Modern ultrawide
    { ratio: 2.22, label: "20:9" },      // Gaming monitors
    { ratio: 2.33, label: "21:9" },      // Ultrawide
    { ratio: 3.56, label: "32:9" },      // Super ultrawide
  ];

  const closest = knownRatios.reduce((prev, curr) => {
    return Math.abs(curr.ratio - aspectRatio) < Math.abs(prev.ratio - aspectRatio) ? curr : prev;
  });

  return {
    ratio: aspectRatio,
    closestMatch: closest.label,
  };
}



function getScrollSections() {
  const sectionIds = ["home", "about", "services", "contact"];
  const navItems = document.querySelectorAll(".nav-bar-item");
  const { closestMatch } = getDeviceType();

  const offsetMap = {
    "4:3": 70,
    "3:2": 75,
    "5:3": 80,
    "16:10": 60,
    "16:9": 100,
    "18:9": 110,
    "19.5:9": 115,
    "20:9": 120,
    "21:9": 130,
    "32:9": 10,
    "1:1": 60,
    "3:5": 85,      // New addition
    "2:3": 90,      // New addition
    "9:16": 95,     // Optional if label used
  };


  const offset = offsetMap[closestMatch] ?? 90;

  return sectionIds.map((id, index) => {
    const element = document.getElementById(id);
    return {
      name: id,
      top: element ? element.offsetTop - offset : 0,
      element,
      navItem: navItems[index] || null, // critical link here
    };
  });
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
  const container = document.querySelector(".nav-bar-items");

  if (!container) {
    console.warn("Missing .nav-bar-items container!");
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const { closestMatch } = getDeviceType();

  const offsetMap = {
    "4:3": 1,
    "3:2": 2,
    "5:3": 2,
    "16:10": 1,
    "16:9": 1,
    "18:9": 4,
    "19.5:9": 1,
    "20:9": 5,
    "21:9": 5,
    "32:9": 1,
    "1:1": 1,
    "3:5": 2,        // New addition
    "2:3": 2,        // New addition
    "9:16": 2,       // Optional
  };



  const offset = vhToPx(withPadding ? (offsetMap[closestMatch] ?? 3) : 0);
  console.log("closestMatch", closestMatch);
  //alert("closestmatch" + closestMatch);

  const leftPx = rect.left - containerRect.left - offset;
  const topPx = rect.top - containerRect.top - offset;
  const rightPx = containerRect.right - rect.right - offset;
  const bottomPx = containerRect.bottom - rect.bottom - offset;

  // Clamp negatives just for safety
  const clamp = (val) => Math.max(0, val);

  highlightTopLeft.style.left = `${pxToVw(clamp(leftPx))}vw`;
  highlightTopLeft.style.top = `${pxToVh(clamp(topPx))}vh`;
  highlightBottomRight.style.right = `${pxToVw(clamp(rightPx))}vw`;
  highlightBottomRight.style.bottom = `${pxToVh(clamp(bottomPx))}vh`;

}







function setupNavbar() {
  const items = document.querySelectorAll(".nav-bar-item");
  const highlightTopLeft = document.querySelector(".nav-bar-highlight-left");
  const highlightBottomRight = document.querySelector(".nav-bar-highlight-right");

  let scrollSections = getScrollSections(); 
  let isHovering = false;
  let hoverTimeout;
  let scrollTimeout;
  let lockHighlight = false;

  const pathname = window.location.pathname;
  const isGalleryPage = pathname.includes("/projects/");

  function updateHighlightToCurrentSection() {
    if (!lockHighlight) {
      // If on gallery page, always highlight services section
      if (isGalleryPage) {
        moveHighlightToElement(items[2], highlightTopLeft, highlightBottomRight);
        return;
      }
      const currentSection = getCurrentSection(scrollSections);
      if (currentSection.navItem) {
        moveHighlightToElement(currentSection.navItem, highlightTopLeft, highlightBottomRight);
      }
    }
  }

  // Hover and click handlers
  items.forEach((item, index) => {
    item.addEventListener("mouseenter", () => {
      isHovering = true;
      lockHighlight = true;
      clearTimeout(hoverTimeout);
      moveHighlightToElement(item, highlightTopLeft, highlightBottomRight, true);
    });

    item.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        isHovering = false;
        lockHighlight = false;

        if (isGalleryPage) {
          moveHighlightToElement(items[2], highlightTopLeft, highlightBottomRight);
        } else {
          requestAnimationFrame(() => {
            scrollSections = getScrollSections();
            const currentSection = getCurrentSection(scrollSections);
            const navItem = currentSection?.navItem;

            if (navItem) {
              moveHighlightToElement(navItem, highlightTopLeft, highlightBottomRight);
            }
          });
        }

        ["backgroundColor", "boxShadow", "transform"].forEach((prop) => {
          highlightTopLeft.style[prop] = "";
          highlightBottomRight.style[prop] = "";
        });
      }, 300);
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

  // Initial highlight on load
  window.addEventListener("load", () => {
    const target = isGalleryPage ? items[2] : getCurrentSection(scrollSections).element;
    moveHighlightToElement(target, highlightTopLeft, highlightBottomRight);
    highlightTopLeft.style.opacity = "1";
    highlightBottomRight.style.opacity = "1";
  });

  // Scroll and resize handlers remain the same
  window.addEventListener("scroll", () => {
    if (!lockHighlight) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          updateHighlightToCurrentSection();
        });
      }, 10);
    }
  });

  window.addEventListener("resize", () => {
    scrollSections = getScrollSections();
    requestAnimationFrame(() => {
      updateHighlightToCurrentSection();
    });
  });

  window.addEventListener("load", () => {
    requestAnimationFrame(() => {
      scrollSections = getScrollSections();
      updateHighlightToCurrentSection();
    });
  });
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
    inEl.style.zIndex = "1";
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
      inEl.style.zIndex = "1";
      inEl.style.opacity = "1";
      inEl.style.transform = "translateX(0)";

      span.className = "about-button-text active";

      current = next;
    }, transitionDuration);


        // === Mobile Swipe Gesture Support ===
    let touchStartX = 0;
    let touchEndX = 0;
    function handleGesture() {
      if (touchEndX < touchStartX - 50) {
        showContent("right");
      } else if (touchEndX > touchStartX + 50) {
        showContent("left");

      }
    }

    document.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    });

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
function scrollPosition() {
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
      console.log("Scroll position saved:", scrollY);
    });
  }
}

function emailLineExpand() {
  const line = document.getElementById("email-stroke");
  const trigger = document.getElementById("emaill");
  var length = line.getTotalLength();
  trigger.addEventListener("focus", function () {
    line.animate([{ strokeDashoffset: 0 }], {
      duration: 200,
      easing: "ease-in-out",
      fill: "forwards",
    });
  });
  trigger.addEventListener("blur", function () {
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

  // Fix needed, I need contact page to not be able to make me text and do stuff, just click
  const target3 = document.querySelectorAll(".contact-page");

  const body = document.body;
  const className = 'expanded';
  let isLocked = false;

  if (!ontrigger || !target) {
    console.warn('Required elements not found for setupHoverExpansion');
    return;
  }

  function socialsOpen() {
    target.classList.add(className);
    target2.classList.remove("display-none")
    body.classList.add("overflow-hidden")
  }

  function socialsClose() {

    body.classList.remove("overflow-hidden")
    target2.classList.add("display-none")
    target.classList.add("nav-bar-reset")
    target.classList.remove(className);
    setTimeout(() => {
      target.classList.remove("nav-bar-reset")
    }, 10);
  }

  ontrigger.addEventListener('click', () => {
    isLocked = !isLocked;
    if (isLocked) {
      socialsOpen();
    } else {
      socialsClose();
    }
  });
}

function mobileNavbarExpand() {
  const navbar = document.getElementById("nav-bar")
  const polygon = document.querySelector(".nav-bar-polygon")
  const items = document.querySelectorAll(".nav-bar-items")

  const deviceList = {
    "4:3": 1,
    "3:2": 1,
    "5:3": 1,
    "16:10": 1,
    "16:9": 1,
    "18:9": 1,
    "19.5:9": 1,
    "20:9": 1,
    "21:9": 1,
    "32:9": 1,
    "1:1": 3,
    "3:5": 2,        
    "2:3": 2,        
    "9:16": 2,       
  };
  const { closestMatch } = getDeviceType();
  const device = deviceList[closestMatch] ?? 3;
  console.log("device" + device)
  clicked = false
  if (device > 1) {
    items.forEach(item => {
      item.classList.add("display-none");
    });
    navbar.addEventListener("click", () => {
      clicked = !clicked;
      if (clicked) {
        polygon.style.height = '100vh';
        navbar.classList.add("nav-bar-clicked");
        items.forEach(item => {
          item.classList.remove("display-none");
        });
        
      }
      else {
        items.forEach(item => {
          item.classList.add("display-none");
          navbar.classList.remove("nav-bar-clicked");
          polygon.style.height = '10vh';
        });
      }
    });
  }



}





document.addEventListener("DOMContentLoaded", function () {
  const deviceType = getDeviceType()
  console.log("Current page: " + currentPage);
  console.log(deviceType);
  scrollPosition();
  bodyFadeOut();
  setupNavbar ();
  setupHoverExpansion();
  mobileNavbarExpand()
  if (currentPage === "index.html") {
    //emailLineExpand();
    aboutTransform({
      textElementIds: ["about-text-a", "about-text-b"],
      buttonElementId: "button-me",
      leftNavId: "about-nav-left",
      rightNavId: "about-nav-right",
      texts: ["    <div class=about-text-a>Oskrrr - Just a guy</div><img class=about-image-a src=images/about/about_me.JPG>",
        "Workk", "Hobbies", "School"],
      buttons: ["Me", "My Work", "My Hobbies", "My School"],
  });
  }
  
});
