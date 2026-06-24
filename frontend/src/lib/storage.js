const memoryStorage = new Map();

const fallbackStorage = {
  getItem(key) {
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  },

  setItem(key, value) {
    memoryStorage.set(key, String(value));
  },

  removeItem(key) {
    memoryStorage.delete(key);
  },
};

function getDefaultStorage() {
  if (typeof window === 'undefined') {
    return fallbackStorage;
  }

  try {
    return window.localStorage ?? fallbackStorage;
  } catch (_error) {
    return fallbackStorage;
  }
}

function isStorageLike(storage) {
  return (
    storage &&
    typeof storage.getItem === 'function' &&
    typeof storage.setItem === 'function' &&
    typeof storage.removeItem === 'function'
  );
}

function safeParseJSON(rawValue, fallbackValue) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    return fallbackValue;
  }
}

export function createStorageAdapter(storage = getDefaultStorage()) {
  const available = isStorageLike(storage);

  return {
    isAvailable() {
      return available;
    },

    getRaw(key, fallbackValue = null) {
      if (!available) {
        return fallbackValue;
      }

      return storage.getItem(key) ?? fallbackValue;
    },

    setRaw(key, value) {
      if (!available) {
        return false;
      }

      storage.setItem(key, String(value));
      return true;
    },

    getJSON(key, fallbackValue = null) {
      const rawValue = this.getRaw(key, null);
      return safeParseJSON(rawValue, fallbackValue);
    },

    setJSON(key, value) {
      if (!available) {
        return false;
      }

      storage.setItem(key, JSON.stringify(value));
      return true;
    },

    remove(key) {
      if (!available) {
        return false;
      }

      storage.removeItem(key);
      return true;
    },
  };
}

export const appStorage = createStorageAdapter();
