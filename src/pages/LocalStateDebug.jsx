import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LocalStateDebug() {
  const navigate = useNavigate();
  const [localState, setLocalState] = useState({});

  useEffect(() => {
    const updateState = () => {
      const state = {
        userId: localStorage.getItem("userId"),
        tripId: localStorage.getItem("tripId"),
        tripStatus: localStorage.getItem("tripStatus"),
        intent: localStorage.getItem("intent"),
        anchors: localStorage.getItem("anchors"),
        itineraryFinal: localStorage.getItem("itineraryFinal"),
        lastDayVisited: localStorage.getItem("lastDayVisited"),
      };
      setLocalState(state);
    };

    updateState();
    window.addEventListener('storage', updateState);
    return () => window.removeEventListener('storage', updateState);
  }, []);

  const clearAll = () => {
    localStorage.clear();
    setLocalState({});
    console.log("🗑️ Cleared all localStorage");
  };

  const resetTrip = () => {
    localStorage.removeItem("tripId");
    localStorage.removeItem("tripStatus");
    localStorage.removeItem("intent");
    localStorage.removeItem("anchors");
    localStorage.removeItem("itineraryFinal");
    localStorage.removeItem("lastDayVisited");
    setLocalState({
      userId: localStorage.getItem("userId"),
      tripId: localStorage.getItem("tripId"),
      tripStatus: localStorage.getItem("tripStatus"),
      intent: localStorage.getItem("intent"),
      anchors: localStorage.getItem("anchors"),
      itineraryFinal: localStorage.getItem("itineraryFinal"),
      lastDayVisited: localStorage.getItem("lastDayVisited"),
    });
    console.log("🔄 Reset trip data");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          🧪 Local State Debug
        </h1>
        <p className="text-gray-600">
          Current localStorage state for test flow
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {Object.entries(localState).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="font-mono text-sm text-gray-700">{key}:</span>
            <span className="font-mono text-sm text-gray-900 max-w-xs truncate">
              {value || "null"}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => navigate("/localrouter")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          🔄 Test Universal Router
        </button>
        
        <button 
          onClick={resetTrip}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          🔄 Reset Trip Data
        </button>
        
        <button 
          onClick={clearAll}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          🗑️ Clear All Data
        </button>
        
        <button 
          onClick={() => navigate("/")}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          🏠 Back to Main App
        </button>
      </div>
    </div>
  );
}
