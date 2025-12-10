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
  let periodicTimer = null;
  let periodicActive = false;
  let isPublishing = false;

  const setStatus = (state, label) => {
    if (!stateChip) return;
    stateChip.textContent = label;
    stateChip.classList.remove('success', 'neutral', 'pending', 'error');
    stateChip.classList.add(state);
  };

  setStatus('neutral', 'Status: Offline');

  if (stateChip) {
    stateChip.classList.add('neutral');
  }

  const getMode = () => document.querySelector('input[name="mode"]:checked')?.value || 'once';

  const setFieldLocks = (locked) => {
    if (topicInput) topicInput.disabled = locked;
    if (messageInput) messageInput.disabled = locked;
    if (clearBtn) clearBtn.disabled = locked;
    modeRadios.forEach((radio) => { radio.disabled = locked; });
  };

  const updateIntervalState = () => {
    const isPeriodic = getMode() === 'periodic';
    const shouldDisableInterval = !isPeriodic || periodicActive;
    intervalField.classList.toggle('is-disabled', shouldDisableInterval);
    if (intervalSelect) intervalSelect.disabled = shouldDisableInterval;
  };

  const setPublishAvailability = () => {
    if (!publishBtn) return;
    if (periodicActive) {
      publishBtn.disabled = false;
      publishBtn.textContent = 'Stop';
      publishBtn.classList.add('danger');
      return;
    }

    const topicReady = (topicInput?.value.trim().length || 0) > 0;
    const messageReady = (messageInput?.value.trim().length || 0) > 0;
    publishBtn.classList.remove('danger');
    publishBtn.textContent = isPublishing ? 'Publishing...' : 'Publish';
    publishBtn.disabled = isPublishing || !isConnected || !topicReady || !messageReady;
  };
  setPublishAvailability();
  updateIntervalState();

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

  const sendPublish = async (topic, message) => {
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, message })
      });
      const payload = await response.json();
      if (response.ok && payload.ok) {
        setStatus('success', periodicActive ? 'Periodic publishing...' : 'Message published');
        return true;
      }
      setStatus('error', payload.error ? `Error: ${payload.error}` : 'Failed to publish');
      return false;
    } catch (err) {
      setStatus('error', 'Network error');
      return false;
    }
  };

  const publishOnce = async () => {
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
    if (!message.trim()) {
      setStatus('error', 'Message is required');
      messageInput.focus();
      return;
    }

    isPublishing = true;
    setPublishAvailability();
    await sendPublish(topic, message);
    isPublishing = false;
    setPublishAvailability();
  };

  const stopPeriodic = () => {
    if (periodicTimer) {
      clearInterval(periodicTimer);
      periodicTimer = null;
    }
    periodicActive = false;
    setFieldLocks(false);
    updateIntervalState();
    setPublishAvailability();
    setStatus('neutral', 'Periodic stopped');
  };

  const startPeriodic = async () => {
    if (!topicInput || !messageInput) return;
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
    if (!message.trim()) {
      setStatus('error', 'Message is required');
      messageInput.focus();
      return;
    }

    const intervalSeconds = Number(intervalSelect?.value || 0) || 10;
    const intervalMs = intervalSeconds * 1000;

    periodicActive = true;
    setFieldLocks(true);
    updateIntervalState();
    setPublishAvailability();
    setStatus('pending', 'Starting periodic send...');

    const tick = async () => { await sendPublish(topic, message); };
    await tick();
    periodicTimer = setInterval(tick, intervalMs);
  };

  if (publishBtn) {
    publishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const mode = getMode();
      if (periodicActive) {
        stopPeriodic();
        return;
      }
      if (mode === 'periodic') {
        startPeriodic();
      } else {
        publishOnce();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (periodicActive) return;
      if (topicInput) topicInput.value = '';
      if (messageInput) messageInput.value = '';
      (topicInput || messageInput)?.focus();
      setPublishAvailability();
    });
  }

  modeRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      event.preventDefault();
      updateIntervalState();
      setPublishAvailability();
    });
  });

  [topicInput, messageInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('input', setPublishAvailability);
  });
});
