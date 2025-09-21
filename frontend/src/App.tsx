import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserDashboard from './pages/UserDashboard'; // We'll create this soon

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;