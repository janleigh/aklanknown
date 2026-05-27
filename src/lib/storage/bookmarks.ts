import * as SecureStore from "expo-secure-store";

const KEY = "aklanknown.bookmarks";
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

async function getAll(): Promise<string[]> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to read bookmarks from SecureStore", e);
    return [];
  }
}

async function saveAll(ids: string[]) {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(ids));
    notifyListeners();
  } catch (e) {
    console.warn("Failed to save bookmarks to SecureStore", e);
  }
}

export async function isBookmarked(id: string): Promise<boolean> {
  const all = await getAll();
  return all.includes(id);
}

export async function addBookmark(id: string): Promise<void> {
  const all = await getAll();
  if (!all.includes(id)) {
    all.push(id);
    await saveAll(all);
  }
}

export async function removeBookmark(id: string): Promise<void> {
  const all = await getAll();
  const next = all.filter((x) => x !== id);
  await saveAll(next);
}

export async function getBookmarkedIds(): Promise<string[]> {
  return getAll();
}

export async function clearBookmarks(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY);
    notifyListeners();
  } catch (e) {
    console.warn("Failed to clear bookmarks", e);
  }
}

export function subscribeBookmarks(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export default {
  getBookmarkedIds,
  isBookmarked,
  addBookmark,
  removeBookmark,
  clearBookmarks,
  subscribeBookmarks,
};
