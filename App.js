import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Earnings from './pages/Earnings';
import Withdrawal from './pages/Withdrawal';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Team from './pages/Team';
import Referral from './pages/Referral';
import Packages from './pages/Packages';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/withdrawal" element={<Withdrawal />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/support" element={<Support />} />
          <Route path="/team" element={<Team />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/packages" element={<Packages />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
