import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

function AdminArtists() {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedArtist, setSelectedArtist] = useState(null);

    useEffect(() => {
        fetchArtists();
    }, [currentPage]);

    const fetchArtists = async () => {
        try {
            const response = await api.get(`/api/admin/artists?page=${currentPage}&search=${searchTerm}`);
            setArtists(response.data.artists);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch artists');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyArtist = async (userId) => {
        try {
            await api.post(`/api/admin/artists/${userId}/verify`);
            fetchArtists();
            toast.success('Artist verified successfully');
        } catch (error) {
            toast.error('Failed to verify artist');
        }
    };

    const handleRejectArtist = async (userId) => {
        try {
            await api.post(`/api/admin/artists/${userId}/reject`);
            fetchArtists();
            toast.success('Artist rejected successfully');
        } catch (error) {
            toast.error('Failed to reject artist');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchArtists();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Artist Verification</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="search"
                        placeholder="Search artists..."
                        className="px-4 py-2 rounded-lg border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Search
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted On</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {artists.map((artist) => (
                            <tr key={artist.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            className="h-10 w-10 rounded-full"
                                            src={artist.profilePic || "https://via.placeholder.com/40"}
                                            alt=""
                                        />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{artist.username}</div>
                                            <div className="text-sm text-gray-500">{artist.fullName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{artist.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        artist.isVerified 
                                            ? 'bg-green-100 text-green-800'
                                            : artist.isRejected
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {artist.isVerified ? 'Verified' : artist.isRejected ? 'Rejected' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(artist.submittedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setSelectedArtist(artist)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View
                                        </button>
                                        {!artist.isVerified && !artist.isRejected && (
                                            <>
                                                <button
                                                    onClick={() => handleVerifyArtist(artist.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => handleRejectArtist(artist.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded ${
                            currentPage === i + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Artist Detail Modal */}
            {selectedArtist && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Artist Details</h2>
                                <button
                                    onClick={() => setSelectedArtist(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <img
                                        src={selectedArtist.profilePic || "https://via.placeholder.com/128"}
                                        alt=""
                                        className="w-32 h-32 rounded-full"
                                    />
                                    <div className="ml-6">
                                        <h3 className="text-xl font-semibold">{selectedArtist.fullName}</h3>
                                        <p className="text-gray-600">@{selectedArtist.username}</p>
                                        <p className="text-gray-600">{selectedArtist.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Bio</h4>
                                    <p className="text-gray-600">{selectedArtist.bio}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Genre</h4>
                                    <p className="text-gray-600">{selectedArtist.genre}</p>
                                </div>
                                {selectedArtist.portfolio && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Portfolio</h4>
                                        <a 
                                            href={selectedArtist.portfolio}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            View Portfolio
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminArtists;