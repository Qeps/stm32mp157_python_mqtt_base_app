document.addEventListener('DOMContentLoaded', () => {
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const intervalField = document.querySelector('.interval-field');
  const intervalSelect = intervalField?.querySelector('select');
  const stateChip = document.querySelector('[data-state]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const brokerInput = document.querySelector('[data-broker]');
  const connectBtn = document.querySelector('[data-connect]');

  const setStatus = (state, label) => {
    if (!stateChip) return;
    stateChip.textContent = label;
    stateChip.classList.remove('success', 'neutral', 'pending', 'error');
    stateChip.classList.add(state);
  };

  setStatus('neutral', 'Status: Offline');

  modeRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      const isPeriodic = event.target.value === 'periodic';
      intervalField.classList.toggle('is-disabled', !isPeriodic);
      if (intervalSelect) intervalSelect.disabled = !isPeriodic;
    });
  });

  if (stateChip) {
    stateChip.classList.add('neutral');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light');
      themeToggle.textContent = isLight ? 'Dark theme' : 'Light theme';
    });
  }

  const connect = async () => {
    if (!brokerInput || !connectBtn) return;
    const broker = brokerInput.value.trim();
    if (!broker) {
      setStatus('error', 'Broker required');
      brokerInput.focus();
      return;
    }
    setStatus('pending', 'Connecting...');
    connectBtn.disabled = true;
    const originalLabel = connectBtn.textContent;
    connectBtn.textContent = 'Connecting...';
    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broker })
      });
      const payload = await response.json();
      if (response.ok && payload.ok) {
        setStatus('success', 'Status: Connected');
      } else {
        setStatus('error', payload.error ? `Error: ${payload.error}` : 'Failed to connect');
      }
    } catch (err) {
      setStatus('error', 'Network error');
    } finally {
      connectBtn.disabled = false;
      connectBtn.textContent = originalLabel;
    }
  };

  if (connectBtn) {
    connectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      connect();
    });
  }
});
