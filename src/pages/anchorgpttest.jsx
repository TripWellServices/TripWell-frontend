import { useEffect, useState } from "react";
import BACKEND_URL from "../config";
import { fetchJSON } from "../utils/fetchJSON";

export default function AnchorGPTTest() {
  const [loading, setLoading] = useState(true);
  const [anchors, setAnchors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnchors() {
      try {
        setLoading(true);
        const data = await fetchJSON(`${BACKEND_URL}/tripwell/anchorgpttest`);
        console.log("Anchor test response:", data);
        setAnchors(data.anchors || []);
      } catch (err) {
        console.error("Error fetching anchors:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnchors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test anchors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Anchor GPT Test</h1>
          <p className="text-gray-600">Budget-friendly trip to Paris with daughter</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {anchors.map((anchor, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{anchor.title}</h3>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{anchor.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600 w-20">Location:</span>
                  <span className="text-gray-800">{anchor.location}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium text-gray-600 w-20">Day Trip:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    anchor.isDayTrip 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {anchor.isDayTrip ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Follow-On:</h4>
                <p className="text-sm text-gray-600">{anchor.suggestedFollowOn}</p>
              </div>
            </div>
          ))}
        </div>

        {anchors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No anchors found</p>
          </div>
        )}
      </div>
    </div>
  );
}
