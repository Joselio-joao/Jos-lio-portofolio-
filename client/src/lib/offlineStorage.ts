// Storage architecture: IndexedDB for tracker data, OPFS for optional large files, and Storage Manager for quota.

const DATABASE_NAME = "joselio-super-tracker";
const DATABASE_VERSION = 1;
const DATA_STORE = "app-data";
const TRACKER_KEY = "tracker-data";
const FILE_METADATA_KEY = "opfs-file-metadata";
const LEGACY_KEY = "joselio-super-tracker-v1";

type DataRecord<T> = {
  key: string;
  value: T;
  updatedAt: number;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB não está disponível neste navegador."));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DATA_STORE)) {
        database.createObjectStore(DATA_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir o armazenamento local."));
  });
}

function readRecord<T>(database: IDBDatabase, key: string): Promise<DataRecord<T> | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DATA_STORE, "readonly");
    const request = transaction.objectStore(DATA_STORE).get(key);
    request.onsuccess = () => resolve(request.result as DataRecord<T> | undefined);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível ler os dados locais."));
  });
}

function writeRecord<T>(database: IDBDatabase, record: DataRecord<T>): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DATA_STORE, "readwrite");
    transaction.objectStore(DATA_STORE).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Não foi possível guardar os dados locais."));
  });
}

export function mergeLegacyTrackerData<T>(fallback: T, legacyValue: string | null): T {
  if (!legacyValue) return fallback;
  try {
    return { ...fallback, ...JSON.parse(legacyValue) };
  } catch {
    return fallback;
  }
}

export async function loadTrackerData<T>(fallback: T): Promise<T> {
  try {
    const database = await openDatabase();
    const stored = await readRecord<T>(database, TRACKER_KEY);
    if (stored?.value) {
      database.close();
      return stored.value;
    }

    const legacyValue = typeof localStorage !== "undefined" ? localStorage.getItem(LEGACY_KEY) : null;
    const migrated = mergeLegacyTrackerData(fallback, legacyValue);
    if (legacyValue && migrated === fallback && typeof localStorage !== "undefined") localStorage.removeItem(LEGACY_KEY);

    await writeRecord(database, { key: TRACKER_KEY, value: migrated, updatedAt: Date.now() });
    database.close();
    return migrated;
  } catch {
    // Keep the tracker usable in browsers where IndexedDB is unavailable or blocked.
    const legacyValue = typeof localStorage !== "undefined" ? localStorage.getItem(LEGACY_KEY) : null;
    return mergeLegacyTrackerData(fallback, legacyValue);
  }
}

export async function saveTrackerData<T>(value: T): Promise<void> {
  const database = await openDatabase();
  await writeRecord(database, { key: TRACKER_KEY, value, updatedAt: Date.now() });
  database.close();
}

export async function clearStoredTrackerData(): Promise<void> {
  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(DATA_STORE, "readwrite");
      transaction.objectStore(DATA_STORE).delete(TRACKER_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Não foi possível limpar os dados."));
    });
    database.close();
  } finally {
    if (typeof localStorage !== "undefined") localStorage.removeItem(LEGACY_KEY);
  }
}

export type StorageEstimate = {
  usage: number;
  quota: number;
  usageLabel: string;
  quotaLabel: string;
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export async function estimateStorage(): Promise<StorageEstimate> {
  const estimate = await navigator.storage?.estimate?.();
  const usage = estimate?.usage ?? 0;
  const quota = estimate?.quota ?? 0;
  return { usage, quota, usageLabel: formatBytes(usage), quotaLabel: quota ? formatBytes(quota) : "indisponível" };
}

export async function saveLargeFile(fileName: string, contents: Blob | ArrayBuffer): Promise<boolean> {
  const storage = navigator.storage as unknown as { getDirectory?: () => Promise<FileSystemDirectoryHandle> };
  if (!storage.getDirectory) return false;
  const root = await storage.getDirectory();
  const handle = await root.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(contents);
  await writable.close();
  return true;
}

export async function removeLargeFile(fileName: string): Promise<boolean> {
  const storage = navigator.storage as unknown as { getDirectory?: () => Promise<FileSystemDirectoryHandle> };
  if (!storage.getDirectory) return false;
  const root = await storage.getDirectory();
  await root.removeEntry(fileName);
  return true;
}

export type StoredFileMetadata = { name: string; size: number; type: string; updatedAt: number };

export async function loadLargeFileMetadata(): Promise<StoredFileMetadata[]> {
  try {
    const database = await openDatabase();
    const record = await readRecord<StoredFileMetadata[]>(database, FILE_METADATA_KEY);
    database.close();
    return record?.value ?? [];
  } catch {
    return [];
  }
}

export async function saveLargeFileMetadata(files: StoredFileMetadata[]): Promise<void> {
  const database = await openDatabase();
  await writeRecord(database, { key: FILE_METADATA_KEY, value: files, updatedAt: Date.now() });
  database.close();
}

export { DATA_STORE, DATABASE_NAME, TRACKER_KEY, FILE_METADATA_KEY };
