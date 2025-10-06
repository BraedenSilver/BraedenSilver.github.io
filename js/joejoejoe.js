(() => {
  const stage = document.querySelector('[data-joejoe-stage]');
  const randomizeButton = document.querySelector('[data-randomize]');
  const screenshotButton = document.querySelector('[data-screenshot]');
  const loadingMessage = document.querySelector('[data-loading-message]');

  if (!stage || !randomizeButton || !screenshotButton) {
    return;
  }

  const config = Object.freeze({
    minCount: 9,
    maxCount: 15,
    minSize: 140,
    maxSize: 340,
    pupilRangeFactor: 0.35,
    borderColor: '#111',
  });

  let isGenerating = false;
  let isCapturing = false;

  const randomizeDefaultLabel = randomizeButton.textContent.trim();
  const screenshotDefaultLabel = screenshotButton.textContent.trim();

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
    const size = randomInt(config.minSize, config.maxSize);
    const colors = buildColorSet();
    const joejoe = document.createElement('div');
    joejoe.className = 'joejoe';
    joejoe.style.setProperty('--joejoe-size', `${size}px`);
    joejoe.style.setProperty('--joejoe-skin-color', colors.headColor);
    joejoe.style.setProperty('--joejoe-border-color', config.borderColor);
    const tilt = randomRange(-12, 12);
    joejoe.style.setProperty('--joejoe-head-tilt', `${tilt.toFixed(2)}deg`);

    const pupilRange = size * 0.1 * config.pupilRangeFactor;
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
    document.body.style.setProperty(
      '--joejoe-button-shadow',
      textColor === '#111' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.35)',
    );
  }

  function randomizeJoejoes() {
    if (isGenerating) return;
    isGenerating = true;

    randomizeButton.disabled = true;
    screenshotButton.disabled = true;
    stage.setAttribute('aria-busy', 'true');
    randomizeButton.textContent = 'Shuffling…';

    requestAnimationFrame(() => {
      const count = randomInt(config.minCount, config.maxCount);
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
    screenshotButton.textContent = 'Preparing screenshot…';

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

  randomizeButton.addEventListener('click', randomizeJoejoes);
  screenshotButton.addEventListener('click', captureScreenshot);

  randomizeJoejoes();
})();
