function setupHoverBlink() {
  const meButton = document.getElementById('button-me');
  const projectsButton = document.getElementById('button-projects');
  const aboutText = document.getElementById('about-text');
  const projectsText = document.getElementById('projects-text');

  if (!meButton || !projectsButton || !aboutText || !projectsText) {
    console.error('Missing one or more elements by ID');
    return;
  }

  // State flag
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

  // Primary button always blinks secondary on hover
  addHoverHandlers(meButton, projectsButton, () => true);

  // Secondary button ONLY blinks primary after first click
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
      // First click: show about text, mark as active
      aboutText.innerHTML = `
        I’m not just a developer—I’m a builder of ideas and explorer of possibility.<br>
        This isn’t about titles; it’s about pushing limits and carving my own path.<br>
        Every project is an opportunity to evolve, and I’m here for all of it.
      `;
      aboutText.classList.remove('hidden');
      projectsText.innerText = "Less about my projects";

    } else if (projectsClickCount === 2) {
      // Second click: close loop, reset everything
      aboutText.classList.add('hidden');

      projectsButton.classList.remove("about-button-secondary-active");
      projectsText.innerText = "?";

      meButton.classList.remove("about-button-primary-hidden");
      meButton.classList.add("about-button-primary");
      meButton.innerText = "Less about me";

      projectsClickCount = 0; // Reset loop
    }
  });
}



document.addEventListener("DOMContentLoaded", function () {
  setupHoverBlink();
});