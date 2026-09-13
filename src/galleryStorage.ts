const storageKey = 'ionic-photo-gallery';

export type GalleryPhoto = {
  id: string;
  title: string;
  url: string;
  createdAt: number;
};

function readPhotos(): GalleryPhoto[] {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as GalleryPhoto[];
  } catch {
    localStorage.removeItem(storageKey);
    return [];
  }
}

function writePhotos(photos: GalleryPhoto[]) {
  localStorage.setItem(storageKey, JSON.stringify(photos));
}

export async function listPhotos(): Promise<GalleryPhoto[]> {
  return readPhotos().sort((left, right) => right.createdAt - left.createdAt);
}

export async function uploadPhoto(file: File, title: string): Promise<GalleryPhoto> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });

  const photo: GalleryPhoto = {
    id: crypto.randomUUID(),
    title: title.trim() || file.name,
    url,
    createdAt: Date.now()
  };
  writePhotos([photo, ...readPhotos()]);
  return photo;
}

export async function removePhoto(photo: GalleryPhoto): Promise<void> {
  writePhotos(readPhotos().filter((item) => item.id !== photo.id));
}
