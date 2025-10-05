// Use legacy shim to avoid runtime error in SDK 54 while keeping simple API
import * as FileSystem from 'expo-file-system/legacy';

export type CollectedCoin = {
  id: string;
  title: string;
  avg?: number | null;
  image?: string;
  addedAt: number;
};

const COLLECTION_FILE = FileSystem.documentDirectory + 'collection.json';

async function readCollectionFile(): Promise<CollectedCoin[]> {
  try {
    const exists = await FileSystem.getInfoAsync(COLLECTION_FILE);
    if (!exists.exists) return [];
    const raw = await FileSystem.readAsStringAsync(COLLECTION_FILE);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCollectionFile(items: CollectedCoin[]): Promise<void> {
  await FileSystem.writeAsStringAsync(COLLECTION_FILE, JSON.stringify(items));
}

export async function getCollection(): Promise<CollectedCoin[]> {
  return await readCollectionFile();
}

export async function addToCollection(item: Omit<CollectedCoin, 'id' | 'addedAt'>): Promise<CollectedCoin> {
  const items = await readCollectionFile();
  const entry: CollectedCoin = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: item.title,
    avg: item.avg,
    image: item.image,
    addedAt: Date.now(),
  };
  items.unshift(entry);
  await writeCollectionFile(items);
  return entry;
}

export async function removeFromCollection(id: string): Promise<void> {
  const items = await readCollectionFile();
  const next = items.filter((i) => i.id !== id);
  await writeCollectionFile(next);
}


