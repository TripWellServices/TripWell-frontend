import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripSetup() {
  const navigate = useNavigate();
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [tripData, setTripData] = useState({
    tripName: '',
    joinCode: '',
    startDate: '',
    endDate: '',
    destination: '',
    destinations: [],
    purpose: '',
    userId: 'user-123', // placeholder, needs actual userId from auth
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData({ ...tripData, [name]: value });
  };

  const handleDestinationChange = (index, field, value) => {
    const updated = [...tripData.destinations];
    updated[index][field] = value;
    setTripData({ ...tripData, destinations: updated });
  };

  const addCity = () => {
    setTripData({
      ...tripData,
      destinations: [...tripData.destinations, { city: '', startDate: '', endDate: '' }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        tripName: tripData.tripName,
        joinCode: tripData.joinCode,
        userId: tripData.userId,
        purpose: tripData.purpose,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        isMultiCity,
        destination: isMultiCity ? undefined : tripData.destination,
        destinations: isMultiCity ? tripData.destinations : undefined,
      };

      const res = await axios.post('/api/trips', payload);
      navigate(`/trip/${res.data.tripId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Trip creation failed.');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Plan Your Trip</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trip Name */}
        <div>
          <label className="block mb-1 font-medium">Trip Name</label>
          <input
            type="text"
            name="tripName"
            value={tripData.tripName}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="e.g., Paris 2025"
            required
          />
        </div>

        {/* Join Code */}
        <div>
          <label className="block mb-1 font-medium">Join Code</label>
          <input
            type="text"
            name="joinCode"
            value={tripData.joinCode}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="e.g., paris2025"
            required
          />
        </div>

        {/* Purpose of Trip */}
        <div>
          <label className="block mb-1 font-medium">Purpose of Trip</label>
          <input
            type="text"
            name="purpose"
            value={tripData.purpose}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="e.g., Vacation, Business, Family"
            required
          />
        </div>

        {/* Multi-city Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isMultiCity}
            onChange={() => setIsMultiCity(!isMultiCity)}
          />
          <label className="text-sm">Multi-city trip?</label>
        </div>

        {!isMultiCity ? (
          <div>
            <label className="block mb-1 font-medium">Destination City</label>
            <input
              type="text"
              name="destination"
              value={tripData.destination}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="e.g., Paris"
              required
            />
          </div>
        ) : (
          <div className="space-y-4">
            {tripData.destinations.map((dest, index) => (
              <div key={index} className="border p-3 rounded bg-gray-50">
                <label className="block mb-1 font-medium">City #{index + 1}</label>
                <input
                  type="text"
                  value={dest.city}
                  onChange={(e) => handleDestinationChange(index, 'city', e.target.value)}
                  className="w-full border rounded p-2 mb-2"
                  placeholder="e.g., Rome"
                  required
                />
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={dest.startDate}
                    onChange={(e) => handleDestinationChange(index, 'startDate', e.target.value)}
                    className="flex-1 border rounded p-2"
                    required
                  />
                  <input
                    type="date"
                    value={dest.endDate}
                    onChange={(e) => handleDestinationChange(index, 'endDate', e.target.value)}
                    className="flex-1 border rounded p-2"
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addCity}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add Another City
            </button>
          </div>
        )}

        {/* Start/End Dates */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={tripData.startDate}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              value={tripData.endDate}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Let’s Go
        </button>
      </form>
    </div>
  );
}
