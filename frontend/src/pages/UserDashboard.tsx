import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import VideoBackground from '../components/VideoBackground';
import Navbar from '../components/Navbar';
import ReportMap from '../components/ReportMap';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title,
);

// TypeScript interfaces to match the database schema
interface HazardReport {
    id: number;
    image_name: string;
    tag: string;
    latitude: number;
    longitude: number;
    location_name: string;
    submission_date: string;
}

interface DashboardApiResponse {
    reports: HazardReport[];
    locations: { latitude: number; longitude: number }[];
    event_tag_counts: { tag: string; count: number }[];
}

const UserDashboard: React.FC = () => {
    const [reports, setReports] = useState<HazardReport[]>([]);
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // A more harmonious and modern color palette
    const chartColors = [
        '#68d391', // Emerald
        '#63b3ed', // Blue
        '#F6E05E', // Yellow
        '#805AD5', // Purple
        '#ED8936', // Orange
        '#4FD1C5', // Cyan
        '#FC8181', // Red
        '#D53F8C', // Pink
        '#A0AEC0', // Grey
    ];

    const chartBorderColors = [
        '#48bb78',
        '#4299e1',
        '#ECC94B',
        '#6B46C1',
        '#DD6B20',
        '#38B2AC',
        '#E53E3E',
        '#B83280',
        '#718096',
    ];

    const allHazardTags = ["Rip Current", "Floods", "High/Low Tide", "Wave Prediction"];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/user/dashboard');
                if (!response.ok) throw new Error('Network response was not ok');

                const data: DashboardApiResponse = await response.json();

                const mappedReports: HazardReport[] = data.reports.map((r) => ({
                    id: r.id,
                    image_name: r.image_name,
                    tag: r.tag,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    location_name: r.location_name,
                    submission_date: r.submission_date,
                }));

                setReports(mappedReports);

                const tagCountsMap = new Map(data.event_tag_counts.map(item => [item.tag, item.count]));

                const chartLabels = allHazardTags;
                const chartValues = allHazardTags.map(tag => tagCountsMap.get(tag) || 0);

                setChartData({
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Number of Reports',
                            data: chartValues,
                            backgroundColor: chartLabels.map((_, index) => chartColors[index % chartColors.length]),
                            borderColor: chartLabels.map((_, index) => chartBorderColors[index % chartBorderColors.length]),
                            borderWidth: 2,
                        },
                    ],
                });

                setLoading(false);
            } catch (err: any) {
                setError("Failed to fetch dashboard data. Ensure the backend server is running.");
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
      
        <div className="bg-gray-900 min-h-screen text-gray-100 py-8 px-4 sm:px-6 lg:px-8 mt-20 ml-[220px] max-w-6xl mx-auto rounded-2xl shadow-lg">
          <VideoBackground/>
          <Navbar/>
            <main className="w-full max-w-5xl space-y-8">
                {/* Recent Reports Table */}
                <div className="bg-black bg-opacity-70 rounded-xl shadow-lg p-6 border border-gray-400">
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-500 pb-2">
                        Recent Hazard Reports
                    </h2>
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <p className="text-teal-400 text-lg font-bold">Loading...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400">{error}</div>
                    ) : (
                        <div className="overflow-x-auto overflow-y-auto max-h-96 custom-scrollbar">
                            <table className="min-w-full table-auto border border-gray-500">
                                <thead>
                                    <tr className="bg-gray-700 text-white uppercase text-sm leading-normal font-bold">
                                        <th className="py-3 px-6 text-center border border-gray-500">ID</th>
                                        <th className="py-3 px-6 text-center border border-gray-500">Image Name</th>
                                        <th className="py-3 px-6 text-center border border-gray-500">Tag</th>
                                        <th className="py-3 px-6 text-center border border-gray-500">Latitude</th>
                                        <th className="py-3 px-6 text-center border border-gray-500">Longitude</th>
                                        <th className="py-3 px-6 text-center border border-gray-500">Location Name</th>
                                        <th className="py-3 px-6 text-center border border-gray-500">Submission Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-100 text-sm font-medium">
                                    {reports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className="border-b border-gray-600 hover:bg-gray-700"
                                        >
                                            <td className="py-3 px-6 text-center">{report.id}</td>
                                            <td className="py-3 px-6 text-center">{report.image_name}</td>
                                            <td className="py-3 px-6 text-center">{report.tag}</td>
                                            <td className="py-3 px-6 text-center">{report.latitude}</td>
                                            <td className="py-3 px-6 text-center">{report.longitude}</td>
                                            <td className="py-3 px-6 text-center">{report.location_name}</td>
                                            <td className="py-3 px-6 text-center">
                                                {new Date(report.submission_date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="bg-black bg-opacity-70 rounded-xl shadow-lg p-6 border border-gray-400 flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-white border-b border-gray-500 pb-2 w-full text-center">
                        Hazard Type Breakdown
                    </h2>
                    <p className="text-sm text-gray-400 mb-4 text-center">Distribution of reported hazard types.</p>
                    <div className="h-96 w-full max-w-lg flex items-center justify-center">
                        {chartData ? (
                            <Pie
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: "right" as const,
                                            labels: { color: "white", font: { weight: "bold" } },
                                        },
                                        title: {
                                            display: true,
                                            text: "Reports by Hazard Type",
                                            color: "white",
                                            font: { size: 18, weight: "bold" },
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    const label = context.label || '';
                                                    const value = context.parsed;
                                                    const total = context.dataset.data.reduce((sum, current) => sum + current, 0);
                                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                                                    return `${label}: ${value} reports (${percentage})`;
                                                }
                                            }
                                        }
                                    },
                                }}
                            />
                        ) : (
                            <p className="text-gray-400 text-center mt-20">No data available</p>
                        )}
                    </div>
                </div>
                
        

        {/* Map Section */}
        {/* <div className="bg-black bg-opacity-70 rounded-xl shadow-lg p-6 border border-gray-600 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white border-b border-gray-500 pb-2 w-full text-center">
                Report Locations
            </h2>
            <p className="text-sm text-gray-500 mb-4 text-center">Display of all reported locations on a map.</p>
            <div className="w-full h-96 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-teal-400 text-lg font-bold">Loading map data...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-full text-red-400">{error}</div>
                ) : (
                    <ReportMap reports={reports} />
                )}
            </div>
        </div> */}
    <div className="bg-black bg-opacity-70 rounded-xl shadow-lg p-6 border border-gray-600 flex flex-col items-center w-full">
  <h2 className="text-2xl font-bold text-white border-b border-gray-500 pb-2 w-full text-center">
    Report Locations
  </h2>
  <p className="text-sm text-gray-500 mb-4 text-center">
    Display of all reported locations on a map.
  </p>
  
  <div className="w-full h-96 rounded-lg overflow-hidden"> {/* <-- fixed height here */}
    {loading ? (
      <div className="flex justify-center items-center h-full">
        <p className="text-teal-400 text-lg font-bold">Loading map data...</p>
      </div>
    ) : error ? (
      <div className="flex justify-center items-center h-full text-red-400">{error}</div>
    ) : (
      <ReportMap /> 
    )}
  </div>
</div>

            </main>
        </div>
        
    
    );
};

export default UserDashboard;
