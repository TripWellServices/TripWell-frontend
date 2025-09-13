# TripWell Navigation Flow Documentation

## ✅ RESOLVED: Clean Routing Flow

### Solution: Single Source of Truth
**Access.jsx** is now the single source of truth for initial routing decisions based on `createOrFind` response.

## Current Entry Points

### 1. Home.jsx
- **Purpose**: Initial app entry point
- **Logic**: 1400ms delay → check Firebase auth → route to `/access`
- **Routes to**: 
  - `/access` (always - let Access.jsx handle the routing)

### 2. Access.jsx  
- **Purpose**: Authentication and user routing based on `createOrFind` response
- **Logic**: After sign-in → call `createOrFind` → route based on `isNewUser` flag
- **Routes to**:
  - `/profilesetup` (if `isNewUser: true` OR incomplete profile)
  - `/localrouter` (if `isNewUser: false` AND complete profile)

### 3. ProfileSetup.jsx
- **Purpose**: Profile completion for new/incomplete users
- **Logic**: No hydration needed - form setup only
- **Routes to**: `/postprofileroleselect` (after profile completion)

### 4. LocalUniversalRouter.jsx
- **Purpose**: Smart routing for users with complete profiles
- **Logic**: Check localStorage data → route to appropriate page
- **Routes to**:
  - `/postprofileroleselect` (if no trip/role)
  - `/tripcomplete` (if trip complete)
  - `/livedayreturner` (if trip started)
  - `/tripintent` (if no trip intent)
  - `/anchorselect` (if no anchors)
  - `/itinerarybuild` (if no itinerary)
  - `/pretriphub` (if itinerary complete but trip not started)

## ✅ Current Clean Flow

```
Home (1400ms) 
  ↓
Access (auth + createOrFind)
  ↓
ProfileSetup (if isNewUser: true) OR LocalUniversalRouter (if isNewUser: false)
```

**Key improvements:**
- **Single API call** (`createOrFind`) determines routing
- **No hydration calls** in ProfileSetup
- **No conflicting routing logic**
- **Clear separation of concerns**

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
