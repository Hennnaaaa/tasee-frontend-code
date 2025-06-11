'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GET_PROFILE, UPDATE_PROFILE } from '@/utils/routes/customerRoutes';
import { User, Edit2, Save, X, Phone, Mail, Calendar, ShoppingCart, Package, Home, ArrowLeft } from 'lucide-react';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Helper function for API calls
  const apiCall = async (url, options = {}) => {
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  };

  // Fetch profile data
  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 Fetching profile...');

      const data = await apiCall(GET_PROFILE, {
        method: "GET",
      });

      console.log('🔍 Profile data:', data);

      if (data.success) {
        setProfile(data.data.user);
        setFormData({
          firstName: data.data.user.firstName || '',
          lastName: data.data.user.lastName || '',
          phone: data.data.user.phone || ''
        });
      } else {
        throw new Error(data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('🔄 Updating profile with data:', formData);

      const data = await apiCall(UPDATE_PROFILE, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      console.log('🔄 Update response data:', data);

      if (data.success) {
        setProfile(data.data.user);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile();
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || ''
    });
    setIsEditing(false);
    setError('');
  };

  // Initial load
  useEffect(() => {
    fetchProfile();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          <span className="text-gray-600 text-lg text-center">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600 text-sm sm:text-base px-4">Manage your personal information and account settings</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`)}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center space-x-3 sm:space-x-4 text-left"
          >
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Home</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Go back to dashboard</p>
            </div>
          </button>

          <button
            onClick={() => router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/cart`)}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center space-x-3 sm:space-x-4 text-left"
          >
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">My Cart</h3>
              <p className="text-gray-600 text-xs sm:text-sm">View and manage your shopping cart</p>
            </div>
          </button>

          <button
            onClick={() => router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/orders`)}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center space-x-3 sm:space-x-4 text-left sm:col-span-2 lg:col-span-1"
          >
            <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">My Orders</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Track your order history and status</p>
            </div>
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 sm:mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm sm:text-base">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm sm:text-base">{error}</p>
                <button
                  onClick={fetchProfile}
                  className="mt-2 text-red-600 hover:text-red-800 font-medium underline text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gray-800 px-4 sm:px-8 py-8 sm:py-12 text-white text-center relative">
            <div className="absolute top-4 right-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                  disabled={isSaving}
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User Profile' : 'User Profile'}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base break-all">{profile?.email || 'No email available'}</p>
          </div>

          {/* Profile Form/Details */}
          <div className="p-4 sm:p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter your first name"
                    required
                    disabled={isSaving}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter your last name"
                    disabled={isSaving}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter your phone number"
                    disabled={isSaving}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-gray-800 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-900 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Profile Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">First Name</span>
                    </div>
                    <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
                      {profile?.firstName || 'Not provided'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Last Name</span>
                    </div>
                    <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
                      {profile?.lastName || 'Not provided'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Email</span>
                    </div>
                    <p className="text-gray-900 font-medium text-sm sm:text-base break-all">
                      {profile?.email || 'Not provided'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Phone</span>
                    </div>
                    <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
                      {profile?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Additional Information */}
                {profile?.createdAt && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Member Since</span>
                    </div>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {/* Edit Button */}
                <div className="pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gray-800 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-900 transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}