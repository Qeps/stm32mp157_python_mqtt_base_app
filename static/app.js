document.addEventListener('DOMContentLoaded', () => {
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const intervalField = document.querySelector('.interval-field');
  const intervalSelect = intervalField?.querySelector('select');
  const stateChip = document.querySelector('[data-state]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const brokerInput = document.querySelector('[data-broker]');
  const connectBtn = document.querySelector('[data-connect]');
  const topicInput = document.querySelector('[data-topic]');
  const messageInput = document.querySelector('[data-message]');
  const publishBtn = document.querySelector('[data-publish]');
  const clearBtn = document.querySelector('[data-clear]');
  let isConnected = false;

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

  const setPublishAvailability = () => {
    if (!publishBtn) return;
    publishBtn.disabled = !isConnected;
  };
  setPublishAvailability();

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
        isConnected = true;
        setStatus('success', 'Status: Connected');
      } else {
        isConnected = false;
        setStatus('error', payload.error ? `Error: ${payload.error}` : 'Failed to connect');
      }
    } catch (err) {
      isConnected = false;
      setStatus('error', 'Network error');
    } finally {
      connectBtn.disabled = false;
      connectBtn.textContent = originalLabel;
      setPublishAvailability();
    }
  };

  if (connectBtn) {
    connectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      connect();
    });
  }

  const publishMessage = async () => {
    if (!publishBtn || !topicInput || !messageInput) return;
    if (!isConnected) {
      setStatus('error', 'Connect to the broker first');
      return;
    }

    const topic = topicInput.value.trim();
    const message = messageInput.value;
    if (!topic) {
      setStatus('error', 'Topic is required');
      topicInput.focus();
      return;
    }

    const originalLabel = publishBtn.textContent;
    publishBtn.disabled = true;
    publishBtn.textContent = 'Publishing...';
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, message })
      });
      const payload = await response.json();
      if (response.ok && payload.ok) {
        setStatus('success', 'Message published');
      } else {
        setStatus('error', payload.error ? `Error: ${payload.error}` : 'Failed to publish');
      }
    } catch (err) {
      setStatus('error', 'Network error');
    } finally {
      publishBtn.textContent = originalLabel;
      setPublishAvailability();
    }
  };

  if (publishBtn) {
    publishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      publishMessage();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (topicInput) topicInput.value = '';
      if (messageInput) messageInput.value = '';
      (topicInput || messageInput)?.focus();
    });
  }
});
