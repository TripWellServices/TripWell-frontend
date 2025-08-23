import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

// Progressive navigation state management (same as TripLiveDay)
const getCurrentState = () => {
  return {
    currentDayIndex: parseInt(localStorage.getItem("currentDayIndex") || "1"),
    currentBlockName: localStorage.getItem("currentBlockName") || "morning"
  };
};

const setCurrentState = (dayIndex, blockName) => {
  localStorage.setItem("currentDayIndex", dayIndex.toString());
  localStorage.setItem("currentBlockName", blockName);
};

export default function DayIndexTest() {
  const navigate = useNavigate();
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const traceDayIndex = async () => {
      console.log("🔍 === DAY INDEX DEBUG TRACE ===");
      
      // 1. Check localStorage data
      const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
      const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
      const currentState = getCurrentState();
      
      console.log("📦 localStorage data:", {
        tripData: tripData ? {
          tripId: tripData.tripId,
          tripName: tripData.tripName,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          startedTrip: tripData.startedTrip
        } : null,
        itineraryData: itineraryData ? {
          daysCount: itineraryData.days?.length,
          dayIndexes: itineraryData.days?.map(d => d.dayIndex),
          firstDay: itineraryData.days?.[0],
          lastDay: itineraryData.days?.[itineraryData.days?.length - 1]
        } : null,
        currentState
      });

      // 2. Calculate what day index should be
      const today = new Date();
      const startDate = tripData ? new Date(tripData.startDate) : null;
      const endDate = tripData ? new Date(tripData.endDate) : null;
      
      let calculatedDayIndex = 1;
      let calculationReason = "default";
      
      if (tripData && startDate && endDate) {
        if (today >= startDate && today <= endDate) {
          // Within trip dates
          const diffTime = today.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          calculatedDayIndex = diffDays + 1;
          calculationReason = "within trip dates";
        } else if (today < startDate) {
          // Trip hasn't started
          calculatedDayIndex = 1;
          calculationReason = "trip hasn't started";
        } else {
          // Trip is over
          calculatedDayIndex = itineraryData?.days?.length || 1;
          calculationReason = "trip is over";
        }
      }
      
      console.log("📅 Day index calculation:", {
        today: today.toISOString(),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        calculatedDayIndex,
        calculationReason
      });

      // 3. Check if we should use stored state or calculated
      const shouldUseStored = currentState.currentDayIndex && 
                             currentState.currentDayIndex >= 1 && 
                             currentState.currentDayIndex <= (itineraryData?.days?.length || 1);
      
      const finalDayIndex = shouldUseStored ? currentState.currentDayIndex : calculatedDayIndex;
      
      console.log("🎯 Final day index decision:", {
        shouldUseStored,
        storedIndex: currentState.currentDayIndex,
        calculatedIndex: calculatedDayIndex,
        finalDayIndex,
        reason: shouldUseStored ? "using stored state" : "using calculated state"
      });

      // 4. Try to hydrate from backend if possible
      let backendData = null;
      if (tripData?.tripId && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await axios.get(`${BACKEND_URL}/tripwell/livestatus/${tripData.tripId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          backendData = res.data;
          console.log("🔄 Backend hydration data:", backendData);
        } catch (error) {
          console.log("❌ Backend hydration failed:", error.message);
        }
      }

      setDebugData({
        localStorage: {
          tripData,
          itineraryData,
          currentState
        },
        calculation: {
          today: today.toISOString(),
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          calculatedDayIndex,
          calculationReason
        },
        decision: {
          shouldUseStored,
          storedIndex: currentState.currentDayIndex,
          calculatedIndex: calculatedDayIndex,
          finalDayIndex,
          reason: shouldUseStored ? "using stored state" : "using calculated state"
        },
        backendData
      });
      
      setLoading(false);
    };

    traceDayIndex();
  }, []);

  const handleResetToDay1 = () => {
    setCurrentState(1, "morning");
    console.log("🔄 Reset to Day 1, Morning");
    window.location.reload();
  };

  const handleClearLocalStorage = () => {
    localStorage.removeItem("currentDayIndex");
    localStorage.removeItem("currentBlockName");
    console.log("🗑️ Cleared currentDayIndex and currentBlockName");
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Tracing day index...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 Day Index Debug</h1>
        <p className="text-gray-600">Tracing the day index calculation and itinerary data</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleResetToDay1}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          🔄 Reset to Day 1
        </button>
        <button
          onClick={handleClearLocalStorage}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          🗑️ Clear localStorage
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          🏠 Go Home
        </button>
      </div>

      {/* localStorage Data */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 localStorage Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Trip Data</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(debugData.localStorage.tripData, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Itinerary Data</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(debugData.localStorage.itineraryData, null, 2)}
            </pre>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Current State</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm">
            {JSON.stringify(debugData.localStorage.currentState, null, 2)}
          </pre>
        </div>
      </div>

      {/* Day Index Calculation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 Day Index Calculation</h2>
        <div className="space-y-2">
          <p><strong>Today:</strong> {debugData.calculation.today}</p>
          <p><strong>Start Date:</strong> {debugData.calculation.startDate}</p>
          <p><strong>End Date:</strong> {debugData.calculation.endDate}</p>
          <p><strong>Calculated Day Index:</strong> {debugData.calculation.calculatedDayIndex}</p>
          <p><strong>Reason:</strong> {debugData.calculation.calculationReason}</p>
        </div>
      </div>

      {/* Final Decision */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🎯 Final Decision</h2>
        <div className="space-y-2">
          <p><strong>Should Use Stored:</strong> {debugData.decision.shouldUseStored ? "Yes" : "No"}</p>
          <p><strong>Stored Index:</strong> {debugData.decision.storedIndex}</p>
          <p><strong>Calculated Index:</strong> {debugData.decision.calculatedIndex}</p>
          <p><strong>Final Day Index:</strong> <span className="font-bold text-blue-600">{debugData.decision.finalDayIndex}</span></p>
          <p><strong>Reason:</strong> {debugData.decision.reason}</p>
        </div>
      </div>

      {/* Backend Data */}
      {debugData.backendData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔄 Backend Hydration Data</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(debugData.backendData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
