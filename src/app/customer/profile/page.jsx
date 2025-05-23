// src/app/profile/page.jsx
"use client"

import { useAuth } from '@/contexts/authcontext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, ShoppingBag, Heart, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow">
                <ShoppingBag className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">My Orders</p>
                <p className="text-sm text-gray-600">View order history</p>
              </button>
              
              <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow">
                <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Wishlist</p>
                <p className="text-sm text-gray-600">View saved items</p>
              </button>
              
              <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow">
                <MapPin className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Addresses</p>
                <p className="text-sm text-gray-600">Manage addresses</p>
              </button>
              
              <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow">
                <User className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Account Settings</p>
                <p className="text-sm text-gray-600">Password & security</p>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wishlist Items</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={logout} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}