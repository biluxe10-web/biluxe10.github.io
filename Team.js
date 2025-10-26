import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [activeLevel, setActiveLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = "current_user_id"; // Replace with actual user ID
    
    // Fetch user data
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const userUnsubscribe = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0].data();
        setUserData({
          uid: userDoc.uid,
          name: userDoc.name,
          referralCode: userDoc.referralCode
        });
      }
    });

    // Fetch team members with EXACT fields
    const teamQuery = query(
      collection(db, 'team'),
      where('userId', '==', userId)
    );

    const teamUnsubscribe = onSnapshot(teamQuery, (snapshot) => {
      const teamData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          memberId: data.memberId,
          memberName: data.memberName,
          memberEmail: data.memberEmail,
          joinDate: data.joinDate,
          status: data.status, // "active" / "pending"
          level: data.level // 1 (direct), 2, 3
        };
      });
      setTeamMembers(teamData);
      setLoading(false);
    });

    return () => {
      userUnsubscribe();
      teamUnsubscribe();
    };
  }, []);

  // Calculate team statistics
  const teamStats = {
    level1: teamMembers.filter(m => m.level === 1).length,
    level2: teamMembers.filter(m => m.level === 2).length,
    level3: teamMembers.filter(m => m.level === 3).length,
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    pending: teamMembers.filter(m => m.status === 'pending').length
  };

  // Commission rates based on level
  const commissionRates = {
    1: '50%',
    2: '10%', 
    3: '5%'
  };

  const filteredMembers = teamMembers.filter(member => member.level === activeLevel);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team data...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
          <p className="text-gray-600 mt-2">Manage your referral network</p>
        </div>

        {/* Team Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: 'Total Team', value: teamStats.total, icon: '👥', color: 'bg-blue-500' },
            { label: 'Active Members', value: teamStats.active, icon: '✅', color: 'bg-green-500' },
            { label: 'Pending', value: teamStats.pending, icon: '⏳', color: 'bg-yellow-500' },
            { label: 'Total Earnings', value: '₹8,240', icon: '💰', color: 'bg-purple-500' }
          ].map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center text-white text-xl mx-auto mb-2`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Level Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(level => (
              <motion.button
                key={level}
                onClick={() => setActiveLevel(level)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  activeLevel === level
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {level === 1 ? '👥' : level === 2 ? '🌐' : '🚀'}
                  </div>
                  <h4 className="font-semibold">Level {level}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {teamStats[`level${level}`] || 0} members
                  </p>
                  <p className="text-sm font-medium text-green-600 mt-1">
                    Commission: {commissionRates[level]}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Team Members List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Level {activeLevel} Team Members
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredMembers.length} members • Commission: {commissionRates[activeLevel]}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Active: {filteredMembers.filter(m => m.status === 'active').length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Pending: {filteredMembers.filter(m => m.status === 'pending').length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredMembers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">
                  {activeLevel === 1 ? '👥' : activeLevel === 2 ? '🌐' : '🚀'}
                </div>
                <p className="text-gray-500 text-lg">
                  No team members at Level {activeLevel}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {activeLevel === 1 
                    ? 'Start inviting people to build your team!' 
                    : 'Team members will appear here when your referrals invite others'
                  }
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member, index) => (
                  <motion.div
                    key={member.memberId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.memberName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {member.memberName || 'Unknown User'}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {member.memberEmail}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Join Date:</span>
                        <span className="text-gray-900">
                          {member.joinDate?.toDate?.().toLocaleDateString() || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.status}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-semibold text-indigo-600">
                          {member.level}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission:</span>
                        <span className="font-semibold text-green-600">
                          {commissionRates[member.level]}
                        </span>
                      </div>
                    </div>

                    {member.status === 'pending' && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-800 text-center">
                          ⏳ Waiting for activation
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Referral Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Grow Your Team</h3>
              <p className="text-indigo-100">
                Invite friends and earn commissions on every level!
              </p>
              <div className="mt-2 text-sm text-indigo-200">
                • Level 1 (Direct): 50% commission<br/>
                • Level 2 (Indirect): 10% commission<br/>
                • Level 3 (Bonus): 5% commission
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              📤 Invite Friends
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Team;
