import React from 'react';
import Report from '../pages/Report';
import Navbar from '../components/Navbar';
import VideoBackground from '../components/VideoBackground';
import './HomePage.css'; // Importing the CSS file

const HomePage = () => {
  return (
    <div className="home-page-container">
      <VideoBackground />
      <Navbar />
      <div className="content-container">
        <Report />
      </div>
    </div>
  );
};

export default HomePage;