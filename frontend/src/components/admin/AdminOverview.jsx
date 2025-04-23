import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';

function AdminOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalArtists: 0,
        totalPosts: 0,
        totalAudios: 0,
        newUsersThisMonth: 0,
        newArtistsThisMonth: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/api/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500">
                    +{stats.newUsersThisMonth} this month
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Total Artists</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalArtists}</p>
                <p className="text-sm text-gray-500">
                    +{stats.newArtistsThisMonth} this month
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Total Posts</h3>
                <p className="text-3xl font-bold text-green-600">{stats.totalPosts}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Total Audios</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalAudios}</p>
            </div>
        </div>
    );
}

export default AdminOverview;