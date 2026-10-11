import { saveArtwork } from '@/storage/artwork-store';
// Retain the form's boundary while replacing all network uploads with IndexedDB.
export async function uploadArtwork(data: FormData, onProgress: (value: number) => void) {
  onProgress(0);
  const artwork = await saveArtwork(data);
  onProgress(100);
  return artwork;
}
