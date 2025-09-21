import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Report.css';

// Fix for default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Define the type for your report data
interface ReportData {
  image: File | null;
  tag: string;
  latitude: string;
  longitude: string;
  locationName: string;
  submissionDate: string;
}

const Report = () => {
  const [reportData, setReportData] = useState<ReportData>({
    image: null,
    tag: '',
    latitude: '',
    longitude: '',
    locationName: '',
    submissionDate: new Date().toISOString()
  });

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
     const formData = new FormData();
  formData.append('image', reportData.image as Blob);
  formData.append('tag', reportData.tag);
  formData.append('latitude', reportData.latitude);
  formData.append('longitude', reportData.longitude);
  formData.append('locationName', reportData.locationName);
  formData.append('submissionDate', reportData.submissionDate);

  try {
    const response = await fetch('http://localhost:8000/submit_report/', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Report submitted successfully!', result);
      alert('Report submitted successfully!');
    } else {
      const errorText = await response.text();
      console.error('Failed to submit report:', response.status, errorText);
      alert('Failed to submit report. Please check the console for details.');
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error. Make sure your backend server is running.');
  }
    console.log(reportData);
  };
  
  // New function to handle 'Use Current Location' button click
  const handleCurrentLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setReportData(prevData => ({
            ...prevData,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location. Please select it manually on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // This component handles the map clicks and updates the state
  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setReportData(prevData => ({ ...prevData, latitude: e.latlng.lat.toString(), longitude: e.latlng.lng.toString() }));
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    return reportData.latitude ? (
      <Marker position={[parseFloat(reportData.latitude), parseFloat(reportData.longitude)]}>
        <Popup>Your selected location</Popup>
      </Marker>
    ) : null;
  }

  return (
    <div className="report-container">
      <h2>Submit a Hazard Report</h2>
      <form onSubmit={handleSubmit}>

        <div className="form-group">
            <label htmlFor="image-upload">Upload Image:</label>
            <input
                type="file"
                id="image-upload"
                accept="image/*,video/*"
                onChange={(e) => setReportData({ ...reportData, image: e.target.files?.[0] || null })}
                required
            />
        </div>

        <div className="form-group">
            <label htmlFor="hazard-tag">Hazard Type:</label>
            <select
                id="hazard-tag"
                value={reportData.tag}
                onChange={(e) => setReportData({ ...reportData, tag: e.target.value })}
                required
            >
                <option value="">Select a hazard</option>
                <option value="Rip Current">Rip Current</option>
                <option value="Floods">Floods</option>
                <option value="High/Low Tide">High/Low Tide</option>
                <option value="Wave Prediction">Wave Prediction</option>
            </select>
        </div>

        <div className="form-group">
            <label htmlFor="location-name">Location Name:</label>
            <input
                type="text"
                id="location-name"
                value={reportData.locationName}
                onChange={(e) => setReportData({ ...reportData, locationName: e.target.value })}
                placeholder="e.g., Visakhapatnam Beach"
            />
            <button type="button" onClick={handleCurrentLocationClick}>Use Current Location</button>
        </div>

        <div className="form-group">
          <label>Select Location on Map:</label>
          <MapContainer center={[20.297, 85.827]} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
        </div>

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default Report;