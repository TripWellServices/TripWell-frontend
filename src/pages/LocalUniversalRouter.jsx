import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LocalUniversalRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const tripId = localStorage.getItem("tripId");
    const tripStatus = localStorage.getItem("tripStatus");
    const itineraryFinal = localStorage.getItem("itineraryFinal");
    const lastDayVisited = localStorage.getItem("lastDayVisited");

    console.log("🔍 LocalUniversalRouter - Checking localStorage:", {
      userId: !!userId,
      tripId: !!tripId,
      tripStatus,
      itineraryFinal: !!itineraryFinal,
      lastDayVisited
    });

    // Route based on localStorage state
    if (!userId) {
      console.log("❌ No userId found, routing to /access");
      return navigate("/access");
    }
    
    if (!tripId) {
      console.log("❌ No tripId found, routing to /tripsetup");
      return navigate("/tripsetup");
    }

    if (tripStatus === "done") {
      console.log("✅ Trip is done, routing to /reflectionhub");
      return navigate("/reflectionhub");
    }
    
    if (tripStatus === "live") {
      const day = lastDayVisited || 1;
      console.log(`✅ Trip is live, routing to /liveday/${day}`);
      return navigate(`/liveday/${day}`);
    }
    
    if (!itineraryFinal) {
      console.log("❌ No final itinerary, routing to /tripplannerreturn");
      return navigate("/tripplannerreturn");
    }

    console.log("✅ All conditions met, routing to /pretrip");
    return navigate("/pretrip");
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-4">
      <div className="animate-pulse">
        <h2 className="text-xl font-semibold text-gray-800">Loading test flow...</h2>
        <p className="text-gray-600">Checking your localStorage state</p>
      </div>
    </div>
  );
}
