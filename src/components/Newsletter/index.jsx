import React, { useState } from 'react';
import { SUBSCRIBE_NEWSLETTER } from '@/utils/routes/customerRoutes';
const Newsletter = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName.trim() || !formData.email.trim()) {
      setMessage('First name and email are required');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(SUBSCRIBE_NEWSLETTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType('success');
        setFormData({ firstName: '', lastName: '', email: '' }); // Reset form
      } else {
        setMessage(data.message || 'Something went wrong');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-pink-50 py-12 mt-12 rounded-3xl shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-serif text-gray-900 mb-4">Stay in Style</h2>
        <p className="text-gray-600 mb-6">Subscribe to our newsletter for exclusive offers and new arrivals</p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name *"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email *"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subscribing...
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
          
          {message && (
            <div className={`w-full mt-4 p-3 rounded-lg text-sm text-center ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            * Required fields. We respect your privacy and won't spam you.
          </p>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;