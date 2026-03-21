

// import React, { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';


// // TypeScript interfaces
// interface HazardReport {
//     id: number;
//     image_name: string;
//     tag: string;
//     latitude: number;
//     longitude: number;
//     location_name: string;
//     submission_date: string;
// }

// interface ReportMapProps {
//     reports: HazardReport[];
// }

// // Colors for each tag
// const chartColors: { [key: string]: string } = {
//     "Rip Current": '#68d391',
//     "Floods": '#63b3ed',
//     "High/Low Tide": '#F6E05E',
//     "Wave Prediction": '#805AD5',
// };

// const ReportMap: React.FC<ReportMapProps> = ({ reports }) => {
//     const mapRef = useRef<HTMLDivElement & { mapInstance?: L.Map }>(null);

//     // Initialize map once
//     useEffect(() => {
//         if (mapRef.current && !mapRef.current.mapInstance) {
//             const map = L.map(mapRef.current).setView([0, 0], 2);
//             mapRef.current.mapInstance = map;

//             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//                 attribution: '&copy; OpenStreetMap contributors',
//             }).addTo(map);
//         }
//     }, []);

//     // Add/update markers whenever reports change
//     useEffect(() => {
//         const map = mapRef.current?.mapInstance;
//         if (!map) return;

//         // Remove existing circleMarkers
//         map.eachLayer(layer => {
//             if (layer instanceof L.CircleMarker) {
//                 map.removeLayer(layer);
//             }
//         });

//         // Filter valid reports
//         const validReports = reports.filter(
//             r => typeof r.latitude === 'number' && typeof r.longitude === 'number'
//         );

//         const markers: L.CircleMarker[] = [];

//         validReports.forEach(report => {
//             const color = chartColors[report.tag] || '#A0AEC0';

//             // Add circle marker
//             const marker = L.circleMarker([report.latitude, report.longitude], {
//                 radius: 10,
//                 color: color,
//                 fillColor: color,
//                 fillOpacity: 0.8,
//                 weight: 2,
//             }).addTo(map);

//             // Add popup
//             marker.bindPopup(`
//                 <div>
//                     <p><strong>Tag:</strong> ${report.tag}</p>
//                     <p><strong>Location:</strong> ${report.location_name}</p>
//                     <p><strong>Date:</strong> ${new Date(report.submission_date).toLocaleDateString()}</p>
//                 </div>
//             `);

//             markers.push(marker);
//         });

//         // Fit map bounds to markers
//         if (markers.length > 0) {
//             const group = L.featureGroup(markers);
//             map.fitBounds(group.getBounds(), { padding: [20, 20] });
//         }

//     }, [reports]);

//     return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
// };

// export default ReportMap;

// // src/components/ReportMap.tsx
// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";

// interface Report {
//   id: number;
//   tag: string;
//   latitude: number;
//   longitude: number;
//   location_name?: string;
//   submission_date: string;
// }

// src/components/ReportMap.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Report {
  id: number;
  image_name?: string;
  tag?: string;
  latitude: number;   // Already parsed as number
  longitude: number;  // Already parsed as number
  location_name?: string;
  submission_date: string;
}

const ReportMap: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/user/dashboard")
      .then(res => res.json())
      .then(data => {
        // Pre-process latitude and longitude to numbers
        const processedReports: Report[] = data.reports
          .map((r: any) => {
            const lat = parseFloat(r.latitude || "");
            const lng = parseFloat(r.longitude || "");
            if (isNaN(lat) || isNaN(lng)) return null; // skip invalid coordinates
            return { ...r, latitude: lat, longitude: lng };
          })
          .filter(Boolean) as Report[];

        setReports(processedReports);
      })
      .catch(err => console.error(err));
  }, []); // Run only once

  const getColorByTag = (tag?: string) => {
    switch(tag) {
      case "Rip Current": return "blue";
      case "Floods": return "red";
      case "High/Low Tide": return "orange";
      case "Wave Prediction": return "green";
      default: return "gray";
    }
  };

  return (
    <MapContainer center={[20, 77]} zoom={5} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {reports.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.latitude, r.longitude]}
          radius={8}
          color={getColorByTag(r.tag)}
        >
          <Popup>
            {r.tag} <br />
            {r.location_name || "Unknown location"} <br />
            Submitted on: {new Date(r.submission_date).toLocaleString()}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(ReportMap);
