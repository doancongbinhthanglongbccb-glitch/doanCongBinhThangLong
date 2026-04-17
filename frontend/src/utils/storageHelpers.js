const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const clone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const readRaw = (key) => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(key);
};

export const writeStoredJSON = (key, value) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const readStoredJSON = (key, fallbackValue) => {
  const raw = readRaw(key);
  if (!raw) {
    return clone(fallbackValue);
  }

  try {
    return JSON.parse(raw);
  } catch {
    return clone(fallbackValue);
  }
};

export const writeStoredVersionedJSON = (key, value, version) => {
  writeStoredJSON(key, {
    version,
    data: value,
  });
};

const readStoredVersionedValue = (key, fallbackValue, version, expectedType) => {
  const rawValue = readStoredJSON(key, null);
  if (!rawValue || typeof rawValue !== 'object') {
    return clone(fallbackValue);
  }

  if (rawValue.version !== version) {
    return clone(fallbackValue);
  }

  const data = rawValue.data;

  if (expectedType === 'array') {
    return Array.isArray(data) ? data : clone(fallbackValue);
  }

  if (expectedType === 'object') {
    return data && typeof data === 'object' && !Array.isArray(data) ? data : clone(fallbackValue);
  }

  return data ?? clone(fallbackValue);
};

export const readStoredVersionedArray = (key, fallbackValue, version) =>
  readStoredVersionedValue(key, fallbackValue, version, 'array');

export const readStoredVersionedObject = (key, fallbackValue, version) =>
  readStoredVersionedValue(key, fallbackValue, version, 'object');
