# Plan
Problem: offline iOS/Android app, bottom tab bar, 4 tabs.

Design
- Expo + expo-router, all content bundled (offline by default)
- Tabs: Home (home), "I'm having symptoms" (exclamation), "Checkup" (stethoscope), "Map" (map)
- Home: 3 big buttons -> other tabs, full page names
- Other pages: placeholder content for now

Steps
1. Scaffold blank TypeScript Expo app in ./app
2. Tab layout with icons
3. Home buttons
4. Placeholder pages
5. Run on simulator

Open: map content (offline tiles needed later), page content

## Setup mode
- First launch: setup screen (location text, at-risk condition checklist). Saved to AsyncStorage (offline).
- Profile saved -> setup never shows again. Root Stack.Protected guard on profile existence.
- Reset button (top right, all screens) clears profile -> back to setup. Testing only.
- Files: lib/profile.tsx (context + storage), app/setup.tsx, root layout guard + ResetButton

## QR import
- webapp/index.html: static form (location, conditions) -> QR of JSON {location, conditions}. Vendored qrcode lib, no build.
- App: expo-camera scanner at /scan. Setup screen = "Scan QR code" button only. Doctor page also has "Scan QR code" -> same /scan (imports profile).
- /scan saves profile then router.replace('/').
- Checkup page: "View my data" -> /my-data (shows location, conditions).

## Emergency triage
- Symptoms tab: big red "I think I'm having an emergency" button -> /emergency.
- /emergency: yes/no warning-sign questions one at a time (lib/emergencyQuestions.ts, from ACEP warning signs + AHA stroke/heart-attack signs). Back arrow returns to previous question (or leaves on the first).
- Any "Yes" -> "Get help now" screen. All "No" -> "No emergency warning signs found" + contact clinic if worse.

## Checkup form
- /checkup-form: one question at a time, back arrow, every question has "Skip / I don't know".
- Questions in lib/checkupQuestions.ts: general intake (feeling, height, weight, fever, new problems, pain, medicines, clinic visits, falls, sleep, PHQ-2 mood, activity, tobacco, alcohol) + extra per profile condition.
- Height/weight: Metric/US toggle; US converted to metric with original kept, e.g. "170 cm (5 ft 7 in)".
- On finish: saved to AsyncStorage 'checkupHistory' (lib/checkups.ts). My Data lists past checkups. Reset clears it too.
