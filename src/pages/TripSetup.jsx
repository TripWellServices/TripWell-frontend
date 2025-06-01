// src/components/TripSetup.jsx

import React, { useState } from 'react';

const TripSetup = () => {
  const [tripName, setTripName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!tripName.trim()) newErrors.tripName = 'Trip name is required.';
    if (!joinCode.trim()) newErrors.joinCode = 'Join code is required.';
    if (!purpose.trim()) newErrors.purpose = 'Purpose is required.';
    if (!startDate) newErrors.startDate = 'Start date is required.';
    if (!endDate) newErrors.endDate = 'End date is required.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      // Submit form data
      console.log('Form submitted:', { tripName, joinCode, purpose, startDate, endDate });
      // Reset form
      setTripName('');
      setJoinCode('');
      setPurpose('');
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Set Up Your Trip</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trip Name */}
        <div>
          <label className="block text-gray-700">Trip Name</label>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.tripName ? 'border-red-500' : 'border-gray-300'
            } rounded`}
          />
          {errors.tripName && <p className="text-red-500 text-sm mt-1">{errors.tripName}</p>}
        </div>

        {/* Join Code */}
        <div>
          <label className="block text-gray-700">Join Code</label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.joinCode ? 'border-red-500' : 'border-gray-300'
            } rounded`}
          />
          {errors.joinCode && <p className="text-red-500 text-sm mt-1">{errors.joinCode}</p>}
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-gray-700">Purpose</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.purpose ? 'border-red-500' : 'border-gray-300'
            } rounded`}
          />
          {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            } rounded`}
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label className="block text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            } rounded`}
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={
              !tripName || !joinCode || !purpose || !startDate || !endDate || Object.keys(errors).length > 0
            }
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripSetup;
