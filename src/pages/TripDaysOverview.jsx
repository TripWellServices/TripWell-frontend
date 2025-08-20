import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function TripDaysOverview() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripData, setTripData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDays() {
      try {
        // Prefer server truth using auth token
        const firebaseUser = auth.currentUser;
        const token = firebaseUser ? await firebaseUser.getIdToken(true) : null;

        let tripId = null;
        if (token) {
          const statusRes = await fetch(`${BACKEND_URL}/tripwell/tripstatus`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            tripId = statusData?.tripId || null;
          }
        }

        // Fallback to localStorage if server status didn't provide tripId
        if (!tripId) {
          const localTrip = JSON.parse(localStorage.getItem("tripData") || "null");
          tripId = localTrip?.tripId || localTrip?._id || null;
          setTripData(localTrip);
        }

        if (!tripId) {
          navigate("/tripwell/tripitineraryrequired");
          return;
        }

        // Fetch days from backend (itinerary days endpoint)
        const daysRes = await fetch(`${BACKEND_URL}/tripwell/itinerary/days/${tripId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: "no-store",
        });
        if (!daysRes.ok) throw new Error(`Days fetch failed: ${daysRes.status}`);
        const data = await daysRes.json();
        setDays(data || []);
      } catch (err) {
        console.error("Failed to fetch trip days for overview:", err);
        setError("Could not load trip days.");
      } finally {
        setLoading(false);
      }
    }

    fetchDays();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl">✈️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your trip itinerary...</h2>
          <p className="text-gray-500">Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-red-700">Oops! Something went wrong</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl text-white">🗺️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Trip Itinerary</h1>
          {tripData && (
            <div className="bg-white rounded-xl shadow-sm p-4 inline-block">
              <p className="text-lg text-gray-700">
                <span className="font-semibold text-blue-600">{tripData.tripName}</span>
                <span className="text-gray-500"> to </span>
                <span className="font-semibold text-green-600">{tripData.city}</span>
              </p>
            </div>
          )}
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Here's your complete day-by-day adventure. You can modify any day or return home when you're ready to start your trip.
          </p>
        </div>

        {/* Days Grid */}
        {days.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Itinerary Not Ready Yet</h3>
            <p className="text-gray-500">Your trip planner is still working on creating the perfect schedule. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {days.map((day, index) => (
              <div
                key={day.dayIndex || index}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                {/* Day Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Day {day.dayIndex || index + 1}</h3>
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Day Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {day.summary || "No summary available for this day"}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      localStorage.setItem("modifyDayIndex", day.dayIndex || index + 1);
                      navigate("/tripwell/modify/day");
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    ✏️ Modify This Day
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">Ready to Start Your Adventure?</h3>
              <p className="text-gray-600">
                Your itinerary is all set! Head back home to begin your trip when you're ready.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                🏠 Return Home
              </button>
              
              <button
                onClick={() => navigate("/tripwellhub")}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                🎯 Trip Hub
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <p className="text-blue-800 text-sm">
                💡 <span className="font-semibold">Pro Tip:</span> On the Home screen, look for{" "}
                <span className="font-bold text-blue-900">"Start My Trip"</span> when you're ready to begin your adventure!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
