import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LocalStateDebug() {
  const navigate = useNavigate();
  const [localState, setLocalState] = useState({});

  useEffect(() => {
    const updateState = () => {
      const state = {
        userData: localStorage.getItem("userData"),
        tripData: localStorage.getItem("tripData"),
        tripIntentData: localStorage.getItem("tripIntentData"),
        anchorSelectData: localStorage.getItem("anchorSelectData"),
        itineraryData: localStorage.getItem("itineraryData"),
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
    localStorage.removeItem("tripData");
    localStorage.removeItem("tripIntentData");
    localStorage.removeItem("anchorSelectData");
    localStorage.removeItem("itineraryData");
    setLocalState({
      userData: localStorage.getItem("userData"),
      tripData: localStorage.getItem("tripData"),
      tripIntentData: localStorage.getItem("tripIntentData"),
      anchorSelectData: localStorage.getItem("anchorSelectData"),
      itineraryData: localStorage.getItem("itineraryData"),
    });
    console.log("🔄 Reset trip data");
  };

  const resetUser = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("tripData");
    localStorage.removeItem("tripIntentData");
    localStorage.removeItem("anchorSelectData");
    localStorage.removeItem("itineraryData");
    setLocalState({
      userData: localStorage.getItem("userData"),
      tripData: localStorage.getItem("tripData"),
      tripIntentData: localStorage.getItem("tripIntentData"),
      anchorSelectData: localStorage.getItem("anchorSelectData"),
      itineraryData: localStorage.getItem("itineraryData"),
    });
    console.log("🔄 Reset user data");
  };

  const formatValue = (value) => {
    if (!value) return "null";
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') {
        return JSON.stringify(parsed, null, 2).substring(0, 100) + (JSON.stringify(parsed).length > 100 ? "..." : "");
      }
      return parsed;
    } catch {
      return value;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          🧪 Local State Debug
        </h1>
        <p className="text-gray-600">
          Current localStorage state for universal routing
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {Object.entries(localState).map(([key, value]) => (
          <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
            <div className="flex justify-between items-start">
              <span className="font-mono text-sm text-gray-700 font-semibold">{key}:</span>
              <span className="font-mono text-xs text-gray-900 max-w-xs break-words text-right">
                {formatValue(value)}
              </span>
            </div>
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
          onClick={resetUser}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          🔄 Reset User Data
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
