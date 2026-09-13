# Ionic Calculator

A mobile calculator built with Ionic Framework, Vue 3, and Capacitor 8.

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
