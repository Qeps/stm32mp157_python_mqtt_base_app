// Minimal UI interactions - no MQTT logic yet

document.addEventListener('DOMContentLoaded', () => {
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const intervalField = document.querySelector('.interval-field');
  const intervalSelect = intervalField?.querySelector('select');
  const stateChip = document.querySelector('[data-state]');
  const themeToggle = document.querySelector('[data-theme-toggle]');

  modeRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      const isPeriodic = event.target.value === 'periodic';
      intervalField.classList.toggle('is-disabled', !isPeriodic);
      if (intervalSelect) intervalSelect.disabled = !isPeriodic;
    });
  });

  // Simple visual status indicator
  if (stateChip) {
    stateChip.textContent = 'Status: Ready';
    stateChip.classList.add('success');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light');
      themeToggle.textContent = isLight ? 'Dark theme' : 'Light theme';
    });
  }
});
