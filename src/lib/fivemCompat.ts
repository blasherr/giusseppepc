'use client';

/**
 * Compatibilité FiveM CEF
 * Le CEF de FiveM a des limitations avec localStorage, BroadcastChannel, AudioContext, etc.
 */

export function isFiveMCEF(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('citizenfx') || ua.includes('fivem')) {
    return true;
  }

  if ('GetParentResourceName' in window) {
    return true;
  }

  try {
    const testKey = '__fivem_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return false;
  } catch {
    return true;
  }
}

let _isFiveMCached: boolean | null = null;

export function isFiveM(): boolean {
  if (_isFiveMCached === null) {
    _isFiveMCached = isFiveMCEF();
  }
  return _isFiveMCached;
}

/**
 * Storage sécurisé - fallback mémoire pour FiveM
 */
const memoryStorage: Map<string, string> = new Map();

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && !isFiveM()) {
        return localStorage.getItem(key);
      }
    } catch { /* fallback */ }
    return memoryStorage.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && !isFiveM()) {
        localStorage.setItem(key, value);
        return;
      }
    } catch { /* fallback */ }
    memoryStorage.set(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && !isFiveM()) {
        localStorage.removeItem(key);
      }
    } catch { /* ignore */ }
    memoryStorage.delete(key);
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && !isFiveM()) {
        localStorage.clear();
      }
    } catch { /* ignore */ }
    memoryStorage.clear();
  }
};

export function isBroadcastChannelSupported(): boolean {
  if (isFiveM()) return false;
  return typeof window !== 'undefined' && 'BroadcastChannel' in window;
}

export function isAudioContextSupported(): boolean {
  if (isFiveM()) return false;
  return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
}
