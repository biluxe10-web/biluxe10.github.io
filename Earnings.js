import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Earnings = () => {
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user ID (you'll need to implement auth)
    const userId = "current_user_id"; // Replace with actual user ID
    
    // Fetch user data from 'users' collection with EXACT fields
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const userUnsubscribe = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0].data();
        setUserData({
          // Your EXACT user fields
          uid: userDoc.uid,
          name: userDoc.name,
          email: userDoc.email,
          earnings_today: userDoc.earnings_today || 0,
          earnings_week: userDoc.earnings_week || 0,
          earnings_month: userDoc.earnings_month || 0,
          earnings_total: userDoc.earnings_total || 0,
          balance: userDoc.balance || 0,
          profilePic: userDoc.profilePic,
          membership: userDoc.membership,
          rank: userDoc.rank
        });
      }
    });

    // Fetch transactions from 'transactions' collection with EXACT fields
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const transactionsUnsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          // Your EXACT transaction fields
          transactionId: data.transactionId,
          userId: data.userId,
          type: data.type,           // "earning" / "withdrawal" / "bonus"
          amount: data.amount,
          date: data.date,
          status: data.status,       // "pending" / "completed" / "failed"
          source: data.source        // "Referral A", "Level Bonus", "Course Purchase"
        };
      });
      setTransactions(transactionsData);
      setLoading(false);
    });

    return () => {
      userUnsubscribe();
      transactionsUnsubscribe();
    };
  }, []);

  // Calculate earnings from actual transactions using EXACT types
  const calculateEarnings = () => {
    const earningTransactions = transactions.filter(t => t.type === 'earning' || t.type === 'bonus');
    
    const direct = earningTransactions.filter(t => t.source?.includes('Direct') || t.source?.includes('Level 1')).reduce((sum, t) => sum + t.amount, 0);
    const passive = earningTransactions.filter(t => t.source?.includes('Passive') || t.source?.includes('Level 2')).reduce((sum, t) => sum + t.amount, 0);
    const ads = earningTransactions.filter(t => t.source?.includes('Ads') || t.source?.includes('Bonus')).reduce((sum, t) => sum + t.amount, 0);
    
    return {
      direct: direct || 0,
      passive: passive || 0,
      ads: ads || 0,
      total: direct + passive + ads
    };
  };

  const earnings = calculateEarnings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-2">Track your income and commissions</p>
        </div>

        {/* Stats - Using EXACT user field names */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { title: "Today Earnings", amount: userData?.earnings_today || 0, color: "bg-green-500" },
            { title: "Weekly Earnings", amount: userData?.earnings_week || 0, color: "bg-blue-500" },
            { title: "Monthly Earnings", amount: userData?.earnings_month || 0, color: "bg-purple-500" },
            { title: "Total Balance", amount: userData?.balance || 0, color: "bg-orange-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 text-center"
            >
              <h3 className="text-gray-600 text-sm">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{stat.amount}</p>
            </motion.div>
          ))}
        </div>

        {/* Commission Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Commission Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: "Direct (50%)", amount: earnings.direct, desc: "From your direct referrals" },
              { type: "Passive (10%)", amount: earnings.passive, desc: "From your team's referrals" },
              { type: "Ads Bonus (5%)", amount: earnings.ads, desc: "Bonus from ads and activities" }
            ].map((item, index) => (
              <div key={item.type} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{item.type}</p>
                <p className="text-2xl font-bold text-green-600 my-2">₹{item.amount}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transactions with EXACT field names */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Your earnings will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.transactionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-green-500"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.source}</p>
                    <p className="text-sm text-gray-600 capitalize">{transaction.type} • {transaction.status}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.date?.toDate?.().toLocaleDateString() || 'Recent'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'earning' ? '+' : '-'}₹{transaction.amount}
                    </p>
                    <p className="text-sm text-gray-600">Transaction ID: {transaction.transactionId}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Earnings;
