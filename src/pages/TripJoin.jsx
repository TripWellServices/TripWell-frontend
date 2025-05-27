const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    setError("You must be logged in to join a trip.");
    return;
  }

  try {
    const idToken = await user.getIdToken();
    const firebaseId = user.uid;

    // Step 1: Join the trip using join code
    const res = await axios.post(
      "/api/trips/join",
      { joinCode, userId: firebaseId },
      {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }
    );

    const tripId = res.data.tripId;

    // ✅ Step 2: Update user with tripId
    await axios.post("/api/usertrip/set", { tripId }, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    // ✅ Step 3: Go to TripWellHub
    navigate(`/trip/${tripId}`);
  } catch (err) {
    console.error(err);
    setError("Trip not found or failed to join.");
  }
};
