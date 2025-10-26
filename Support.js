import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [userData, setUserData] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('open');

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
          email: userDoc.email
        });
      }
    });

    // Fetch support tickets with EXACT fields
    const ticketsQuery = query(
      collection(db, 'support_tickets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const ticketsUnsubscribe = onSnapshot(ticketsQuery, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ticketId: data.ticketId,
          userId: data.userId,
          subject: data.subject,
          message: data.message,
          status: data.status, // "open" / "resolved"
          reply: data.reply || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });
      setTickets(ticketsData);
    });

    return () => {
      userUnsubscribe();
      ticketsUnsubscribe();
    };
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        ticketId: `TKT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: userData.uid,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
        reply: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setSubject('');
      setMessage('');
      alert('Ticket submitted successfully! Our team will respond within 24 hours.');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Error submitting ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    activeTab === 'all' ? true : ticket.status === activeTab
  );

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
          <p className="text-gray-600 mt-2">Get help from our support team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* New Ticket Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Ticket</h3>
              
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Ticket'
                  )}
                </motion.button>
              </form>

              {/* Support Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Support Information</h4>
                <p className="text-sm text-blue-800">
                  • Response time: 24 hours<br/>
                  • Email: support@biluxe10.com<br/>
                  • Hours: 9AM - 6PM
                </p>
              </div>
            </div>
          </motion.div>

          {/* Ticket History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              {/* Header with Stats */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Support Tickets</h3>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Open: {stats.open}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Resolved: {stats.resolved}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span>Total: {stats.total}</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mt-4">
                  {[
                    { key: 'open', label: 'Open', count: stats.open },
                    { key: 'resolved', label: 'Resolved', count: stats.resolved },
                    { key: 'all', label: 'All Tickets', count: stats.total }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.key
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              <div className="p-6">
                {filteredTickets.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">🛟</div>
                    <p className="text-gray-500 text-lg">
                      {activeTab === 'open' ? 'No open tickets' : 
                       activeTab === 'resolved' ? 'No resolved tickets' : 
                       'No support tickets yet'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {activeTab === 'open' ? 'All your issues have been resolved!' : 
                       'Create your first support ticket to get help'}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets.map((ticket, index) => (
                      <motion.div
                        key={ticket.ticketId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                ticket.status === 'open' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Ticket ID: <span className="font-mono">{ticket.ticketId}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Created: {ticket.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                            </p>
                          </div>
                          
                          <div className="text-sm text-gray-500 text-right">
                            {ticket.updatedAt && (
                              <p>Updated: {ticket.updatedAt?.toDate?.().toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>

                        {/* User Message */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Your Message:</p>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                          </div>
                        </div>

                        {/* Admin Reply */}
                        {ticket.reply && (
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-2">Admin Reply:</p>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <p className="text-green-800 whitespace-pre-wrap">{ticket.reply}</p>
                              <p className="text-xs text-green-600 mt-2">
                                Last updated: {ticket.updatedAt?.toDate?.().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {!ticket.reply && ticket.status === 'open' && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              ⏳ Our support team is reviewing your ticket. You'll receive a response soon.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Support;
