import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Withdrawal = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [userData, setUserData] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = "current_user_id"; // Replace with actual user ID
    
    // Fetch user data with EXACT fields
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const userUnsubscribe = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0].data();
        setUserData({
          uid: userDoc.uid,
          name: userDoc.name,
          balance: userDoc.balance || 0,
          bankAccount: userDoc.bankAccount || '',
          ifsc: userDoc.ifsc || '',
          upi: userDoc.upi || ''
        });
      }
    });

    // Fetch withdrawals with EXACT fields
    const withdrawalsQuery = query(
      collection(db, 'withdrawals'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const withdrawalsUnsubscribe = onSnapshot(withdrawalsQuery, (snapshot) => {
      const withdrawalsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          requestId: data.requestId,
          userId: data.userId,
          name: data.name,
          amount: data.amount,
          method: data.method, // "Bank" / "UPI"
          accountDetails: data.accountDetails,
          date: data.date,
          status: data.status, // "pending" / "approved" / "rejected"
          approvedBy: data.approvedBy || '',
          approvedAt: data.approvedAt || null
        };
      });
      setWithdrawals(withdrawalsData);
    });

    return () => {
      userUnsubscribe();
      withdrawalsUnsubscribe();
    };
  }, []);

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    
    if (!amount || amount > userData?.balance) {
      alert('Invalid amount or insufficient balance');
      return;
    }

    if (method === 'UPI' && !userData.upi) {
      alert('Please set your UPI ID in Profile first');
      return;
    }

    if (method === 'Bank' && (!userData.bankAccount || !userData.ifsc)) {
      alert('Please set your Bank details in Profile first');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'withdrawals'), {
        requestId: `WD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userData.uid,
        name: userData.name,
        amount: parseFloat(amount),
        method: method,
        accountDetails: method === 'UPI' ? userData.upi : `Bank: ${userData.bankAccount} | IFSC: ${userData.ifsc}`,
        date: new Date(),
        status: 'pending',
        approvedBy: '',
        approvedAt: null
      });

      setAmount('');
      alert('Withdrawal request submitted successfully!');
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('Error submitting withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal</h1>
          <p className="text-gray-600 mt-2">Request your earnings payout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Withdrawal Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Withdrawal</h3>
              
              {/* Balance Info */}
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  Available Balance: <span className="font-bold">₹{userData?.balance || 0}</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Minimum withdrawal: ₹100
                </p>
              </div>

              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter amount"
                    min="100"
                    max={userData?.balance}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="UPI">UPI Transfer</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>

                {/* Account Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Payout to:</p>
                  <p className="text-sm text-gray-600">
                    {method === 'UPI' 
                      ? (userData?.upi ? `UPI: ${userData.upi}` : 'UPI ID not set')
                      : (userData?.bankAccount ? `Bank: ****${userData.bankAccount.slice(-4)}` : 'Bank details not set')
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Update in Profile if needed
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !userData?.balance || userData.balance < 100}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Request Withdrawal'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Withdrawal History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Withdrawal History</h3>
              </div>
              
              <div className="overflow-x-auto">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💳</div>
                    <p className="text-gray-500 text-lg">No withdrawal requests yet</p>
                    <p className="text-sm text-gray-400">Your withdrawal history will appear here</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {withdrawals.map((withdrawal, index) => (
                        <motion.tr
                          key={withdrawal.requestId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {withdrawal.date?.toDate?.().toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            ₹{withdrawal.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {withdrawal.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                              withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {withdrawal.requestId}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Withdrawal;
