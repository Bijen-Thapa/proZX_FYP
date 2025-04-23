import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

function AdminPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, [currentPage]);

    const fetchPosts = async () => {
        try {
            const response = await api.get(`/api/admin/posts?page=${currentPage}&search=${searchTerm}`);
            setPosts(response.data.posts);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await api.delete(`/api/admin/posts/${postId}`);
                fetchPosts();
                toast.success('Post deleted successfully');
            } catch (error) {
                toast.error('Failed to delete post');
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchPosts();
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="search"
                    placeholder="Search posts..."
                    className="flex-1 px-4 py-2 rounded-lg border"
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

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Post Cover/Audio Preview */}
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                            {post.cover_pic_url ? (
                                <img
                                    src={post.cover_pic_url}
                                    alt={post.title}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Post Info */}
                        <div className="p-4">
                            <div className="flex items-center mb-2">
                                <img
                                    src={post.user.profilePic || "https://via.placeholder.com/32"}
                                    alt={post.user.username}
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                                <span className="text-sm font-medium">{post.user.username}</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{post.description}</p>
                            
                            {/* Stats */}
                            <div className="flex justify-between text-sm text-gray-500 mb-4">
                                <span>👍 {post.likes}</span>
                                <span>💬 {post.comments}</span>
                                <span>👁️ {post.views}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setSelectedPost(post)}
                                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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

            {/* Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            {selectedPost.cover_pic_url && (
                                <img
                                    src={selectedPost.cover_pic_url}
                                    alt={selectedPost.title}
                                    className="w-full rounded-lg mb-4"
                                />
                            )}
                            <p className="text-gray-600 mb-4">{selectedPost.description}</p>
                            {selectedPost.audio_url && (
                                <audio controls className="w-full mb-4">
                                    <source src={selectedPost.audio_url} type="audio/mpeg" />
                                </audio>
                            )}
                            <div className="text-sm text-gray-500">
                                <p>Posted by: {selectedPost.user.username}</p>
                                <p>Posted on: {new Date(selectedPost.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPosts;