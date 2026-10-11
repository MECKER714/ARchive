import type { Artwork } from '@/domain/artwork';
import { samples } from '@/data/samples';
import { validateMetadata, validateModel, validateUsdz } from '@/domain/validation';

type StoredArtwork = Omit<Artwork, 'modelUrl' | 'usdzUrl'> & { model: Blob; usdz?: Blob };
const DATABASE = 'archive-pages-browser-v1';
const STORE = 'artworks';

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error('이 브라우저에서는 작품 저장을 사용할 수 없어요. 기본 작품은 감상할 수 있습니다.')); return; }
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(new Error('브라우저 저장소를 열 수 없어요. 일반 브라우징 모드에서 다시 시도해 주세요.'));
    request.onblocked = () => reject(new Error('다른 ARchive 탭을 닫은 뒤 다시 시도해 주세요.'));
  });
}

async function read<T>(operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const request = operation(transaction.objectStore(STORE));
    transaction.oncomplete = () => { db.close(); resolve(request.result); };
    transaction.onabort = () => { db.close(); reject(new Error('저장한 작품을 읽을 수 없어요. 다시 시도해 주세요.')); };
  });
}

function lease(records: StoredArtwork[]) {
  const urls: string[] = [];
  const artworks = records.map(({ model, usdz, ...meta }) => {
    const modelUrl = URL.createObjectURL(model); urls.push(modelUrl);
    const usdzUrl = usdz ? URL.createObjectURL(usdz) : undefined;
    if (usdzUrl) urls.push(usdzUrl);
    return { ...meta, modelUrl, usdzUrl };
  });
  return { artworks, release: () => urls.forEach(url => URL.revokeObjectURL(url)) };
}

export async function listArtworks() {
  const records = await read<StoredArtwork[]>(store => store.getAll());
  records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const result = lease(records);
  return { ...result, artworks: [...samples, ...result.artworks] };
}

export async function getArtwork(id: string) {
  const sample = samples.find(artwork => artwork.id === id);
  if (sample) return { artwork: sample, release() {} };
  const record = await read<StoredArtwork | undefined>(store => store.get(id));
  if (!record) throw new Error('이 브라우저에 저장된 작품이 없어요. 다른 기기에서 추가한 작품은 보이지 않습니다.');
  const result = lease([record]);
  return { artwork: result.artworks[0], release: result.release };
}

export async function saveArtwork(form: FormData): Promise<{ id: string }> {
  const meta = validateMetadata({ title: form.get('title'), artist: form.get('artist'), description: form.get('description') });
  const model = form.get('model');
  const usdz = form.get('usdz');
  if (!(model instanceof File)) throw new Error('3D 모델을 선택해 주세요.');
  if (usdz !== null && !(usdz instanceof File)) throw new Error('USDZ 파일을 확인해 주세요.');
  if (model.size + (usdz?.size || 0) > 20 * 1024 * 1024) throw new Error('전체 파일은 20MB 이하로 선택해 주세요.');
  const format = await validateModel(model);
  if (usdz) await validateUsdz(usdz);
  const id = String(form.get('uploadId') || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('페이지를 다시 열고 시도해 주세요.');
  const record: StoredArtwork = {
    id, ...meta, format, category: '이 브라우저의 작품', size: model.size,
    createdAt: new Date().toISOString(), model, ...(usdz ? { usdz } : {}),
  };
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(record);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onabort = () => {
      db.close();
      reject(new Error(transaction.error?.name === 'QuotaExceededError'
        ? '브라우저 저장 공간이 부족해요. 파일을 줄이거나 기기 공간을 확보해 주세요.'
        : '작품을 저장하지 못했어요. 입력한 내용을 유지한 채 다시 시도해 주세요.'));
    };
  });
  return { id };
}
