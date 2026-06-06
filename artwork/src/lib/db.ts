import type { Artwork, PortfolioSettings } from "../types";

const DB_NAME = "RtFolioDB";
const DB_VERSION = 1;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("artworks")) {
        db.createObjectStore("artworks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
      }
    };
  });
}

export async function clearDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["artworks", "settings"], "readwrite");
    const artworksStore = transaction.objectStore("artworks");
    const settingsStore = transaction.objectStore("settings");
    
    artworksStore.clear();
    settingsStore.clear();
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getArtworks(): Promise<Artwork[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("artworks", "readonly");
    const store = transaction.objectStore("artworks");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAllArtworks(artworks: Artwork[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("artworks", "readwrite");
    const store = transaction.objectStore("artworks");
    store.clear();
    for (const artwork of artworks) {
      store.put(artwork);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getSettings(): Promise<PortfolioSettings | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readonly");
    const store = transaction.objectStore("settings");
    const request = store.get("portfolioSettings");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSettings(settings: PortfolioSettings): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");
    const request = store.put(settings, "portfolioSettings");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
