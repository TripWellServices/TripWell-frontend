import React, { useState } from 'react';

export default function TripSetup() {
  const [tripName, setTripName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!tripName) newErrors.tripName = 'Trip name is required';
    if (!joinCode) newErrors.joinCode = 'Join code is required';
    if (!purpose) newErrors.purpose = 'Purpose is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      alert('Trip Created');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-2">Set Up Your Trip</h1>
      <p className="text-center text-gray-600 mb-8">
        Create your trip profile, invite others with a join code, and set your adventure in motion.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Name */}
        <div>
          <label className="block font-medium text-gray-700">Trip Name</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="e.g. Summer in Paris"
          />
          {errors.tripName && <p className="text-sm text-red-600 mt-1">{errors.tripName}</p>}
        </div>

        {/* Join Code */}
        <div>
          <label className="block font-medium text-gray-700">Join Code</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="e.g. Paris2025"
          />
          {errors.joinCode && <p className="text-sm text-red-600 mt-1">{errors.joinCode}</p>}
        </div>

        {/* Purpose */}
        <div>
          <label className="block font-medium text-gray-700">Purpose</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Family, Solo, Work"
          />
          {errors.purpose && <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>}
        </div>

        {/* Start Date */}
        <div>
          <label className="block font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label className="block font-medium text-gray-700">End Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={
            !tripName || !joinCode || !purpose || !startDate || !endDate
          }
        >
          Continue
        </button>
      </form>
    </div>
  );
}
