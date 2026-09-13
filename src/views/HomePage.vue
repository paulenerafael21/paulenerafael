<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/vue';
import { add, cloudUploadOutline, trashOutline } from 'ionicons/icons';
import { listPhotos, removePhoto, uploadPhoto, type GalleryPhoto } from '../firebase';

const photos = ref<GalleryPhoto[]>([]);
const selectedFile = ref<File | null>(null);
const title = ref('');
const loading = ref(true);
const uploading = ref(false);
const message = ref('');
const errorMessage = ref('');

async function refreshPhotos() {
  loading.value = true;
  errorMessage.value = '';
  try { photos.value = await listPhotos(); }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Unable to load photos.'; }
  finally { loading.value = false; }
}

function chooseFile(event: Event) {
  const input = event.target as HTMLInputElement;
  selectedFile.value = input.files?.[0] ?? null;
  message.value = selectedFile.value ? selectedFile.value.name : '';
}

async function addPhoto() {
  if (!selectedFile.value) { errorMessage.value = 'Choose an image first.'; return; }
  if (!selectedFile.value.type.startsWith('image/')) { errorMessage.value = 'Only image files are allowed.'; return; }
  uploading.value = true;
  errorMessage.value = '';
  try {
    const photo = await uploadPhoto(selectedFile.value, title.value);
    photos.value.unshift(photo);
    selectedFile.value = null;
    title.value = '';
    message.value = 'Photo uploaded successfully.';
    const input = document.querySelector<HTMLInputElement>('#photo-file');
    if (input) input.value = '';
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Upload failed.'; }
  finally { uploading.value = false; }
}

async function deletePhoto(photo: GalleryPhoto) {
  if (!window.confirm(`Delete ${photo.title}?`)) return;
  try {
    await removePhoto(photo);
    photos.value = photos.value.filter((item) => item.id !== photo.id);
    message.value = 'Photo deleted.';
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Delete failed.'; }
}

onMounted(refreshPhotos);
</script>

<template>
  <IonPage>
    <IonHeader><IonToolbar color="primary"><IonTitle>My Photo Gallery</IonTitle></IonToolbar></IonHeader>
    <IonContent :fullscreen="true" class="gallery-content">
      <main class="gallery-shell">
        <section class="intro"><p class="eyebrow">Ionic + Firebase</p><h1>Moments worth keeping.</h1><p class="subcopy">Upload your favorite photos and keep them together in one simple gallery.</p></section>
        <IonCard class="upload-card"><IonCardContent>
          <div class="section-heading"><div><p class="eyebrow">Add a memory</p><h2>Upload photo</h2></div><IonIcon :icon="cloudUploadOutline" aria-hidden="true" /></div>
          <IonItem lines="none" class="field"><IonLabel position="stacked">Title</IonLabel><IonInput v-model="title" placeholder="Give this photo a name" /></IonItem>
          <label class="file-picker" for="photo-file"><IonIcon :icon="add" aria-hidden="true" /><span>{{ selectedFile ? selectedFile.name : 'Choose an image' }}</span><input id="photo-file" type="file" accept="image/*" @change="chooseFile" /></label>
          <IonButton expand="block" class="upload-button" :disabled="uploading" @click="addPhoto"><IonSpinner v-if="uploading" name="crescent" /><span v-else>Upload to gallery</span></IonButton>
          <IonText v-if="message" color="success"><p class="status">{{ message }}</p></IonText><IonText v-if="errorMessage" color="danger"><p class="status">{{ errorMessage }}</p></IonText>
        </IonCardContent></IonCard>
        <section class="gallery-section"><div class="section-heading"><div><p class="eyebrow">Your collection</p><h2>Gallery <span v-if="!loading">({{ photos.length }})</span></h2></div></div>
          <div v-if="loading" class="empty-state"><IonSpinner name="crescent" /><p>Loading photos...</p></div>
          <div v-else-if="photos.length" class="photo-grid"><article v-for="photo in photos" :key="photo.id" class="photo-card"><img :src="photo.url" :alt="photo.title" loading="lazy" /><div class="photo-footer"><strong>{{ photo.title }}</strong><IonButton fill="clear" color="danger" aria-label="Delete photo" @click="deletePhoto(photo)"><IonIcon slot="icon-only" :icon="trashOutline" /></IonButton></div></article></div>
          <div v-else class="empty-state"><p>Your gallery is waiting for its first photo.</p></div>
        </section>
      </main>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.gallery-content { --background: #f7f4ed; }
.gallery-shell { width: min(100%, 920px); margin: 0 auto; padding: 32px 18px 48px; }
.intro { padding: 12px 4px 26px; }
.eyebrow { margin: 0 0 8px; color: #bb5b35; font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
h1, h2 { margin: 0; color: #173f4f; font-weight: 800; }
h1 { max-width: 620px; font-size: clamp(2.2rem, 7vw, 4.5rem); line-height: .98; }
h2 { font-size: 1.35rem; }
.subcopy { max-width: 540px; margin: 16px 0 0; color: #52656b; font-size: 1rem; line-height: 1.55; }
.upload-card { margin: 0; border: 1px solid #e6ded0; border-radius: 12px; background: #fffdf9; box-shadow: 0 16px 35px rgba(83, 65, 42, .08); }
.upload-card ion-card-content { padding: 22px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.section-heading .eyebrow { margin-bottom: 5px; }
.section-heading > ion-icon { color: #bb5b35; font-size: 2rem; }
.field { --background: #f7f4ed; --padding-start: 14px; margin-bottom: 12px; border-radius: 8px; }
.file-picker { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 14px; border: 1px dashed #b8a995; border-radius: 8px; color: #52656b; cursor: pointer; }
.file-picker ion-icon { color: #bb5b35; font-size: 1.3rem; }
.file-picker span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-picker input { display: none; }
.upload-button { --background: #173f4f; --border-radius: 8px; margin-top: 14px; height: 48px; font-weight: 700; }
.status { margin: 12px 0 0; font-size: .85rem; }
.gallery-section { padding-top: 36px; }
.photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; }
.photo-card { overflow: hidden; border-radius: 10px; background: #fffdf9; box-shadow: 0 8px 22px rgba(83, 65, 42, .1); }
.photo-card img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.photo-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 8px 8px 14px; color: #173f4f; }
.photo-footer strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty-state { display: grid; min-height: 140px; place-items: center; color: #718096; text-align: center; }
@media (max-width: 520px) { .gallery-shell { padding-top: 22px; } .upload-card ion-card-content { padding: 16px; } }
</style>
