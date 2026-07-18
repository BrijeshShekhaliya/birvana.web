# Birvana Mobile App - Over-The-Air (OTA) Update Instructions

This guide explains how to release Over-The-Air (OTA) updates to your Birvana mobile application without building or publishing a new AAB file.

---

## 🏗️ How OTA Updates Work in Birvana
Birvana uses **Expo Application Services (EAS) Updates** to deliver instant JavaScript and asset updates to your installed app.
* **Native Runtime Configuration:** The app has the native `production` channel request header baked into its `AndroidManifest.xml`.
* **Runtime Version:** The native code is bound to `runtimeVersion: "1.0.0"` in `app.config.ts`.
* **EAS Configuration:** Any OTA update sent to the `production` or `main` branch will automatically be queried and downloaded by the app when it launches.

---

## 🚀 How to Publish a New OTA Update
Whenever you make a JavaScript, TypeScript, layout, text, color, or styling change in the `mobile-app` directory and want all users to receive the changes instantly:

### Step 1: Open Terminal in the App Folder
Open your terminal (PowerShell or Command Prompt) and navigate to the mobile app project folder:
```bash
cd "D:\Work\Projects\Personal\Project\api provider music\mobile-app"
```

### Step 2: Publish the Update
Run the following commands to publish the updates to your EAS update channels.

1. **Publish to the `main` branch:**
   ```bash
   npx eas-cli update --platform android --branch main --message "release: Describe your changes here" --environment production --non-interactive
   ```

2. **Publish to the `production` branch:**
   ```bash
   npx eas-cli update --platform android --branch production --message "release: Describe your changes here" --environment production --non-interactive
   ```

*(Note: Updating both branches ensures that any build linked to either the `main` or `production` channel updates successfully.)*

---

## ⚠️ Important Rules for OTA Updates

1. **JS-Only Changes:** OTA updates can only update JavaScript files, assets (images/fonts), and React Native logic.
2. **When you MUST build a new AAB/APK:**
   You cannot use OTA updates if you:
   * Install/Uninstall npm packages that contain native Android/iOS code (e.g., packages requiring `npx expo prebuild` or linking native Gradle modules).
   * Modify native code in the `android/` directory (e.g., `AndroidManifest.xml`, `build.gradle`, Java/Kotlin files).
   * Modify the app icon or splash screen assets configured natively.
   * Change the `runtimeVersion` in `app.config.ts`.
   
   If any of the above changes occur, you **must build and upload a new AAB** to the Play Store.

---

## 🔍 How to Test Updates on Your Mobile
1. Make your changes in the code.
2. Publish the update using the EAS commands above.
3. Open the installed app on your phone.
4. Let the app sit on the home screen for **10 to 15 seconds** (the app downloads the update in the background).
5. **Force-close the app** (swipe it away from the recent apps screen).
6. **Open the app again.** The new updates will be active.
