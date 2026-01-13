const test = require("node:test");
const assert = require("node:assert/strict");
const authTokenModule = require("../src/lib/authToken");

const createStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
};

test("auth token helper uses provided storage", () => {
  const storage = createStorage();
  authTokenModule.setStoredAuthToken("token-123", storage);
  assert.equal(authTokenModule.getStoredAuthToken(storage), "token-123");
  authTokenModule.clearStoredAuthToken(storage);
  assert.equal(authTokenModule.getStoredAuthToken(storage), null);
});

test("auth token helper returns null without storage on server", () => {
  assert.equal(authTokenModule.getStoredAuthToken(), null);
});
