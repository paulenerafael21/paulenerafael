# Ionic Firebase Photo Gallery

A mobile photo gallery built with Ionic Framework, Vue 3, Firebase Firestore, and Firebase Cloud Storage.

## Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com/.
2. Register a Web app and copy its configuration values.
3. Enable **Firestore Database** and **Storage**.
4. Copy `.env.example` to `.env` and replace every `your-...` value with your Firebase values.
5. For classroom testing, configure Firestore and Storage rules according to your instructor's requirements.

The `.env` file is ignored by Git and must not be committed.

## Run locally

Install Node.js 24 or newer, then run:

```powershell
npm install
npm run dev
```

## Android APK build

After installing the Capacitor Android platform and generating the native project:

```powershell
npm install
npm run build
npx cap add android
npx cap sync android
```

Push the project to GitHub. The workflow in `.github/workflows/build-apk.yml` builds a debug APK and publishes it as the `IonicCalculator-APK` artifact.
