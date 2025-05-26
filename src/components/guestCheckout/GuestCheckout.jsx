// components/GuestCheckout.jsx
'use client';

import { useState } from 'react';
import { 
  CREATE_ADDRESS,
  GET_GUEST_ADDRESSES
} from '@/utils/routes/addressRoutes';

const GuestCheckout = ({ 
  onGuestInfoComplete, 
  onAddressComplete,
  cartItems,
  cartTotal 
}) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Guest Info, 2: Address
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    phone: '',
    name: ''
  });
  const [addressData, setAddressData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    type: 'both',
    isDefault: true
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [existingAddresses, setExistingAddresses] = useState([]);
  const [selectedExistingAddress, setSelectedExistingAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Helper function to show success message
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Step 1: Guest Information
  const handleGuestInfoSubmit = async (e) => {
    e.preventDefault();
    
    // Validate guest info
    const newErrors = {};
    if (!guestInfo.email.trim()) newErrors.email = 'Email is required';
    if (!guestInfo.name.trim()) newErrors.name = 'Name is required';
    if (!guestInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (guestInfo.email && !emailRegex.test(guestInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      // Check if guest already has addresses
      const response = await fetch(GET_GUEST_ADDRESSES(guestInfo.email));
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setExistingAddresses(data.data);
          setSelectedExistingAddress(data.data.find(addr => addr.isDefault)?.id || data.data[0].id);
          // Show message about found addresses
          showSuccessMessage(`Welcome back! We found ${data.data.length} saved address${data.data.length > 1 ? 'es' : ''} for ${guestInfo.email}`);
        } else {
          setShowNewAddressForm(true);
        }
      } else {
        // Guest doesn't have addresses yet, show new address form
        setShowNewAddressForm(true);
      }

      // Pre-fill address form with guest info
      setAddressData(prev => ({
        ...prev,
        name: guestInfo.name,
        phone: guestInfo.phone
      }));

      if (onGuestInfoComplete) {
        onGuestInfoComplete(guestInfo);
      }
      setCurrentStep(2);
    } catch (error) {
      console.error('Error checking guest addresses:', error);
      setShowNewAddressForm(true);
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Address Selection/Creation
  const handleAddressSubmit = async (e) => {
  e.preventDefault();
  
  if (selectedExistingAddress) {
    // Use existing address
    const selectedAddress = existingAddresses.find(addr => addr.id === selectedExistingAddress);
    if (selectedAddress) {
      setIsLoading(true); // Show loading state
      showSuccessMessage(`✅ Perfect! Using your saved address: ${selectedAddress.name}`);
      setTimeout(() => {
        setIsLoading(false);
        if (onAddressComplete) {
          onAddressComplete(selectedAddress, guestInfo);
        }
      }, 1500); // Show message for 1.5 seconds
    }
    return;
  }

    // Validate new address
    const newErrors = {};
    if (!addressData.addressLine1.trim()) newErrors.addressLine1 = 'Address line 1 is required';
    if (!addressData.city.trim()) newErrors.city = 'City is required';
    if (!addressData.state.trim()) newErrors.state = 'State is required';
    if (!addressData.country.trim()) newErrors.country = 'Country is required';
    if (!addressData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      // Create new address for guest
      const response = await fetch(CREATE_ADDRESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...addressData,
          guestEmail: guestInfo.email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message
        showSuccessMessage(`✅ Perfect! Your address has been saved and will be used for delivery.`);
        
        // Wait a moment to show the success message, then proceed
        setTimeout(() => {
          if (onAddressComplete) {
            onAddressComplete(data.data, guestInfo);
          }
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to create address');
      }
    } catch (error) {
      console.error('Error creating address:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value, isGuestInfo = false) => {
    if (isGuestInfo) {
      setGuestInfo(prev => ({ ...prev, [field]: value }));
    } else {
      setAddressData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-4 ${
            currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}>
            Your Information
          </span>
          <span className={currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}>
            Delivery Address
          </span>
        </div>
      </div>

      {/* Step 1: Guest Information */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Guest Checkout</h2>
          <p className="text-gray-600 mb-6">
            Enter your information to continue with guest checkout
          </p>
          
          <form onSubmit={handleGuestInfoSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <input
                type="email"
                value={guestInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value, true)}
                className={`w-full border rounded px-3 py-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                value={guestInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value, true)}
                className={`w-full border rounded px-3 py-2 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                value={guestInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value, true)}
                className={`w-full border rounded px-3 py-2 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Checking...
                </div>
              ) : (
                'Continue to Address'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Address Selection/Creation */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Delivery Address</h2>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Info
            </button>
          </div>

          {/* Show existing addresses if any */}
          {existingAddresses.length > 0 && !showNewAddressForm && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Use Previous Address</h3>
              <p className="text-gray-600 mb-4">
                We found addresses associated with {guestInfo.email}
              </p>
              
              <div className="space-y-3 mb-4">
                {existingAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedExistingAddress === address.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedExistingAddress(address.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="existing-address"
                        checked={selectedExistingAddress === address.id}
                        onChange={() => setSelectedExistingAddress(address.id)}
                        className="mt-1"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{address.name}</span>
                          {address.isDefault && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-gray-600">{address.country}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
  <button
    onClick={handleAddressSubmit}
    disabled={isLoading || !selectedExistingAddress}
    className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 disabled:opacity-50"
  >
    {isLoading ? (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
        Using Address...
      </div>
    ) : (
      'Use Selected Address'
    )}
  </button>
  <button
    onClick={() => setShowNewAddressForm(true)}
    className="px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
  >
    Use New Address
  </button>
</div>
            </div>
          )}

          {/* New address form */}
          {(showNewAddressForm || existingAddresses.length === 0) && (
            <div>
              <h3 className="text-lg font-medium mb-3">
                {existingAddresses.length > 0 ? 'Add New Address' : 'Enter Your Address'}
              </h3>

              {/* INFO: Address will be saved */}
              {existingAddresses.length === 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-800">
                      Your address will be saved for future orders using {guestInfo.email}
                    </p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Address Name *</label>
                  <input
                    type="text"
                    value={addressData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., Home, Office"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    value={addressData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${
                      errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Street address"
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={addressData.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      value={addressData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full border rounded px-3 py-2 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <input
                      type="text"
                      value={addressData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full border rounded px-3 py-2 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code *</label>
                    <input
                      type="text"
                      value={addressData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={`w-full border rounded px-3 py-2 ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Country *</label>
                    <input
                      type="text"
                      value={addressData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className={`w-full border rounded px-3 py-2 ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800 text-sm">{errors.submit}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  {existingAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Back to Addresses
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Saving Address...
                      </div>
                    ) : (
                      'Save Address & Continue'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestCheckout;