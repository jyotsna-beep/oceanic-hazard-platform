import React from 'react';
import backgroundVideo from '../assets/VideoBackground.mp4'; 
import './VideoBackground.css'; // We'll create this next

const VideoBackground = () => {
  return (
    <div className="video-background-container">
      <video autoPlay loop muted>
        <source src={backgroundVideo} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoBackground;