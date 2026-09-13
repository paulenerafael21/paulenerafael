# Ionic Local Photo Gallery

A mobile photo gallery built with Ionic Framework and Vue 3. Photos are stored locally on the device.

Photos are saved in the app's local browser/WebView storage. No Firebase account or internet connection is required.

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
