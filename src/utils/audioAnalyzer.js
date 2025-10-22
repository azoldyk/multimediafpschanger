/**
 * Audio Waveform Generator
 * Uses Web Audio API to extract and analyze audio data from video files
 */

/**
 * Generate waveform data from video file
 * @param {File} file - Video file object
 * @param {number} samples - Number of waveform samples to generate
 * @returns {Promise<Array>} Array of amplitude values (0-1)
 */
export const generateWaveformData = async (file, samples = 1000) => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get channel data (use first channel for mono, or mix for stereo)
    const rawData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(rawData.length / samples);
    const waveformData = [];

    // Downsample to desired number of samples
    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      let sum = 0;

      // Calculate RMS (Root Mean Square) for this block
      for (let j = 0; j < blockSize; j++) {
        sum += rawData[start + j] ** 2;
      }

      const rms = Math.sqrt(sum / blockSize);
      waveformData.push(rms);
    }

    // Normalize to 0-1 range
    const max = Math.max(...waveformData);
    const normalized = waveformData.map((val) => val / max);

    // Close audio context to free resources
    audioContext.close();

    return normalized;
  } catch (error) {
    console.error('Error generating waveform:', error);
    return Array(samples).fill(0); // Return silent waveform on error
  }
};

/**
 * Generate waveform data from video element's audio
 * Alternative method using MediaElementAudioSourceNode
 */
export const generateWaveformFromVideo = (videoElement, samples = 1000) => {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(videoElement);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const waveformData = [];

      const duration = videoElement.duration;
      const interval = duration / samples;
      let currentSample = 0;

      const extractSample = () => {
        if (currentSample >= samples) {
          audioContext.close();
          resolve(normalizeWaveform(waveformData));
          return;
        }

        videoElement.currentTime = currentSample * interval;

        videoElement.onseeked = () => {
          analyser.getByteTimeDomainData(dataArray);
          const average = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
          waveformData.push(average / 255);
          currentSample++;
          extractSample();
        };
      };

      extractSample();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Normalize waveform data to 0-1 range
 */
const normalizeWaveform = (data) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  if (range === 0) return data.map(() => 0.5);

  return data.map((val) => (val - min) / range);
};

/**
 * Create SVG path from waveform data
 * @param {Array} waveformData - Array of amplitude values (0-1)
 * @param {number} width - SVG width in pixels
 * @param {number} height - SVG height in pixels
 * @returns {string} SVG path string
 */
export const waveformToSVGPath = (waveformData, width, height) => {
  if (!waveformData || waveformData.length === 0) {
    return `M 0 ${height / 2} L ${width} ${height / 2}`;
  }

  const stepX = width / waveformData.length;
  const centerY = height / 2;
  let pathTop = `M 0 ${centerY}`;
  let pathBottom = `L 0 ${centerY}`;

  waveformData.forEach((amplitude, i) => {
    const x = i * stepX;
    const y = amplitude * (height / 2);

    pathTop += ` L ${x} ${centerY - y}`;
    pathBottom = ` L ${x} ${centerY + y}` + pathBottom;
  });

  return pathTop + pathBottom + ' Z';
};

/**
 * Draw waveform on canvas
 */
export const drawWaveformOnCanvas = (ctx, waveformData, width, height, color) => {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;

  const stepX = width / waveformData.length;
  const centerY = height / 2;

  ctx.beginPath();
  ctx.moveTo(0, centerY);

  // Draw top half
  waveformData.forEach((amplitude, i) => {
    const x = i * stepX;
    const y = centerY - amplitude * (height / 2);
    ctx.lineTo(x, y);
  });

  // Draw bottom half
  for (let i = waveformData.length - 1; i >= 0; i--) {
    const x = i * stepX;
    const y = centerY + waveformData[i] * (height / 2);
    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();
};

/**
 * Get audio duration from file
 */
export const getAudioDuration = (file) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);

    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    };

    audio.onerror = reject;
  });
};
