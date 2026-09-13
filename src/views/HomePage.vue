<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonPage, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/vue';
import { trashOutline } from 'ionicons/icons';
import { listPhotos, removePhoto, uploadPhoto, type GalleryPhoto } from '../galleryStorage';

const photos = ref<GalleryPhoto[]>([]);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(true);
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
  if (selectedFile.value) addPhoto();
}

async function addPhoto() {
  if (!selectedFile.value) { errorMessage.value = 'Choose an image first.'; return; }
  if (!selectedFile.value.type.startsWith('image/')) { errorMessage.value = 'Only image files are allowed.'; return; }
  errorMessage.value = '';
  try {
    const photo = await uploadPhoto(selectedFile.value, selectedFile.value.name);
    photos.value.unshift(photo);
    selectedFile.value = null;
    message.value = 'Photo added to your gallery.';
    if (fileInput.value) fileInput.value.value = '';
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Upload failed.'; }
}

function takePicture() { fileInput.value?.click(); }

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
    <IonHeader><IonToolbar><IonTitle>My Photo Gallery</IonTitle></IonToolbar></IonHeader>
    <IonContent :fullscreen="true" class="gallery-content">
      <main class="gallery-shell">
        <IonCard class="camera-card"><IonCardContent>
          <h2>Camera</h2>
          <IonButton expand="block" class="camera-button" @click="takePicture">Take Picture</IonButton>
          <input ref="fileInput" class="hidden-input" type="file" accept="image/*" capture="environment" @change="chooseFile" />
          <IonText v-if="message" color="success"><p class="status">{{ message }}</p></IonText><IonText v-if="errorMessage" color="danger"><p class="status">{{ errorMessage }}</p></IonText>
        </IonCardContent></IonCard>
        <section class="gallery-section"><h2>Photo Gallery</h2>
          <div v-if="loading" class="empty-state"><IonSpinner name="crescent" /><p>Loading photos...</p></div>
          <div v-else-if="photos.length" class="photo-grid"><article v-for="photo in photos" :key="photo.id" class="photo-card"><img :src="photo.url" :alt="photo.title" loading="lazy" /><div class="photo-footer"><strong>{{ photo.title }}</strong><IonButton fill="clear" color="danger" aria-label="Delete photo" @click="deletePhoto(photo)"><IonIcon slot="icon-only" :icon="trashOutline" /></IonButton></div></article></div>
          <div v-else class="empty-state"><p>No pictures yet.<br />Take a picture using the camera.</p></div>
        </section>
      </main>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.gallery-content { --background: #f4f5f7; }
.gallery-shell { width: min(100%, 760px); margin: 0 auto; padding: 28px 16px 48px; }
h2 { margin: 0; color: #202124; font-size: 1.45rem; font-weight: 700; }
.camera-card { margin: 0; border-radius: 10px; background: #fff; box-shadow: 0 3px 12px rgba(0, 0, 0, .08); }
.camera-card ion-card-content { padding: 18px; }
.camera-button { --background: #0b5bd3; --border-radius: 8px; margin: 18px 0 0; height: 44px; font-weight: 600; text-transform: none; }
.hidden-input { display: none; }
.status { margin: 12px 0 0; font-size: .85rem; }
.gallery-section { padding: 28px 4px 0; }
.photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; }
.photo-card { overflow: hidden; border-radius: 10px; background: #fffdf9; box-shadow: 0 8px 22px rgba(83, 65, 42, .1); }
.photo-card img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.photo-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 8px 8px 14px; color: #173f4f; }
.photo-footer strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty-state { display: grid; min-height: 150px; place-items: center; color: #69707a; text-align: center; }
@media (max-width: 520px) { .gallery-shell { padding-top: 22px; } .camera-card ion-card-content { padding: 16px; } }
</style>
