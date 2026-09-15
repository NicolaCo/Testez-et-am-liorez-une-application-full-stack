import { getTestBed } from '@angular/core/testing';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

if (!getTestBed().platform) {
  setupZoneTestEnv();
}

/* global mocks for jsdom */
const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

Object.defineProperty(window, 'localStorage', { value: mock(), configurable: true });
Object.defineProperty(window, 'sessionStorage', { value: mock(), configurable: true });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ['-webkit-appearance'],
  configurable: true,
});

if (!Object.getOwnPropertyDescriptor(document.body.style, 'transform')) {
  Object.defineProperty(document.body.style, 'transform', {
    value: () => {
      return {
        enumerable: true,
        configurable: true,
      };
    },
    configurable: true,
  });
}

/* output shorter and more meaningful Zone error stack traces */
// Error.stackTraceLimit = 2;
