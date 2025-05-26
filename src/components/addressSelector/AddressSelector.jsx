// components/AddressSelector.jsx - For use in checkout
'use client';

import { useState, useEffect } from 'react';
import { useAddress } from '@/contexts/AddressContext';

const AddressSelector = ({ 
  type = 'shipping', // 'shipping' or 'billing' 
  selectedAddressId,
  onAddressSelect,
  showAddForm = false,
  onAddFormToggle
}) => {
  const { 
    addresses, 
    isLoading, 
    user,
    createAddress,
    getAddressesByType 
  } = useAddress();

  const [showForm, setShowForm] = useState(showAddForm);
  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    type: type,
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState({});

  // Get relevant addresses based on type
  const relevantAddresses = getAddressesByType(type);

  const handleAddressSelect = (addressId) => {
    onAddressSelect?.(addressId);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.postalCode.trim()) errors.postalCode = 'Postal code is required';

    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    try {
      const newAddress = await createAddress(formData);
      
      // Auto-select the newly created address
      onAddressSelect?.(newAddress.id);
      
      // Reset form
      setFormData({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        type: type,
        isDefault: false
      });
      setFormErrors({});
      setShowForm(false);
      
      if (onAddFormToggle) {
        onAddFormToggle(false);
      }
    } catch (error) {
      console.error('Error creating address:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800">Please log in to manage addresses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">
          {type} Address
        </h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (onAddFormToggle) onAddFormToggle(!showForm);
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ Add New Address'}
        </button>
      </div>

      {/* Address Selection */}
      {relevantAddresses.length > 0 && (
        <div className="space-y-3">
          {relevantAddresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAddressId === address.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAddressSelect(address.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name={`${type}-address`}
                    checked={selectedAddressId === address.id}
                    onChange={() => handleAddressSelect(address.id)}
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
                    {address.phone && (
                      <p className="text-gray-600">Phone: {address.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Addresses Message */}
      {relevantAddresses.length === 0 && !showForm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No {type} addresses found.</p>
          <button
            onClick={() => {
              setShowForm(true);
              if (onAddFormToggle) onAddFormToggle(true);
            }}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Add your first {type} address
          </button>
        </div>
      )}

      {/* Add Address Form */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h4 className="text-md font-medium mb-4">Add New {type} Address</h4>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Home, Office"
                className={`w-full border rounded px-3 py-2 ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                placeholder="Street address"
                className={`w-full border rounded px-3 py-2 ${
                  formErrors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.addressLine1 && (
                <p className="text-red-500 text-sm mt-1">{formErrors.addressLine1}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                placeholder="Apartment, suite, etc. (optional)"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.state && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code *</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.postalCode && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.country && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Phone number (optional)"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isDefault" className="text-sm">
                Set as default {type} address
              </label>
            </div>

            {formErrors.submit && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-800 text-sm">{formErrors.submit}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  if (onAddFormToggle) onAddFormToggle(false);
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

// components/CheckoutAddresses.jsx - Complete checkout address section
export const CheckoutAddresses = ({ 
  shippingAddressId, 
  billingAddressId,
  onShippingAddressChange,
  onBillingAddressChange,
  sameAsShipping,
  onSameAsShippingChange 
}) => {
  return (
    <div className="space-y-8">
      {/* Shipping Address */}
      <AddressSelector
        type="shipping"
        selectedAddressId={shippingAddressId}
        onAddressSelect={onShippingAddressChange}
      />

      {/* Same as Shipping Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="sameAsShipping"
          checked={sameAsShipping}
          onChange={(e) => onSameAsShippingChange(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="sameAsShipping" className="text-sm">
          Billing address is the same as shipping address
        </label>
      </div>

      {/* Billing Address (only show if different from shipping) */}
      {!sameAsShipping && (
        <AddressSelector
          type="billing"
          selectedAddressId={billingAddressId}
          onAddressSelect={onBillingAddressChange}
        />
      )}
    </div>
  );
};

export default AddressSelector;