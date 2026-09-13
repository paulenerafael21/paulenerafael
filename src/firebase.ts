import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const missingConfig = Object.entries(firebaseConfig).some(([, value]) => !value);
const firebaseApp = missingConfig ? null : initializeApp(firebaseConfig);
const storage = firebaseApp ? getStorage(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

export type GalleryPhoto = {
  id: string;
  title: string;
  url: string;
  storagePath: string;
  createdAt?: number;
};

function requireFirebase() {
  if (!storage || !db) {
    throw new Error('Firebase is not configured. Add the VITE_FIREBASE values to your .env file.');
  }
  return { storage, db };
}

export async function listPhotos(): Promise<GalleryPhoto[]> {
  const { db: firestore } = requireFirebase();
  const snapshot = await getDocs(query(collection(firestore, 'photos'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((photo) => ({ id: photo.id, ...photo.data() })) as GalleryPhoto[];
}

export async function uploadPhoto(file: File, title: string): Promise<GalleryPhoto> {
  const { storage: cloudStorage, db: firestore } = requireFirebase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const storagePath = `photos/${Date.now()}-${safeName}`;
  const fileReference = storageRef(cloudStorage, storagePath);
  await uploadBytes(fileReference, file, { contentType: file.type || 'image/jpeg' });
  const url = await getDownloadURL(fileReference);
  const photo = await addDoc(collection(firestore, 'photos'), {
    title: title.trim() || file.name,
    url,
    storagePath,
    createdAt: serverTimestamp()
  });
  return { id: photo.id, title: title.trim() || file.name, url, storagePath };
}

export async function removePhoto(photo: GalleryPhoto): Promise<void> {
  const { storage: cloudStorage, db: firestore } = requireFirebase();
  await deleteObject(storageRef(cloudStorage, photo.storagePath));
  await deleteDoc(doc(firestore, 'photos', photo.id));
}
