export const localStorage = {
  getItem(key: string) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      // Either storage limit reached or Third Party Context in Chrome Incognito mode.
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      // Either storage limit reached or Third Party Context in Chrome Incognito mode.
      return;
    }
  },
};
