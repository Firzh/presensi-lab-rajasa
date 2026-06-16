import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playScanSuccessSound, playScanErrorSound, resetAudioContext } from '../lib/scanSound.js';

describe('scanSound utils', () => {
  let mockContext;
  let mockOscillator;
  let mockGainNode;
  const originalAudioContext = window.AudioContext;

  beforeEach(() => {
    resetAudioContext();
    mockOscillator = {
      type: '',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockContext = {
      state: 'running',
      currentTime: 0,
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
      constructorSpy: vi.fn(),
    };

    window.AudioContext = function() {
      mockContext.constructorSpy();
      return mockContext;
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalAudioContext !== undefined) {
      window.AudioContext = originalAudioContext;
    } else {
      delete window.AudioContext;
    }
    resetAudioContext();
  });

  it('playScanSuccessSound plays without error', () => {
    playScanSuccessSound();
    expect(mockContext.constructorSpy).toHaveBeenCalled();
    expect(mockContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it('playScanErrorSound plays without error', () => {
    playScanErrorSound();
    expect(mockContext.constructorSpy).toHaveBeenCalled(); // audio context is a singleton, but it's re-initialized in the test env if properly reset, actually getAudioContext caches it.
    expect(mockContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it('handles missing AudioContext gracefully', () => {
    delete window.AudioContext;
    delete window.webkitAudioContext;
    expect(() => playScanSuccessSound()).not.toThrow();
  });
});
