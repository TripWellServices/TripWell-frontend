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
      alert('Trip Created!');
      // TODO: Hook backend trip creation here
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>Set Up Your Trip</h1>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '2rem' }}>
        Enter your trip details and claim a join code.
      </p>

      <form onSubmit={handleSubmit}>
        <InputField label="Trip Name" value={tripName} onChange={setTripName} error={errors.tripName} />
        <InputField label="Join Code" value={joinCode} onChange={setJoinCode} error={errors.joinCode} />
        <InputField label="Purpose" value={purpose} onChange={setPurpose} error={errors.purpose} />
        <InputField label="Start Date" type="date" value={startDate} onChange={setStartDate} error={errors.startDate} />
        <InputField label="End Date" type="date" value={endDate} onChange={setEndDate} error={errors.endDate} />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            marginTop: '1.5rem',
            cursor: 'pointer'
          }}
        >
          Continue
        </button>
      </form>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', error }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
      {error && <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
