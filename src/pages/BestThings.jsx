// src/pages/BestThings.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";

export default function BestThings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: "",
    category: "all", // all, food, culture, nature, nightlife
    budget: "medium" // low, medium, high
  });
  const [isLoading, setIsLoading] = useState(false);
  const [demoData, setDemoData] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setDemoData(null);

    try {
      const response = await fetch(`${BACKEND_URL}/tripwell/demo/bestthings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Demo generation failed: ${response.status}`);
      }

      const data = await response.json();
      setDemoData(data);
      setShowAuthPrompt(true);
    } catch (error) {
      console.error("Demo generation error:", error);
      alert("Failed to generate demo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Save demo data with user info
      const saveResponse = await fetch(`${BACKEND_URL}/tripwell/demo/bestthings/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await result.user.getIdToken()}`
        },
        body: JSON.stringify({
          firebaseId: result.user.uid,
          email: result.user.email,
          destination: formData.destination,
          category: formData.category,
          budget: formData.budget,
          bestThingsData: demoData
        })
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save demo data");
      }

      // Navigate to funnel router
      navigate("/funnelrouter");
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "food", label: "Food & Dining" },
    { value: "culture", label: "Culture & Arts" },
    { value: "nature", label: "Nature & Outdoors" },
    { value: "nightlife", label: "Nightlife & Entertainment" }
  ];

  const budgets = [
    { value: "low", label: "Budget-Friendly" },
    { value: "medium", label: "Mid-Range" },
    { value: "high", label: "Luxury" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Discover the Best of Anywhere</h1>
          <p className="text-gray-600">Get personalized recommendations for the top spots in your destination</p>
        </div>

        {!demoData ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where are you going? 🌍
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="e.g., Paris, Tokyo, New York"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What interests you? 🎯
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your budget? 💰
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {budgets.map(budget => (
                  <option key={budget.value} value={budget.value}>{budget.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {isLoading ? "Finding the best spots... ✨" : "Find the Best Spots ✨"}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">
                🌟 Best of {formData.destination}
              </h3>
              
              {demoData.bestThings && demoData.bestThings.map((item, index) => (
                <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-purple-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      {item.whyBest && (
                        <p className="text-sm text-purple-600 mt-2">
                          <span className="font-medium">Why it's special:</span> {item.whyBest}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-2xl">{item.emoji}</div>
                      {item.category && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showAuthPrompt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  🎉 Your personalized recommendations are ready!
                </h3>
                <p className="text-blue-600 mb-4">
                  Sign in to save these recommendations and get more personalized travel planning features.
                </p>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  {isAuthenticating ? "Signing in..." : "Continue with Google"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
