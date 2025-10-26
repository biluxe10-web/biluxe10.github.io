import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to Biluxe10</h1>
          <p className="text-gray-600 mt-2">Your Marketing Dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { title: "Today's Earnings", amount: "₹1,250", color: "bg-green-500" },
            { title: "Weekly Earnings", amount: "₹8,450", color: "bg-blue-500" },
            { title: "Monthly Earnings", amount: "₹23,800", color: "bg-purple-500" },
            { title: "Total Balance", amount: "₹15,200", color: "bg-orange-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-gray-600 text-sm">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.amount}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
