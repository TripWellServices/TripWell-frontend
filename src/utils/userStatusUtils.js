// USER STATUS MANAGEMENT UTILITIES

// User status - double protection system
export const USER_STATUS = {
  NEW: "new",       // New user, needs profile
  ACTIVE: "active"  // Profile complete, ready for trip flow
};

// Update user status in localStorage and backend
export const setUserStatus = async (userStatus) => {
  console.log(`🔄 Setting user status to: ${userStatus}`);
  
  // Update localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  userData.userStatus = userStatus;
  localStorage.setItem("userData", JSON.stringify(userData));
  
  console.log(`💾 Updated localStorage userStatus to: ${userStatus}`);
  
  // Update backend
  try {
    const authConfig = await getAuthConfig();
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/tripwell/user/updateStatus`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authConfig.headers
      },
      body: JSON.stringify({ userStatus })
    });
    console.log(`✅ Backend userStatus updated to: ${userStatus}`);
  } catch (error) {
    console.error(`❌ Failed to update backend userStatus:`, error);
  }
};

// Update profile completion status
export const setProfileStatus = async (profileComplete) => {
  console.log(`🔄 Setting profile status to: ${profileComplete}`);
  
  // Update localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  userData.profileComplete = profileComplete;
  localStorage.setItem("userData", JSON.stringify(userData));
  
  console.log(`💾 Updated localStorage profileComplete to: ${profileComplete}`);
  
  // Update backend
  try {
    const authConfig = await getAuthConfig();
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/tripwell/user/updateProfile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authConfig.headers
      },
      body: JSON.stringify({ profileComplete })
    });
    console.log(`✅ Backend profileComplete updated to: ${profileComplete}`);
  } catch (error) {
    console.error(`❌ Failed to update backend profileComplete:`, error);
  }
};

// Get current user status from localStorage
export const getUserStatus = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  return {
    userStatus: userData.userStatus || USER_STATUS.NEW,
    profileComplete: userData.profileComplete || false
  };
};

// Import getAuthConfig (assuming it exists)
import { getAuthConfig } from './authUtils';
