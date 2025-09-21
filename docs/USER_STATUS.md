# 👤 USER STATUS MANAGEMENT SYSTEM

## **SYSTEMATIC STATUS TRACKING**

### **USER STAGES**
```js
// User progression through the app
const USER_STAGES = {
  NEW_USER: "new_user",           // Just signed up, needs profile
  PROFILE_COMPLETE: "profile_complete",  // Profile done, needs trip
  TRIP_SET: "trip_set",           // Trip created, needs persona
  PERSONA_BUILT: "persona_built", // Persona done, needs meta selection
  META_SELECTED: "meta_selected", // Meta done, needs sample selection
  SAMPLES_SELECTED: "samples_selected", // Samples done, needs itinerary
  ITINERARY_BUILT: "itinerary_built",   // Itinerary done, ready to travel
  TRIP_ACTIVE: "trip_active",     // Currently on trip
  TRIP_COMPLETE: "trip_complete"  // Trip finished
}
```

### **STATUS SETTERS**

#### **setUserStatus(userStage)**
```js
// Updates user's current stage in localStorage and backend
const setUserStatus = (userStage) => {
  // Update localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  userData.userStage = userStage;
  localStorage.setItem("userData", JSON.stringify(userData));
  
  // Update backend
  await fetch(`${BACKEND_URL}/tripwell/user/updateStatus`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userStage })
  });
}
```

#### **setProfileStatus(profileComplete)**
```js
// Updates profile completion status
const setProfileStatus = (profileComplete) => {
  // Update localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  userData.profileComplete = profileComplete;
  localStorage.setItem("userData", JSON.stringify(userData));
  
  // Update backend
  await fetch(`${BACKEND_URL}/tripwell/user/updateProfile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileComplete })
  });
}
```

### **USAGE IN COMPONENTS**

#### **Access.jsx**
```js
// After successful sign in
if (userData.user?.userStatus === "new") {
  setUserStatus("new_user");
  setProfileStatus(false);
  navigate("/profilesetup");
} else {
  // Existing user - LocalUniversalRouter will check status
  navigate("/localrouter");
}
```

#### **ProfileSetup.jsx**
```js
// After profile completion
await setProfileStatus(true);
await setUserStatus("profile_complete");
navigate("/localrouter");
```

#### **TripPersonaForm.jsx**
```js
// After persona creation
await setUserStatus("persona_built");
navigate("/meta-select");
```

#### **LocalUniversalRouter.jsx**
```js
// Route based on user stage
const userStage = userData.userStage;
const profileComplete = userData.profileComplete;

if (!profileComplete) {
  navigate("/profilesetup");
} else if (userStage === "profile_complete") {
  // Show trip creation
} else if (userStage === "trip_set") {
  navigate("/trip-persona");
} else if (userStage === "persona_built") {
  navigate("/meta-select");
} else if (userStage === "meta_selected") {
  navigate("/persona-sample");
} else if (userStage === "samples_selected") {
  navigate("/tripwell/itinerarybuild");
} else if (userStage === "itinerary_built") {
  navigate("/livedayreturner");
}
```

### **BENEFITS**
- ✅ **Clear progression tracking**
- ✅ **Consistent status management**
- ✅ **Easy debugging** - can see exactly where user is
- ✅ **Reliable routing** - based on actual status, not guessing
- ✅ **Backend sync** - status always up to date

---

**🎯 PRINCIPLE: Every major action updates both localStorage and backend status. LocalUniversalRouter routes based on actual status.**
