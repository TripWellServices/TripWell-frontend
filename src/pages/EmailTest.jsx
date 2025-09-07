import React, { useState } from 'react';
import { TRIPWELL_API_URL } from '../config';

const EmailTest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      console.log(`🧪 Testing email flow for ${formData.email} (${formData.name})`);
      
      const response = await fetch(`${TRIPWELL_API_URL}/email-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          type: 'success',
          message: 'Test Successful!',
          data: data
        });
        console.log('✅ Test successful:', data);
      } else {
        setResult({
          type: 'error',
          message: 'Test Failed',
          data: data
        });
        console.error('❌ Test failed:', data);
      }
      
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Network Error',
        data: { error: error.message }
      });
      console.error('❌ Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 TripWell Email Test
          </h1>
          <p className="text-gray-600">
            Test the email flow: Frontend → Node.js → Python → Microsoft Graph
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Testing...' : '🚀 Test Email Flow'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-md ${
            result.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`text-lg font-medium mb-2 ${
              result.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.type === 'success' ? '✅' : '❌'} {result.message}
            </h3>
            
            {result.type === 'success' && result.data && (
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {result.data.email}</p>
                <p><strong>Name:</strong> {result.data.name}</p>
                <p><strong>Actions Taken:</strong> {result.data.python_response?.actions_taken?.length || 0}</p>
                <p><strong>Message:</strong> {result.data.python_response?.message}</p>
                
                {result.data.python_response?.user_state && (
                  <div className="mt-3">
                    <p className="font-medium">User State:</p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(result.data.python_response.user_state, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            
            {result.type === 'error' && (
              <div className="text-sm text-red-700">
                <p><strong>Error:</strong> {result.data?.message || result.data?.error}</p>
                {result.data?.error && (
                  <pre className="bg-red-100 p-2 rounded text-xs overflow-auto mt-2">
                    {JSON.stringify(result.data.error, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTest;
