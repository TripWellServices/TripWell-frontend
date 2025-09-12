# TripWell Navigation Flow Documentation

## Current Flow Issues

### Problem: Conflicting Routing Logic
We have **two different components** making routing decisions about profile completion:

1. **Access.jsx** - Routes users based on profile completion
2. **LocalUniversalRouter.jsx** - Also checks profile completion and routes back

This creates a "yank back" effect where users get routed forward, then yanked back to ProfileSetup.

## Current Entry Points

### 1. Home.jsx
- **Purpose**: Initial app entry point
- **Logic**: 1400ms delay → check Firebase auth → route to `/localrouter` or `/access`
- **Routes to**: 
  - `/localrouter` (if authenticated)
  - `/access` (if not authenticated)

### 2. Access.jsx  
- **Purpose**: Authentication and initial user routing
- **Logic**: After sign-in → check user data → route based on profile completion
- **Routes to**:
  - `/profilesetup` (new users or incomplete profile)
  - `/localrouter` (existing users with complete profile)
  - `/hydratelocal` (existing users with complete profile - legacy path)

### 3. LocalUniversalRouter.jsx
- **Purpose**: Central routing logic for authenticated users
- **Logic**: Check localStorage data → route to appropriate page
- **Routes to**:
  - `/profilesetup` (if profile not complete) ⚠️ **CONFLICT**
  - `/postprofileroleselect` (if no trip/role)
  - `/tripcomplete` (if trip complete)
  - `/livedayreturner` (if trip started)
  - `/tripintent` (if no trip intent)
  - `/anchorselect` (if no anchors)
  - `/itinerarybuild` (if no itinerary)
  - `/pretriphub` (if itinerary complete but trip not started)

### 4. HydrateLocal.jsx
- **Purpose**: Simple loading screen (800ms) → auto-navigate to `/localrouter`
- **Routes to**: `/localrouter`

## The Problem

**Access.jsx** and **LocalUniversalRouter.jsx** are both checking profile completion and making routing decisions. This creates:

1. User signs in → Access.jsx routes to `/localrouter`
2. LocalUniversalRouter.jsx loads → checks profile → routes back to `/profilesetup`
3. User experiences "yank back" effect

## Proposed Solution

### Option 1: Remove Profile Check from LocalUniversalRouter
- **Access.jsx** handles all profile completion routing
- **LocalUniversalRouter.jsx** assumes profile is complete (since Access.jsx already filtered)
- **Benefit**: Single source of truth for profile routing

### Option 2: Remove Profile Check from Access.jsx  
- **Access.jsx** always routes to `/localrouter`
- **LocalUniversalRouter.jsx** handles all routing logic including profile
- **Benefit**: Centralized routing logic

### Option 3: Create Clear Separation
- **Access.jsx**: Only handles authentication and initial user creation
- **ProfileRouter.jsx**: New component that handles profile completion routing
- **LocalUniversalRouter.jsx**: Only handles post-profile routing logic

## Recommended Flow

```
Home (1400ms) 
  ↓
Access (auth + user creation)
  ↓
ProfileRouter (profile completion check)
  ↓
LocalUniversalRouter (trip flow routing)
```

## Current Routes That Navigate to LocalUniversalRouter

1. **Home.jsx** - Line 24: `navigate("/localrouter")`
2. **Access.jsx** - Line 172: `navigate("/localrouter")`  
3. **HydrateLocal.jsx** - Line 12: `navigate("/localrouter")`
4. **LocalStateDebug.jsx** - Line 102: `navigate("/localrouter")`
5. **HydrateTest.jsx** - Line 88: `navigate("/localrouter")`
6. **HomeArchive.jsx** - Line 39: `navigate("/localrouter")`

## Current Routes That Navigate to ProfileSetup

1. **Access.jsx** - Lines 65, 83, 88, 125, 175: `navigate("/profilesetup")`
2. **PreTripSetup.jsx** - Line 21: `navigate("/profilesetup")`
3. **LocalUniversalRouter.jsx** - Line 276: `navigate("/profilesetup")` ⚠️ **CONFLICT**

## Next Steps

1. **Immediate Fix**: Remove profile completion check from LocalUniversalRouter.jsx
2. **Long-term**: Create clear separation of concerns between components
3. **Documentation**: Update this file as changes are made
