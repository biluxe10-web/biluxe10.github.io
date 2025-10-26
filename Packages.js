import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Packages = () => {
  const [userData, setUserData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = "current_user_id"; // Replace with actual user ID
    
    // Fetch user data with EXACT fields
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0].data();
        setUserData({
          id: snapshot.docs[0].id,
          uid: userDoc.uid,
          name: userDoc.name,
          membership: userDoc.membership || 'Starter',
          balance: userDoc.balance || 0,
          earnings_total: userDoc.earnings_total || 0
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Your exact package prices
  const packages = [
    { 
      id: 1, 
      name: 'Starter', 
      price: 999, 
      features: [
        '50% Direct Commission',
        '10% Passive Income', 
        '5% Ads Bonus',
        'Basic Support',
        'Referral System Access'
      ],
      color: 'from-gray-600 to-gray-700',
      popular: false
    },
    { 
      id: 2, 
      name: 'Bronze', 
      price: 2499, 
      features: [
        '50% Direct Commission',
        '10% Passive Income',
        '5% Ads Bonus', 
        'Priority Support',
        'Advanced Tools',
        'Weekly Training'
      ],
      color: 'from-amber-600 to-amber-700',
      popular: false
    },
    { 
      id: 3, 
      name: 'Silver', 
      price: 3499, 
      features: [
        '50% Direct Commission',
        '10% Passive Income',
        '5% Ads Bonus',
        'Priority Support',
        'Advanced Tools', 
        'Weekly Training',
        'Marketing Materials'
      ],
      color: 'from-gray-400 to-gray-500',
      popular: true
    },
    { 
      id: 4, 
      name: 'Gold', 
      price: 4999, 
      features: [
        '50% Direct Commission',
        '10% Passive Income',
        '5% Ads Bonus',
        '24/7 Support',
        'All Tools Access',
        'Weekly Training',
        'Marketing Materials',
        'Business Kit'
      ],
      color: 'from-yellow-500 to-yellow-600',
      popular: false
    },
    { 
      id: 5, 
      name: 'Platinum', 
      price: 9999, 
      features: [
        '50% Direct Commission',
        '10% Passive Income',
        '5% Ads Bonus',
        '24/7 VIP Support',
        'All Tools Access',
        'Daily Training',
        'Marketing Materials',
        'Business Kit',
        'Mentorship Program'
      ],
      color: 'from-teal-500 to-teal-600',
      popular: false
    },
    { 
      id: 6, 
      name: 'Diamond', 
      price: 14999, 
      features: [
        '50% Direct Commission',
        '10% Passive Income',
        '5% Ads Bonus',
        '24/7 VIP Support',
        'All Tools Access',
        'Daily Training',
        'Marketing Materials',
        'Business Kit',
        'Mentorship Program',
        'Leadership Training'
      ],
      color: 'from-blue-500 to-blue-600',
      popular: false
    },
    { 
      id: 7, 
      name: 'Elite', 
      price: 23999, 
      features: [
        '50% Direct Commission',
        '10% Passive Income',
        '5% Ads Bonus',
        '24/7 VIP Support',
        'All Tools Access',
        '1-on-1 Training',
        'Marketing Materials',
        'Business Kit',
        'Mentorship Program',
        'Leadership Training',
        'Leadership Bonus'
      ],
      color: 'from-purple-600 to-purple-700',
      popular: false
    }
  ];

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    try {
      // 1. Update user membership in 'users' collection
      await updateDoc(doc(db, 'users', userData.id), {
        membership: selectedPackage.name
      });

      // 2. Create transaction record in 'transactions' collection
      await addDoc(collection(db, 'transactions'), {
        transactionId: `PKG_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: userData.uid,
        type: 'purchase',
        amount: selectedPackage.price,
        date: new Date(),
        status: 'completed',
        source: `Package Purchase - ${selectedPackage.name}`
      });

      // 3. Handle referral commissions (if user was referred)
      // This would trigger the 50% + 10% + 5% commission system
      // You'll need to implement this based on your referral logic

      alert(`Successfully upgraded to ${selectedPackage.name} package!`);
      setSelectedPackage(null);
      
    } catch (error) {
      console.error('Error purchasing package:', error);
      alert('Error purchasing package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentPackage = packages.find(pkg => pkg.name === userData?.membership);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Membership Packages</h1>
          <p className="text-gray-600 mt-2">Upgrade your plan to unlock more features and higher earnings</p>
        </div>

        {/* Current Plan */}
        {currentPackage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Your Current Plan</h3>
                <p className="text-green-100">
                  You are on the <strong>{currentPackage.name}</strong> package
                </p>
                <p className="text-green-100 text-sm mt-1">
                  Total Earnings: <strong>₹{userData?.earnings_total || 0}</strong>
                </p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </motion.div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${
                userData?.membership === pkg.name 
                  ? 'border-green-500 ring-2 ring-green-200' 
                  : pkg.popular
                  ? 'border-yellow-500 ring-2 ring-yellow-200'
                  : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="bg-yellow-500 text-white text-center py-2 text-sm font-semibold">
                  ⭐ MOST POPULAR
                </div>
              )}

              {/* Package Header */}
              <div className={`p-6 text-white bg-gradient-to-r ${pkg.color}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">₹{pkg.price}</span>
                      <span className="text-white text-opacity-80 ml-2">one-time</span>
                    </div>
                  </div>
                  {userData?.membership === pkg.name && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Current
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => handlePackageSelect(pkg)}
                  disabled={userData?.membership === pkg.name || loading}
                  whileHover={{ scale: userData?.membership === pkg.name ? 1 : 1.05 }}
                  whileTap={{ scale: userData?.membership === pkg.name ? 1 : 0.95 }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    userData?.membership === pkg.name
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : pkg.popular
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {userData?.membership === pkg.name ? 'Current Plan' : 'Select Package'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Package Modal */}
        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Confirm Package Purchase
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedPackage.name}</div>
                  <div className="text-3xl font-bold text-indigo-600 my-2">₹{selectedPackage.price}</div>
                  <p className="text-sm text-gray-600">One-time payment</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Balance:</span>
                  <span className="font-semibold">₹{userData?.balance || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Package Price:</span>
                  <span className="font-semibold">₹{selectedPackage.price}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Amount Due:</span>
                    <span className="text-red-600">₹{selectedPackage.price}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handlePurchase}
                  disabled={loading || (userData?.balance < selectedPackage.price)}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Confirm Purchase'
                  )}
                </motion.button>
              </div>

              {userData?.balance < selectedPackage.price && (
                <p className="text-red-600 text-sm text-center mt-3">
                  Insufficient balance. Please add funds to your account.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Commission Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-2">💰 Commission Information</h3>
          <p className="text-blue-700">
            When someone purchases any package through your referral, you earn:
          </p>
          <ul className="text-blue-700 text-sm mt-2 space-y-1">
            <li>• <strong>50% Direct Commission</strong> - When your direct referral buys any package</li>
            <li>• <strong>10% Passive Income</strong> - When your Level 2 referrals make purchases</li>
            <li>• <strong>5% Ads Bonus</strong> - When your Level 3 network grows</li>
          </ul>
          <p className="text-blue-800 font-semibold mt-3">
            Total Potential Commission: <strong>65%</strong> on every sale in your network!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Packages;
