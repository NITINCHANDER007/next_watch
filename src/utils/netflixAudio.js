// Authentic Netflix "Ta-Dum" Sound Synthesizer using Web Audio API
// Created purely with oscillators, gain envelopes, and frequency filters.

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playNetflixTaDum() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // --- First Hit: "Ta" (D2 ~ 73.4 Hz with deep punch) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(73.4, now);
    osc1.frequency.exponentialRampToValueAtTime(36.7, now + 0.35);

    // Filter to give it that deep cinematic sub-bass feel
    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(280, now);
    filter1.frequency.linearRampToValueAtTime(100, now + 0.35);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.7, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);

    // --- Second Hit: "DUMMM" (The massive iconic sustained bass + chord) ---
    const hit2Time = now + 0.18;

    // 1. Fundamental sub-bass
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(65.4, hit2Time); // C2
    subOsc.frequency.linearRampToValueAtTime(45.0, hit2Time + 2.0);

    subGain.gain.setValueAtTime(0, hit2Time);
    subGain.gain.linearRampToValueAtTime(0.9, hit2Time + 0.05);
    subGain.gain.exponentialRampToValueAtTime(0.001, hit2Time + 2.2);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(hit2Time);
    subOsc.stop(hit2Time + 2.3);

    // 2. Mid harmonic swell
    const midOsc = ctx.createOscillator();
    const midGain = ctx.createGain();
    midOsc.type = 'sine';
    midOsc.frequency.setValueAtTime(130.8, hit2Time); // C3
    midGain.gain.setValueAtTime(0, hit2Time);
    midGain.gain.linearRampToValueAtTime(0.5, hit2Time + 0.06);
    midGain.gain.exponentialRampToValueAtTime(0.001, hit2Time + 1.8);

    midOsc.connect(midGain);
    midGain.connect(ctx.destination);
    midOsc.start(hit2Time);
    midOsc.stop(hit2Time + 1.9);

    // 3. Metallic/Anvil shimmer (White noise + bandpass filter)
    const bufferSize = ctx.sampleRate * 1.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200, hit2Time);
    noiseFilter.Q.setValueAtTime(3.0, hit2Time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, hit2Time);
    noiseGain.gain.linearRampToValueAtTime(0.18, hit2Time + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, hit2Time + 1.5);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(hit2Time);
    whiteNoise.stop(hit2Time + 1.6);
  } catch (err) {
    console.warn('Audio synthesis not supported or blocked:', err);
  }
}
