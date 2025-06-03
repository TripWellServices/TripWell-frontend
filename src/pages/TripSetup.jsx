import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'https://gofastbackend.onrender.com';

export default function TripSetup({ user }) {
  const [tripName, setTripName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinCodeAvailable, setJoinCodeAvailable] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user || !user._id) {
    return <p style={{ textAlign: 'center', color: 'red' }}>Error: User not loaded. Please log in again.</p>;
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      if (joinCode.trim() === '') {
        setJoinCodeAvailable(null);
        return;
      }

      fetch(`${BACKEND_URL}/api/trips/check-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode }),
      })
        .then((res) => {
          if (res.status === 409) setJoinCodeAvailable(false);
          else if (res.status === 200) setJoinCodeAvailable(true);
          else setJoinCodeAvailable(null);
        })
        .catch((err) => {
          console.error('Join code check failed:', err);
          setJoinCodeAvailable(null);
        });
    }, 600);

    return () => clearTimeout(delay);
  }, [joinCode]);

  const validateForm = () => {
    const newErrors = {};
    if (!tripName) newErrors.tripName = 'Trip name is required';
    if (!purpose) newErrors.purpose = 'Purpose is required';
    if (!city) newErrors.city = 'City is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (!joinCode) newErrors.joinCode = 'Join code is required';
    if (joinCodeAvailable === false) newErrors.joinCode = 'Join code already in use';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    setErrors(formErrors);

    if (
      Object.keys(formErrors).length > 0 ||
      joinCodeAvailable === false ||
      joinCodeAvailable === null
    ) {
      console.warn('Blocked: join code not valid or form errors present');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/trips/create`, {
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

      if (!response.ok) throw new Error('Failed to create trip');
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

        <div style={{ height: '2rem' }} />

        <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Join Code</div>
        <InputField
          label=""
          value={joinCode}
          onChange={setJoinCode}
          error={errors.joinCode}
          placeholder="e.g. Paris2025"
        />
        {joinCode && joinCodeAvailable === false && (
          <p style={{ color: 'red', fontSize: '0.875rem' }}>
            This join code is already taken.
          </p>
        )}
        {joinCode && joinCodeAvailable === true && (
          <p style={{ color: 'green', fontSize: '0.875rem' }}>
            ✅ Join code is available
          </p>
        )}
        <p style={{ fontSize: '0.875rem', color: '#555', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Come up with something memorable so you can share with friends and family to join your trip.
        </p>

        <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '1rem' }}>
          joinCodeAvailable = {String(joinCodeAvailable)}
        </p>

        <button
          type="submit"
          disabled={loading || joinCodeAvailable !== true}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            marginTop: '1rem',
            cursor: loading || joinCodeAvailable !== true ? 'not-allowed' : 'pointer',
            opacity: loading || joinCodeAvailable !== true ? 0.5 : 1,
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
