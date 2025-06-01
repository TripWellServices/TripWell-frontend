import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TripSetup({ user }) {
  const [tripName, setTripName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!tripName) newErrors.tripName = 'Trip name is required';
    if (!purpose) newErrors.purpose = 'Purpose is required';
    if (!city) newErrors.city = 'City is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (!joinCode) newErrors.joinCode = 'Join code is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/trips/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripName,
          purpose,
          city,
          startDate,
          endDate,
          joinCode,
          userId: user._id,
        }),
      });

      if (response.status === 409) {
        setErrors({ joinCode: 'Join code already in use. Choose something else.' });
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error('Failed to create trip');

      const data = await response.json();
      navigate('/tripwell-hub');
    } catch (err) {
      console.error(err);
      alert('Something went wrong while creating the trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>Set Up Your Trip</h1>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '2rem' }}>
        Create your trip, set your purpose, and choose a join code so others can come too.
      </p>

      <form onSubmit={handleSubmit}>
        <InputField label="Trip Name" value={tripName} onChange={setTripName} error={errors.tripName} />
        <InputField label="Purpose" value={purpose} onChange={setPurpose} error={errors.purpose} />
        <InputField label="City" value={city} onChange={setCity} error={errors.city} />
        <InputField label="Start Date" type="date" value={startDate} onChange={setStartDate} error={errors.startDate} />
        <InputField label="End Date" type="date" value={endDate} onChange={setEndDate} error={errors.endDate} />

        <div style={{ height: '2rem' }} /> {/* Spacer */}

        <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Join Code</div>
        <InputField
          label=""
          value={joinCode}
          onChange={setJoinCode}
          error={errors.joinCode}
          placeholder="e.g. Paris2025"
        />
        <p style={{ fontSize: '0.875rem', color: '#555', marginTop: '-1rem', marginBottom: '1.5rem' }}>
          Come up with something memorable so you can share with friends and family to join your trip.
        </p>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            marginTop: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Creating Trip...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', error, placeholder }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {label && <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      {error && <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
