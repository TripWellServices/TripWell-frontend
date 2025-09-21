# Local State Test Flow - Parallel Sandbox

## Overview

This is a parallel test flow to validate a localStorage-first "Hunger Games" routing model. The old `/ → /access → /tripsetup` flow remains unchanged.

## Purpose

- Skip repeated `/whoami` calls and backend hydrations
- Store essential trip/user state in localStorage once, then route instantly
- Only hydrate once on login — if state is missing later, user starts over ("Hunger Games mode")
- Test hub-style routing (TripPlannerReturn, PreTripHub, LiveTripDay, ReflectionHub)

## localStorage Keys

These are saved after successful backend saves in this test flow:

- `userId` — from `/whoami` on login
- `tripId` — from `/tripbase` trip creation
- `tripStatus` — "planning" | "live" | "done"
- `intent` — JSON string (priorities/vibes)
- `anchors` — JSON string (anchor list)
- `itineraryFinal` — boolean or draft object
- `lastDayVisited` — number (for live trips auto-load)

## Routing Stages

UniversalRouter logic:

1. If `!userId` → `/access`
2. If `!tripId` → `/tripsetup`
3. If `tripStatus === "done"` → `/reflectionhub`
4. If `tripStatus === "live"` → `/liveday/:lastDayVisited || 1`
5. If `!itineraryFinal` → `/tripplannerreturn`
6. Else → `/pretrip`

## New Components

### LocalWelcome.jsx
- Entry point for test flow
- Simple welcome with sign up/sign in buttons

### LocalUniversalRouter.jsx
- Implements the localStorage-first routing logic
- Checks localStorage state and routes accordingly

### TripPlannerReturn.jsx
- Hub for picking up where user left off in trip planning
- Options: Set Trip Intent, Pick Anchors, Build Itinerary

### PreTripHub.jsx
- Pre-trip hub for reviewing itinerary and starting trip
- Sets `tripStatus` to "live" and `lastDayVisited` to "1"

### ReflectionHub.jsx
- Congratulates user on completing trip
- Offers reflection options and reset functionality

### LiveDay.jsx
- Simulated live trip day experience
- Updates `lastDayVisited` and handles trip completion

### LocalStateDebug.jsx
- Debug component to view and manage localStorage state
- Useful for testing and troubleshooting

## Modified Components

The following existing components now save to localStorage when backend operations succeed:

- **Access.jsx** - Saves `userId` on successful login
- **TripSetup.jsx** - Saves `tripId` and `userId` on trip creation
- **TripIntentForm.jsx** - Saves `intent` on intent submission
- **AnchorSelect.jsx** - Saves `anchors` on anchor selection
- **TripItineraryBuilder.jsx** - Saves `itineraryFinal` on itinerary save
- **TripLiveDay.jsx** - Saves `lastDayVisited` on day load
- **TripComplete.jsx** - Saves `tripStatus` as "done" on trip completion

## Routes Added

```jsx
<Route path="/localwelcome" element={<LocalWelcome />} />
<Route path="/localrouter" element={<LocalUniversalRouter />} />
<Route path="/pretrip" element={<PreTripHub />} />
<Route path="/reflectionhub" element={<ReflectionHub />} />
<Route path="/liveday/:dayNumber" element={<LiveDay />} />
<Route path="/localdebug" element={<LocalStateDebug />} />
```

## Testing

1. Click "New Local State Test Flow" on the Home page
2. Follow the flow through sign up, trip setup, intent, anchors, etc.
3. Use "Local State Debug" to monitor localStorage state
4. Test routing by navigating directly to `/localrouter`
5. Test "Hunger Games mode" by clearing localStorage and seeing where you get routed

## Implementation Notes

- All reused pages in test flow should `localStorage.setItem()` the relevant keys when backend confirms success
- Do not call `/whoami` in the test flow after login unless we're missing a key
- If key missing → route to start of flow (`/access` or `/tripsetup`)
- Firebase token still required for backend calls
- Test flow is completely separate from production flow
