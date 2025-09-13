# TripWell User Flow

## New User Flow (First Time)
1. **Access.jsx** → User signs in with Google
2. **ProfileSetup.jsx** → User completes profile (firstName, lastName, etc.)
3. **PostProfileRoleSelect.jsx** → User selects role (planner/participant)
4. **Trip Creation** → User creates or joins a trip
5. **LocalUniversalRouter.jsx** → Routes to appropriate dashboard

## Returning User Flow (Already Has Profile)
1. **Access.jsx** → User signs in with Google
2. **LocalUniversalRouter.jsx** → Routes based on existing data:
   - Has trip → Trip dashboard
   - No trip → Trip creation/join
   - Incomplete profile → ProfileSetup.jsx

## Key Rules
- **LocalRouter is ONLY for returning users** who already have complete profiles
- **New users NEVER go to LocalRouter** - they go through the full onboarding flow
- **ProfileSetup → PostProfileRoleSelect → Trip Creation** is the correct new user flow
- **Access.jsx** is the entry point that determines which flow to use

## Routing Logic (Access.jsx Simple Fork)
```javascript
// In Access.jsx - SIMPLE FORK
if (profileComplete) {
  // ✅ Has profile → LocalRouter (handles smart routing)
  navigate("/localrouter");
} else {
  // ❌ No profile → ProfileSetup
  navigate("/profilesetup");
}
```

## Key Rules
- **Access.jsx** = Simple fork: Profile or no profile
- **LocalRouter** = Smart routing for users with profiles
- **ProfileSetup** = Only for users without profiles
- **No complex logic in Access.jsx** - let LocalRouter handle the smart stuff

## Debugging Tips
- Add `console.log("✅ Routing decision based on profileComplete =", profileComplete);`
- Use `await new Promise(r => setTimeout(r, 50));` to prevent race conditions
- Check that `profileComplete` is being set correctly in the backend
