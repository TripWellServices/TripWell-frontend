# 🚪 GATEKEEPER ARCHITECTURE

## 🚨 CRITICAL RULE: NEVER MODIFY ACCESS.JSX WITHOUT EXPLICIT USER APPROVAL

**BACKEND IS SOURCE OF TRUTH FOR USER STATUS**
- Backend sets `userStatus: "new"` for new users in database
- Backend sets `profileComplete: false` for new users in database
- Frontend reads these values from backend via `hydrateRoute`
- No need for complex localStorage merging - backend is authoritative

## **CLEAR SEPARATION OF CONCERNS**

### **🏠 HOME.JSX - AUTH ONLY**
- **ONLY** checks Firebase auth state
- **ONLY** routes: authenticated → `/localrouter`, not authenticated → `/access`
- **NO** user data logic, **NO** profile checks, **NO** business logic
- **SIMPLE**: `onAuthStateChanged` → route

```js
// HOME.JSX - DEAD SIMPLE
if (user) {
  navigate("/localrouter");
} else {
  navigate("/access");
}
```

### **🔐 ACCESS.JSX - SIGN IN + BASIC HYDRATION**
- **ONLY** handles Firebase authentication
- **ONLY** calls backend `createOrFind` 
- **BASIC HYDRATION**: Sets user status in localStorage
- **ONLY** routes binary: new user → `/profilesetup`, existing user → `/localrouter`
- **SIMPLE**: Firebase auth → backend call → set status → binary route

```js
// ACCESS.JSX - DEAD SIMPLE
if (userData.user?.userStatus === "new") {
  userData.user.userStatus = "new";
  userData.user.profileComplete = false;
} else {
  userData.user.userStatus = "active";
  userData.user.profileComplete = true;
}
localStorage.setItem("userData", JSON.stringify(userData.user));

if (userData.user?.userStatus === "new") {
  navigate("/profilesetup");
} else {
  navigate("/localrouter");
}
```

### **🎯 LOCALUNIVERSALROUTER.JSX - THE MEGA ROUTER**
- **EVERYTHING** happens here:
  - **DOUBLE PROTECTION**: Check both `userStatus` and `profileComplete`
  - Profile completion checks
  - Trip data validation
  - Persona data validation
  - Meta selections validation
  - Sample selections validation
  - Itinerary data validation
  - All routing decisions
  - All localStorage management
  - All hydration logic

```js
// LOCALUNIVERSALROUTER.JSX - DOUBLE PROTECTION ROUTING
const { userStatus, profileComplete } = userData;

// Double protection: if user is "new" OR profile incomplete → ProfileSetup
if (userStatus === "new" || !profileComplete) {
  navigate("/profilesetup");
  return;
}

// User is "active" with complete profile → continue with trip flow
if (!tripData) {
  // Show trip creation
} else if (!tripPersonaData) {
  navigate("/trip-persona");
} else if (!selectedMetas.length) {
  navigate("/meta-select");
} else if (!selectedSamples.length) {
  navigate("/persona-sample");
} else if (!itineraryData) {
  navigate("/tripwell/itinerarybuild");
} else {
  navigate("/livedayreturner");
}
```

## **STATUS SYSTEM - DOUBLE PROTECTION**

### **USER STATUS VALUES:**
- `userStatus: "new"` → New user, needs profile
- `userStatus: "active"` → Profile complete, ready for trip flow

### **PROFILE COMPLETION:**
- `profileComplete: false` → Profile incomplete
- `profileComplete: true` → Profile complete

### **DOUBLE PROTECTION ROUTING:**
LocalUniversalRouter checks BOTH flags:
- If `userStatus === "new"` OR `profileComplete === false` → `/profilesetup`
- If `userStatus === "active"` AND `profileComplete === true` → continue with trip flow

This prevents edge cases where one flag might be inconsistent.

---

**🎯 PRINCIPLE: Each component has ONE job, and LocalUniversalRouter is the mega-brain that handles everything else.**
