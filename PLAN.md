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
- On finish: saved to AsyncStorage 'checkupHistory' (lib/checkups.ts). Reset clears it too.
- My Data: green "Info from my doctor" button (/setup-info: location, schedule, conditions) on top, then one blue button per checkup, newest first (/checkup-detail?date=).
- Emergencies: a "Yes" in /emergency saves a record (kind 'emergency', the Yes answer first, then the No answers) to the same history. My Data shows them as red buttons; checkups stay blue.

## Offline map + hospitals
Problem: location is free text. Need a real point, a map that works offline, the 3 nearest hospitals, and driving/walking directions to them.

Design
- Web app: Leaflet map + Nominatim search box (search on button press, per Nominatim policy). Results list -> pick one or tap map / drag pin. QR `location` becomes `{name, latitude, longitude}`.
- Phone, on QR scan (online, at the clinic), a "Downloading map..." screen:
  1. Overpass: hospitals (`amenity=hospital`) within 50 km, keep the 3 nearest by straight-line distance.
  2. OSRM (routing.openstreetmap.de, no key): driving + walking route from home to each hospital, with turn steps + line geometry.
  3. MapLibre offline pack (OpenFreeMap "liberty" vector style, no key) for the box around home + hospitals, zoom 8-15.
  4. Save hospitals + routes to AsyncStorage 'mapData'; save profile last, so a failed download can be retried by scanning again.
- Map tab: MapLibre map, home pin, 3 hospital pins, user GPS dot. List of hospitals (name, distance). Tap one -> Driving / Walking buttons.
- Directions screen: route line on map + step list + distance/time.
  - "From: Home" uses saved route (offline).
  - "From: My location" fetches a live OSRM route from GPS; if the fetch fails, says "Needs internet" and stays on Home.
- Directions screen: green "Open in Apple Maps / Google Maps" button (needs internet in that app). From home passes home as start; from my location lets the map app use GPS.
- Bus dropped (no reliable rural transit data).
- Reset also clears 'mapData' and offline packs.
- Requires dev build (`npx expo run:ios`), not Expo Go.

Steps
1. Web app map search -> new QR format. Test: open webapp, search, pick, QR text has lat/lon.
2. lib/mapData.ts: fetchHospitals, fetchRoute, downloadMap, load/save. Test: call from scan with a known point.
3. Scan flow with download progress + error/retry.
4. Map tab + directions screen.
5. Live GPS route when online.
6. setup-info shows location name.
