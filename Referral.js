import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Referral = () => {
  const [userData, setUserData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [copied, setCopied] = useState(false);

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
          referralCode: userDoc.referralCode,
          earnings_total: userDoc.earnings_total || 0
        });
      }
    });

    // Fetch team members for stats
    const teamQuery = query(collection(db, 'team'), where('userId', '==', userId));
    const teamUnsubscribe = onSnapshot(teamQuery, (snapshot) => {
      const teamData = snapshot.docs.map(doc => doc.data());
      setTeamMembers(teamData);
    });

    return () => {
      userUnsubscribe();
      teamUnsubscribe();
    };
  }, []);

  const referralLink = `https://biluxe10.com/signup?ref=${userData?.referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const message = `Join Biluxe10 using my referral link and earn amazing rewards! 🚀\n\nGet started: ${referralLink}\n\n• 65% Total Commission\n• Multiple Income Streams\n• Passive Earnings`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareOnTelegram = () => {
    const message = `Join Biluxe10 using my referral link! 🎯\n\n${referralLink}\n\nEarn 65% commission on referrals!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  // Commission structure
  const commissionRates = [
    { 
      level: 'Direct (Level 1)', 
      rate: '50%', 
      description: 'From direct referrals',
      example: 'Friend joins → You get 50%',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      level: 'Passive (Level 2)', 
      rate: '10%', 
      description: 'From your team\'s referrals',
      example: 'Your referral invites someone → You get 10%',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      level: 'Ads Bonus (Level 3)', 
      rate: '5%', 
      description: 'Extended network bonus',
      example: 'Your team grows further → You get 5%',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  // Referral statistics
  const referralStats = {
    totalReferrals: teamMembers.length,
    activeReferrals: teamMembers.filter(m => m.status === 'active').length,
    directReferrals: teamMembers.filter(m => m.level === 1).length,
    totalEarned: userData?.earnings_total || 0
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Refer & Earn</h1>
          <p className="text-gray-600 mt-2">Invite friends and earn 65% total commission</p>
        </div>

        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🎯</div>
                <div>
                  <h3 className="text-xl font-semibold">Your Referral Link</h3>
                  <p className="text-indigo-100">Share this link to invite friends</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <motion.button
                  onClick={copyToClipboard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  {copied ? '✅ Copied!' : '📋 Copy Link'}
                </motion.button>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <div className="text-4xl font-bold">65%</div>
              <div className="text-indigo-200 text-sm">Total Commission</div>
            </div>
          </div>
        </motion.div>

        {/* Commission Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          {commissionRates.map((commission, index) => (
            <motion.div
              key={commission.level}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`bg-gradient-to-br ${commission.color} rounded-2xl p-6 text-white`}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">
                  {index === 0 ? '💰' : index === 1 ? '🌐' : '🚀'}
                </div>
                <h4 className="font-semibold text-lg mb-2">{commission.level}</h4>
                <div className="text-2xl font-bold mb-2">{commission.rate}</div>
                <p className="text-sm opacity-90 mb-3">{commission.description}</p>
                <p className="text-xs opacity-75">{commission.example}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Share Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Via</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              onClick={shareOnWhatsApp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-green-50 text-green-700 rounded-xl font-semibold hover:bg-green-100 transition-colors border border-green-200"
            >
              <div className="text-2xl mb-2">📱</div>
              WhatsApp
            </motion.button>
            
            <motion.button
              onClick={shareOnTelegram}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <div className="text-2xl mb-2">💬</div>
              Telegram
            </motion.button>
            
            <motion.button
              onClick={copyToClipboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="text-2xl mb-2">📧</div>
              Email
            </motion.button>
            
            <motion.button
              onClick={copyToClipboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-indigo-50 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-colors border border-indigo-200"
            >
              <div className="text-2xl mb-2">🔗</div>
              Other Apps
            </motion.button>
          </div>
        </motion.div>

        {/* Referral Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Referral Statistics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Referrals:</span>
                <span className="font-semibold text-gray-900">{referralStats.totalReferrals}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Active Referrals:</span>
                <span className="font-semibold text-green-600">{referralStats.activeReferrals}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Direct Referrals:</span>
                <span className="font-semibold text-blue-600">{referralStats.directReferrals}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Earned:</span>
                <span className="font-semibold text-green-600">₹{referralStats.totalEarned}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">How It Works</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">1</span>
                <span>Share your unique referral link with friends</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">2</span>
                <span>Friends sign up using your link and purchase any package</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">3</span>
                <span>You instantly earn <strong>50% direct commission</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">4</span>
                <span>When they refer others, you earn <strong>10% passive + 5% ads bonus</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">5</span>
                <span>Track earnings and withdraw anytime</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Pro Tip</h4>
              <p className="text-yellow-700">
                Share your link on social media, WhatsApp groups, and with friends to maximize your earnings. 
                The more people you refer, the more you earn through multiple levels!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Referral;
