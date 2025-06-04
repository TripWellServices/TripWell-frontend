                  import { useState } from "react";
                  import axios from "axios";

                  export default function TripPlannerAI({ tripId, tripData = {}, userData = {} }) {
                    const [userText, setUserText] = useState("");
                    const [gptReply, setGptReply] = useState(null);
                    const [loading, setLoading] = useState(false);

                    const handleSend = async () => {
                      if (!userText.trim()) return;
                      setLoading(true);

                      try {
                        const endpoint = tripId ? `/trip/${tripId}/chat` : `/plan/ai`;
                        const payload = tripId
                          ? { userInput: userText, tripData, userData }
                          : { userInput: userText, userData };

                        const res = await axios.post(endpoint, payload);
                        setGptReply(res.data.reply);
                      } catch (err) {
                        console.error("Failed to get GPT response", err);
                      }

                      setLoading(false);
                    };

                    const getPrimaryCity = () => {
                      const dest = tripData?.destinations?.[0];
                      return dest?.city || "your destination";
                    };

                    const getDateRange = () => {
                      const dest = tripData?.destinations?.[0];
                      const start = dest?.startDate ? dest.startDate.slice(0, 10) : null;
                      const end = dest?.endDate ? dest.endDate.slice(0, 10) : null;
                      return start && end ? `${start} to ${end}` : "your dates";
                    };

                    return (
                      <div className="max-w-3xl mx-auto p-6">
                        <h2 className="text-2xl font-bold mb-4">🧠 TripWell Assistant</h2>

                        <div className="text-gray-700 mb-6">
                          <p>
                            We already know you're heading to{" "}
                            <strong>{getPrimaryCity()}</strong> from{" "}
                            <strong>{getDateRange()}</strong>.
                          </p>
                          <p className="mt-3">
                            Just drop a few breadcrumbs — things that might already be booked, or things you're hoping to do:
                          </p>
                          <ul className="list-disc list-inside mt-2 mb-4">
                            <li>Hotel you’re staying at?</li>
                            <li>Food or experiences you want to try?</li>
                            <li>The vibe you’re trying to soak in?</li>
                          </ul>
                          <p className="italic text-gray-600">
                            Example: “We get in early on the 5th, staying at a place called Rom de La Pen. I just want a peaceful trip — maybe a good walk, some espresso spots, and something fun for my kid.”
                          </p>
                        </div>

                        <textarea
                          className="w-full h-40 border rounded p-4 mb-4"
                          placeholder="Drop your trip notes, ideas, or thoughts here..."
                          value={userText}
                          onChange={(e) => setUserText(e.target.value)}
                        />

                        <button
                          onClick={handleSend}
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                          {loading ? "Thinking..." : "Send to TripWell AI"}
                        </button>

                        {gptReply && (
                          <div className="mt-6 bg-gray-50 border-l-4 border-blue-500 p-4 rounded shadow">
                            <h3 className="text-lg font-semibold mb-2">TripWell AI Says:</h3>
                            <p className="text-gray-800 whitespace-pre-line">{gptReply}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
