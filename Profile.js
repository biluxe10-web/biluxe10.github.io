import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bankAccount: '',
    ifsc: '',
    upi: ''
  });

  useEffect(() => {
    const userId = "current_user_id"; // Replace with actual user ID
    
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const data = userDoc.data();
        setUserData({
          id: userDoc.id,
          // Your EXACT user fields
          uid: data.uid,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          profilePic: data.profilePic || '',
          joinDate: data.joinDate,
          membership: data.membership || 'Silver',
          referralCode: data.referralCode || '',
          referredBy: data.referredBy || '',
          earnings_today: data.earnings_today || 0,
          earnings_week: data.earnings_week || 0,
          earnings_month: data.earnings_month || 0,
          earnings_total: data.earnings_total || 0,
          balance: data.balance || 0,
          bankAccount: data.bankAccount || '',
          ifsc: data.ifsc || '',
          upi: data.upi || '',
          kycStatus: data.kycStatus || 'pending',
          rank: data.rank || 'Affiliate',
          lastLogin: data.lastLogin
        });

        // Set form data
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bankAccount: data.bankAccount || '',
          ifsc: data.ifsc || '',
          upi: data.upi || ''
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please select image under 5MB.');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `profile-pictures/${userData.uid}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', userData.id), {
        profilePic: downloadURL
      });

      // Update local state
      setUserData(prev => ({ ...prev, profilePic: downloadURL }));
      
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateDoc(doc(db, 'users', userData.id), {
        name: formData.name,
        phone: formData.phone,
        bankAccount: formData.bankAccount,
        ifsc: formData.ifsc,
        upi: formData.upi
      });

      // Update local state
      setUserData(prev => ({ 
        ...prev, 
        name: formData.name,
        phone: formData.phone,
        bankAccount: formData.bankAccount,
        ifsc: formData.ifsc,
        upi: formData.upi
      }));
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
              
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <img
                    src={userData.profilePic || '/default-avatar.png'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-lg object-cover"
                  />
                  {uploading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                    >
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : '📷 Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </motion.label>

                <p className="text-xs text-gray-500 text-center">
                  JPG, PNG, GIF • Max 5MB
                </p>
              </div>

              {/* Account Status */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Membership:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                    {userData.membership}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">KYC Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    userData.kycStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userData.kycStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rank:</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                    {userData.rank}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Referral Code:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded font-mono">
                    {userData.referralCode}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Join Date:</span>
                  <span className="text-sm text-gray-900">
                    {userData.joinDate?.toDate?.().toLocaleDateString() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referred By
                    </label>
                    <input
                      type="text"
                      value={userData.referredBy || 'No one'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                {/* Bank Details Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Bank & Payment Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter account number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="ifsc"
                        value={formData.ifsc}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter IFSC code"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        name="upi"
                        value={formData.upi}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="yourname@upi"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        For instant UPI payments
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
