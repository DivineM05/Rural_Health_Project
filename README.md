# Rural_Health_Project
For the Rural Health Hackathon

- `app/`: offline iOS/Android app (Expo). Needs a native build; does not run in Expo Go.
- `webapp/`: static page the doctor uses to make the patient setup QR code.

## Requirements (Mac)
- Node.js 20+
- Xcode (from the App Store), opened once to install its components
- For Android: Android Studio (Android SDK + an emulator) and a JDK

## Install
```
cd app
npm install
```

## Run on the iOS simulator
```
cd app
npx expo prebuild --clean
npx expo run:ios
```
Metro starts in the same terminal. Press `r` there to reload after code changes.

## Run on an iPhone
1. Xcode > Settings > Accounts: sign in with your Apple ID (free works).
2. Plug in the iPhone, tap "Trust This Computer".
3. On the iPhone: Settings > Privacy & Security > Developer Mode > on (restarts the phone).
4. Build:
   ```
   cd app
   npx expo prebuild --clean
   npx expo run:ios --device
   ```
   Pick the phone from the list. If signing fails, open `app/ios/app.xcworkspace` in Xcode, Signing & Capabilities > Team = your Apple ID, then run the command again.
5. First launch: on the iPhone, Settings > General > VPN & Device Management > trust your developer profile.

This is a debug build: it loads code from Metro on the Mac, so the phone must be on the same Wi-Fi and Metro must be running.

To test offline (code bundled into the app, no Metro needed):
```
npx expo run:ios --device --configuration Release
```
Rebuild after every code change. With a free Apple ID the app stops opening after 7 days; rebuild to reinstall.

## Run on Android
Enable Developer options (tap Build number 7 times) and USB debugging on the phone, or start an emulator, then:
```
cd app
npx expo prebuild --clean
npx expo run:android --device
```
Add `--variant release` for an offline build.

## Doctor web app (makes the setup QR code)
```
cd webapp
python3 -m http.server 8000
```
Open http://localhost:8000. Search for the patient's location, fill in conditions and checkup schedule, then Generate QR code. Scan it from the app's setup screen while the phone has internet; it downloads the offline map, nearby hospitals and directions.

## Tests
```
cd app
npx tsc --noEmit
npx tsx ../scripts/test-symptom-checker.ts
```

## Rebuild symptom data
```
python3 scripts/build_symptom_data.py
```
