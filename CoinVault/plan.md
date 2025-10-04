🧱 Overall Architecture (Firebase-Only Stack)
Layer	Technology	Purpose
Frontend	Expo + React Native + Liquid Glass	Camera, UI, and user experience
Backend	Firebase Cloud Functions	REST API for scanning, identifying, and pricing
Database	Firebase Firestore	User collections, coin data, cached results
Storage	Firebase Storage	Store captured coin images
Auth	Firebase Auth	Sign-in with Google, Apple, or Email
Analytics	Firebase Analytics	Track user interactions and engagement
🔄 Data Flow Overview

User scans a coin → two images (front/back)

Images are uploaded to Firebase Storage

App sends metadata + image URLs to Firebase Function /scanCoin

Backend runs custom identification logic (no Google Cloud):

Uses a local ML model hosted in Storage (TensorFlow.js)

Or a custom database of reference coins with image features

Once identified, backend calls the eBay Browse API for price data

Backend returns { name, year, denomination, priceLow, priceHigh }

App displays result → user can save it to Firestore collection

🧠 Coin Identification (No Google Cloud)

Since you’re not using AutoML or Cloud Vision, here are your best Firebase-compatible approaches:

Option 1️⃣ — Local ML Model in Firebase Storage (Recommended)

Train a TensorFlow or Teachable Machine model (image classifier).

Export to TensorFlow.js format and upload to Firebase Storage.

Your Cloud Function /scanCoin downloads this model on cold start and keeps it in memory.

Uses tfjs-node inside the Function to identify coins based on uploaded images.

Returns the predicted class, confidence, and label (e.g. “US Quarter 1998”).

Pros:

100% Firebase hosted

Customizable

No API cost or rate limits

Option 2️⃣ — Basic Metadata Matching (Fallback or MVP)

If you don’t want ML yet:

Users select country, denomination, and year manually.

App uploads this info to backend.

Backend just uses those details to check price data (via eBay API).

You can later replace manual entry with ML recognition.

💰 Price Check (via eBay)

Use eBay Browse API (no Firebase alternative).
But calls are made from your Firebase Function, not the app — keeping API keys safe.

Workflow:

Backend Function /getPrice receives { coinName, year, denomination }

Builds eBay query (e.g. "US Quarter 1998")

Fetches sold/completed listings

Calculates:

Average sold price

Low and high range

Caches results in Firestore:

/prices/{coinId}:
  - avgPrice
  - lowPrice
  - highPrice
  - lastUpdated


Next time a similar coin is scanned, backend checks cache first to avoid repeated eBay API calls.

🗄️ Firestore Structure
/users/{uid}:
  - name
  - email
  - createdAt

/users/{uid}/coins/{coinId}:
  - name
  - year
  - denomination
  - country
  - imageFrontUrl
  - imageBackUrl
  - avgPrice
  - lowPrice
  - highPrice
  - confidence
  - addedAt

/prices/{coinKey}:
  - avgPrice
  - lowPrice
  - highPrice
  - lastUpdated

⚙️ Cloud Functions Plan
Function	Type	Purpose
uploadCoinImage	Callable	Handles secure image upload to Storage
scanCoin	HTTPS	Runs the local ML model or simple matching logic
getPrice	HTTPS	Fetches live prices from eBay Browse API
saveCoin	Callable	Saves identified coin to Firestore
getUserCoins	Callable	Returns user’s saved collection
deleteCoin	Callable	Removes coin from collection
auth.onCreate	Trigger	Initializes Firestore profile for new users
🧩 Example Flow Summary

Scan & Identify

User scans → app uploads images to Storage

App calls scanCoin with URLs

scanCoin:

Loads local TF.js model from Storage

Runs classification

Returns coin label + confidence

Fetch Price
4. App sends coin label → calls getPrice
5. Backend queries eBay Browse API
6. Backend caches and returns pricing info

Save Coin
7. User confirms → app calls saveCoin
8. Function stores it in /users/{uid}/coins

🔐 Security Rules Overview
Firestore Rules

Users can only read/write their own /users/{uid}/coins

/prices readable to everyone (cached public info)

Storage Rules

Only authenticated users can upload to /users/{uid}/images/

Uploaded images must be <5MB

Public read access is denied

Functions Security

All HTTPS functions require Firebase Auth tokens

Validate input schema before processing

🧠 Model Update Strategy

You can retrain your coin classification model anytime.

Replace the file in Firebase Storage (/models/coinModel/model.json).

Functions automatically load the updated model on next cold start.

📊 Analytics & Monitoring

Use Firebase Analytics + Crashlytics to track:

Most scanned coin types

Average scan confidence

Most valuable coins found

Crashes or failed scans

📅 Development Roadmap
Phase	Goal
1. Base Setup	Firebase project, Auth, Firestore, Storage
2. Core UI	Tabs, camera screen, and upload flow
3. Backend MVP	/scanCoin (mocked), /getPrice, /saveCoin
4. Add Local ML	Integrate TensorFlow.js model in Function
5. Firestore Rules	Secure reads/writes
6. Analytics	Add Firebase Analytics events
7. Polish UI	Liquid Glass cards, animations, smooth transitions
8. Testing & EAS Build	TestFlight / Play Store beta release
🪄 Optional Enhancements

Condition grading: Add second model for coin quality (e.g., mint state)

Offline Mode: Cache last model and allow local predictions

Currency conversion: Convert eBay USD values to user’s currency via exchangerates API

Wishlist: Users can track coins they want to find

Share Feature: Share coin value cards on social media

## Progress
Here are the changes already made in this repository (short, factual):

- Implemented native tabs layout using Expo Router's NativeTabs (`app/(tabs)/_layout.tsx`).
- Wired tab icons and haptic press behavior (uses `components/haptic-tab.tsx` and `components/ui/icon-symbol.tsx`).
- Added a custom floating "liquid glass" JS tab bar at `components/native-tabbar.tsx` (kept as a fallback).  
  Note: the app layout currently uses `NativeTabs` so iOS shows the system native glass tab bar.
- Removed excess/commentary text from key files to keep the code concise.
- Ran TypeScript checks (no type errors) and ran the linter; one non-blocking lint warning remains in `components/native-tabbar.tsx`.

If you want those remaining warnings removed I can either install `expo-blur` so the dynamic import resolves or delete the unused fallback `components/native-tabbar.tsx` file.