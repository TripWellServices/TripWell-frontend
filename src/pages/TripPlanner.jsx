const handleNext = async () => {
  try {
    const token = await auth.currentUser.getIdToken(true);
    const userId = auth.currentUser.uid;

    if (!trip || !trip._id || !userId) {
      console.error("Missing trip or userId!");
      return;
    }

    await fetch(`https://gofastbackend.onrender.com/tripwell/tripplanner/${trip._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        priorities,
        vibes,
        mobility,
        budget,
        travelPace,
      }),
    });

    console.log("Trip intent saved!", trip);

    // 🛠️ Added buffer to ensure trip._id is stable
    setTimeout(() => {
      if (trip && trip._id) {
        navigate(`/tripwell/${trip._id}/anchors`);
      } else {
        console.warn("Trip ID missing, not navigating");
      }
    }, 100);
  } catch (err) {
    console.error("Intent save failed", err);
  }
};
