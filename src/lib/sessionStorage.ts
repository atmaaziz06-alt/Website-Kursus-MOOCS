const rememberSessionKey = 'eduspace_remember_session';

const getPreferredStorage = (): Storage =>
  window.localStorage.getItem(rememberSessionKey) === 'false'
    ? window.sessionStorage
    : window.localStorage;

export const authStorage = {
  getItem: async (key: string) => getPreferredStorage().getItem(key),
  setItem: async (key: string, value: string) => getPreferredStorage().setItem(key, value),
  removeItem: async (key: string) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const setRememberSession = (remember: boolean): void => {
  const keys = new Set<string>();
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith('sb-') && key.endsWith('-auth-token')) keys.add(key);
    }
  }

  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  window.localStorage.setItem(rememberSessionKey, String(remember));
  for (const key of keys) {
    const value = other.getItem(key);
    if (value !== null) target.setItem(key, value);
    other.removeItem(key);
  }
};
