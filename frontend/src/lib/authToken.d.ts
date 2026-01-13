export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

declare const authTokenModule: {
  getStoredAuthToken: (storage?: StorageLike) => string | null;
  setStoredAuthToken: (token: string, storage?: StorageLike) => void;
  clearStoredAuthToken: (storage?: StorageLike) => void;
};

export default authTokenModule;
