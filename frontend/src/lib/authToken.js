const resolveStorage = (storage) => {
  if (storage) {
    return storage;
  }
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
};

const getStoredAuthToken = (storage) => {
  const resolved = resolveStorage(storage);
  if (!resolved) {
    return null;
  }
  return resolved.getItem("authToken");
};

const setStoredAuthToken = (token, storage) => {
  const resolved = resolveStorage(storage);
  if (!resolved) {
    return;
  }
  resolved.setItem("authToken", token);
};

const clearStoredAuthToken = (storage) => {
  const resolved = resolveStorage(storage);
  if (!resolved) {
    return;
  }
  resolved.removeItem("authToken");
};

module.exports = {
  getStoredAuthToken,
  setStoredAuthToken,
  clearStoredAuthToken,
};
