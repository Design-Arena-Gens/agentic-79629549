## Yatra Ledger &mdash; India travel-expense tracker

Yatra Ledger is a travel-focused expense dashboard tailored for India trips. Trips sync to Firebase (Firestore + Storage) with offline caching, budget alerts, geotagged expenses, map insights, reminder nudges, and analytics tuned for real-world itineraries across the subcontinent.

### ✨ Highlights

- Manage multiple trips with live Firestore sync and offline persistence (`persistentSingleTab` cache).
- Fast expense capture with INR-first UX, GPS or manual locations, note taking, and receipt uploads to Firebase Storage.
- Category and daily spend analytics powered by Recharts, plus a map view (Leaflet + OSM) to visualise your rupee trail.
- Budget guardrails with gradient alerting and configurable reminders (local Notification API + Firestore sync).
- Minimal glassmorphism UI with dynamic gradients optimised for mobile and desktop travellers.

## 1. Configuration

Create a `.env.local` file in the project root with your Firebase project settings:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

All keys are read on the client; avoid committing this file. When deploying to Vercel, add the same values through the dashboard or via `vercel env`.

### Firestore security rules

Restrict reads/writes so only authenticated users can access their own data:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /trips/{tripId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        match /expenses/{expenseId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}
```

### Storage rules

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/trips/{tripId}/receipts/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Publish the rules with the Firebase CLI (`firebase deploy --only firestore:rules,storage:rules`).

## 2. Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Sign in with Google when prompted; trips and expenses are stored under `users/{uid}` in Firestore.

## 3. Firebase setup checklist

1. Enable **Authentication → Google provider**.
2. Enable **Firestore** and switch to production rules above.
3. Enable **Storage** using the rules above.
4. (Optional) In Firestore settings, keep `Enable offline persistence` checked for maximum offline reliability.

## 4. Deployment to Vercel

Ensure `VERCEL_TOKEN` is available, then from the project root:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-79629549
```

Add the Firebase environment variables to the Vercel project before deploying. After deployment, verify with:

```bash
curl https://agentic-79629549.vercel.app
```

## 5. Tech stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Firebase Web SDK (Auth, Firestore, Storage with persistent caching)
- React Leaflet + OpenStreetMap tiles for geo visualisation
- Recharts for analytics
- React Hot Toast for inline feedback

Happy travels and mindful spending! ✈️🛕🌶️
