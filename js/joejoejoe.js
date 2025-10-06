(() => {
  const stage = document.querySelector('[data-joejoe-stage]');
  const randomizeButton = document.querySelector('[data-randomize]');
  const screenshotButton = document.querySelector('[data-screenshot]');
  const loadingMessage = document.querySelector('[data-loading-message]');

  if (!stage || !randomizeButton || !screenshotButton) {
    return;
  }

  const PUPIL_RANGE_FACTOR = 0.35;
  const BORDER_COLOR = '#111';
  const STAGE_SATURATION = 62;
  const defaults = Object.freeze({
    count: 12,
    minSize: 140,
    maxSize: 340,
    canvasWidth: 960,
    canvasHeight: 540,
    stageHue: 210,
    stageLightness: 88,
  });

  const controls = {
    count: document.querySelector('[data-control-count]'),
    minSize: document.querySelector('[data-control-min-size]'),
    maxSize: document.querySelector('[data-control-max-size]'),
    canvasWidth: document.querySelector('[data-control-canvas-width]'),
    canvasHeight: document.querySelector('[data-control-canvas-height]'),
    stageHue: document.querySelector('[data-control-stage-hue]'),
    stageLightness: document.querySelector('[data-control-stage-lightness]'),
  };

  const displays = {
    count: document.querySelector('[data-display-count]'),
    minSize: document.querySelector('[data-display-min-size]'),
    maxSize: document.querySelector('[data-display-max-size]'),
    canvasWidth: document.querySelector('[data-display-canvas-width]'),
    canvasHeight: document.querySelector('[data-display-canvas-height]'),
    stageHue: document.querySelector('[data-display-stage-hue]'),
    stageLightness: document.querySelector('[data-display-stage-lightness]'),
  };

  const state = {
    count: parseControlValue(controls.count, defaults.count),
    minSize: parseControlValue(controls.minSize, defaults.minSize),
    maxSize: parseControlValue(controls.maxSize, defaults.maxSize),
    canvasWidth: parseControlValue(controls.canvasWidth, defaults.canvasWidth),
    canvasHeight: parseControlValue(controls.canvasHeight, defaults.canvasHeight),
    stageHue: parseControlValue(controls.stageHue, defaults.stageHue),
    stageLightness: parseControlValue(controls.stageLightness, defaults.stageLightness),
  };

  let isGenerating = false;
  let isCapturing = false;
  let pendingGeneration = false;
  let lastUpdatedControl = null;

  const randomizeDefaultLabel = randomizeButton.textContent.trim();
  const screenshotDefaultLabel = screenshotButton.textContent.trim();

  const controlElements = Object.values(controls).filter(Boolean);

  function parseControlValue(element, fallback) {
    if (!element) {
      return fallback;
    }
    const parsed = Number(element.value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clampFromInput(value, element) {
    if (!element) {
      return value;
    }
    let clamped = value;
    const min = Number(element.min);
    const max = Number(element.max);
    if (Number.isFinite(min)) {
      clamped = Math.max(min, clamped);
    }
    if (Number.isFinite(max)) {
      clamped = Math.min(max, clamped);
    }
    return clamped;
  }

  function normalizeControlValue(element, fallback) {
    const clamped = clampFromInput(parseControlValue(element, fallback), element);
    if (!element) {
      return clamped;
    }

    const step = element.step === 'any' ? NaN : Number(element.step);
    const min = Number(element.min);
    let normalized = clamped;

    if (Number.isFinite(step) && step > 0) {
      const offset = Number.isFinite(min) ? min : 0;
      normalized = Math.round((clamped - offset) / step) * step + offset;
    }

    normalized = Number.isFinite(normalized) ? normalized : fallback;
    element.value = String(normalized);
    return normalized;
  }

  function syncStateFromControls() {
    state.count = Math.max(1, Math.round(normalizeControlValue(controls.count, state.count)));
    state.minSize = Math.round(normalizeControlValue(controls.minSize, state.minSize));
    state.maxSize = Math.round(normalizeControlValue(controls.maxSize, state.maxSize));

    if (state.minSize > state.maxSize) {
      if (lastUpdatedControl === controls.minSize) {
        state.maxSize = state.minSize;
        if (controls.maxSize) {
          controls.maxSize.value = String(state.maxSize);
        }
      } else {
        state.minSize = state.maxSize;
        if (controls.minSize) {
          controls.minSize.value = String(state.minSize);
        }
      }
    }

    state.canvasWidth = Math.round(normalizeControlValue(controls.canvasWidth, state.canvasWidth));
    state.canvasHeight = Math.round(
      normalizeControlValue(controls.canvasHeight, state.canvasHeight),
    );
    state.stageHue = normalizeControlValue(controls.stageHue, state.stageHue);
    state.stageLightness = normalizeControlValue(
      controls.stageLightness,
      state.stageLightness,
    );
  }

  function updateStageStyles() {
    stage.style.setProperty('--joejoe-stage-width', `${state.canvasWidth}px`);
    stage.style.setProperty('--joejoe-stage-height', `${state.canvasHeight}px`);
    const hue = Math.round(state.stageHue);
    const lightness = Math.round(state.stageLightness);
    stage.style.setProperty(
      '--joejoe-stage-bg',
      `hsl(${hue}deg, ${STAGE_SATURATION}%, ${lightness}%)`,
    );
  }

  function updateDisplays() {
    if (displays.count) {
      displays.count.textContent = `${state.count}`;
    }
    if (displays.minSize) {
      displays.minSize.textContent = `${state.minSize}px`;
    }
    if (displays.maxSize) {
      displays.maxSize.textContent = `${state.maxSize}px`;
    }
    if (displays.canvasWidth) {
      displays.canvasWidth.textContent = `${state.canvasWidth}px`;
    }
    if (displays.canvasHeight) {
      displays.canvasHeight.textContent = `${state.canvasHeight}px`;
    }
    if (displays.stageHue) {
      displays.stageHue.textContent = `${Math.round(state.stageHue)} deg`;
    }
    if (displays.stageLightness) {
      displays.stageLightness.textContent = `${Math.round(state.stageLightness)}%`;
    }
  }

  function requestRandomize() {
    if (isGenerating) {
      pendingGeneration = true;
      return;
    }
    randomizeJoejoes();
  }

  function handleControlInput(event) {
    lastUpdatedControl = event.currentTarget;
    syncStateFromControls();
    updateDisplays();
    updateStageStyles();
    requestRandomize();
  }

  if (controlElements.length) {
    controlElements.forEach((element) => {
      element.addEventListener('input', handleControlInput);
    });
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
  }

  function hslToRgb(h, s, l) {
    if (s <= 0) {
      const value = Math.round(l * 255);
      return [value, value, value];
    }

    const hue2rgb = (p, q, t) => {
      let temp = t;
      if (temp < 0) temp += 1;
      if (temp > 1) temp -= 1;
      if (temp < 1 / 6) return p + (q - p) * 6 * temp;
      if (temp < 1 / 2) return q;
      if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function getRelativeLuminance([r, g, b]) {
    const channel = (value) => {
      const scaled = value / 255;
      return scaled <= 0.03928
        ? scaled / 12.92
        : Math.pow((scaled + 0.055) / 1.055, 2.4);
    };
    const [rLin, gLin, bLin] = [r, g, b].map(channel);
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  }

  function buildColorSet() {
    const hue = randomInt(0, 359);
    const saturation = randomRange(72, 95);
    const lightness = randomRange(55, 70);
    const accentLightness = Math.max(28, lightness - randomRange(18, 26));
    const accentSaturation = Math.min(100, saturation + randomRange(0, 6));

    const headColor = `hsl(${hue}deg, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
    const accentColor = `hsl(${hue}deg, ${Math.round(accentSaturation)}%, ${Math.round(
      accentLightness,
    )}%)`;

    const accentRgb = hslToRgb(
      (hue % 360) / 360,
      Math.min(1, Math.max(0, accentSaturation / 100)),
      Math.min(1, Math.max(0, accentLightness / 100)),
    );
    const accentTextColor = getRelativeLuminance(accentRgb) > 0.5 ? '#111' : '#fff';

    return {
      headColor,
      accentColor,
      accentTextColor,
    };
  }

  function createJoejoeElement() {
    const minSize = Math.min(state.minSize, state.maxSize);
    const maxSize = Math.max(state.minSize, state.maxSize);
    const size = randomInt(minSize, maxSize);
    const colors = buildColorSet();
    const joejoe = document.createElement('div');
    joejoe.className = 'joejoe';
    joejoe.style.setProperty('--joejoe-size', `${size}px`);
    joejoe.style.setProperty('--joejoe-skin-color', colors.headColor);
    joejoe.style.setProperty('--joejoe-border-color', BORDER_COLOR);
    const tilt = randomRange(-12, 12);
    joejoe.style.setProperty('--joejoe-head-tilt', `${tilt.toFixed(2)}deg`);

    const pupilRange = size * 0.1 * PUPIL_RANGE_FACTOR;
    const offsetX = randomRange(-pupilRange, pupilRange);
    const offsetY = randomRange(-pupilRange * 0.75, pupilRange * 0.65);
    joejoe.style.setProperty('--pupil-offset-x', `${offsetX.toFixed(2)}px`);
    joejoe.style.setProperty('--pupil-offset-y', `${offsetY.toFixed(2)}px`);

    const head = document.createElement('div');
    head.className = 'head';

    const createEye = (position) => {
      const eye = document.createElement('div');
      eye.className = `eye ${position}`;
      const pupil = document.createElement('div');
      pupil.className = 'pupil';
      eye.appendChild(pupil);
      return eye;
    };

    const leftEye = createEye('left');
    const rightEye = createEye('right');

    head.append(leftEye, rightEye);
    joejoe.append(head);

    return {
      element: joejoe,
      accentColor: colors.accentColor,
      accentTextColor: colors.accentTextColor,
    };
  }

  function setButtonAccent(color, textColor) {
    document.body.style.setProperty('--joejoe-button-bg', color);
    document.body.style.setProperty('--joejoe-button-text', textColor);
  }

  function randomizeJoejoes() {
    if (isGenerating) {
      pendingGeneration = true;
      return;
    }
    isGenerating = true;

    randomizeButton.disabled = true;
    screenshotButton.disabled = true;
    stage.setAttribute('aria-busy', 'true');
    randomizeButton.textContent = 'Shuffling...';

    requestAnimationFrame(() => {
      const count = Math.max(1, Math.round(state.count));
      const fragment = document.createDocumentFragment();
      let accentApplied = false;

      for (let index = 0; index < count; index += 1) {
        const { element, accentColor, accentTextColor } = createJoejoeElement();
        fragment.appendChild(element);
        if (!accentApplied) {
          setButtonAccent(accentColor, accentTextColor);
          accentApplied = true;
        }
      }

      stage.replaceChildren(fragment);
      if (loadingMessage?.isConnected) {
        loadingMessage.remove();
      }

      randomizeButton.textContent = randomizeDefaultLabel;
      randomizeButton.disabled = false;
      screenshotButton.disabled = false;
      stage.removeAttribute('aria-busy');
      isGenerating = false;

      if (pendingGeneration) {
        pendingGeneration = false;
        randomizeJoejoes();
      }
    });
  }

  async function captureScreenshot() {
    if (isCapturing) return;
    if (typeof window.html2canvas !== 'function') {
      console.error('html2canvas is unavailable.');
      return;
    }

    isCapturing = true;
    screenshotButton.disabled = true;
    screenshotButton.textContent = 'Preparing screenshot...';

    try {
      const canvas = await window.html2canvas(stage, {
        backgroundColor: window.getComputedStyle(document.body).backgroundColor,
        scale: Math.min(2, window.devicePixelRatio || 1.5),
        useCORS: true,
      });

      await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Screenshot capture failed.'));
              return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `joejoe-playground-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            requestAnimationFrame(() => {
              URL.revokeObjectURL(url);
              resolve();
            });
          },
          'image/png',
          0.95,
        );
      });
    } catch (error) {
      console.error('Failed to capture Joejoe screenshot', error);
      window.alert('Sorry, I could not capture the screenshot. Please try again.');
    } finally {
      screenshotButton.textContent = screenshotDefaultLabel;
      screenshotButton.disabled = false;
      isCapturing = false;
    }
  }

  syncStateFromControls();
  updateDisplays();
  updateStageStyles();

  randomizeButton.addEventListener('click', () => {
    lastUpdatedControl = null;
    requestRandomize();
  });
  screenshotButton.addEventListener('click', captureScreenshot);

  randomizeJoejoes();
})();
