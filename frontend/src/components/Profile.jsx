import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import AudioPost from './AudioPost';
import EditProfileModal from './EditProfileModal';
import ArtistVerificationModal from './ArtistVerificationModal';
import { FaFacebook, FaInstagram, FaTwitter, FaSoundcloud, FaYoutube } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Profile() {
    const { username } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        try {
            // First get userID from username
            const userResponse = await api.get(`/api/user/getid`);
            const userId = userResponse.data.userid;
            
            // Then fetch profile using userID
            const response = await api.get(`/api/profile/${userId}`);
            setProfile(response.data.profile);
            setPosts(response.data.posts);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            const response = await api.post(`/api/profile/follow/${profile.userid}`);
            setProfile(prev => ({
                ...prev,
                is_following: !prev.is_following,
                followers_count: prev.followers_count + (prev.is_following ? -1 : 1)
            }));
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Failed to follow/unfollow');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 text-black min-h-[100vh]">
            {/* Profile Header */}
            <div className="bg-white text-black rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-6">
                    <img 
                        src={profile?.profile_picture_url || '/default-avatar.png'} 
                        alt={profile?.username}
                        className="w-32 h-32 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold">{profile?.username}</h1>
                            {profile?.is_verified && (
                                <span className="text-blue-500">✓</span>
                            )}
                        </div>
                        {profile?.stage_name && (
                            <p className="text-gray-600">{profile.stage_name}</p>
                        )}
                        <div className="flex gap-4 mt-2">
                            <span>{profile?.followers_count} followers</span>
                            <span>{profile?.following_count} following</span>
                        </div>
                        <div className="flex gap-4 mt-4">
                            {user?.id === profile?.userid ? (
                                <>
                                    <button 
                                        onClick={() => setShowEditModal(true)}
                                        className="bg-gray-200 px-4 py-2 rounded"
                                    >
                                        Edit Profile
                                    </button>
                                    {!profile?.artistid && (
                                        <button 
                                            onClick={() => setShowVerificationModal(true)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded"
                                        >
                                            Become an Artist
                                        </button>
                                    )}
                                </>
                            ) : (
                                <button 
                                    onClick={handleFollow}
                                    className={`px-4 py-2 rounded ${
                                        profile?.is_following 
                                            ? 'bg-gray-200' 
                                            : 'bg-blue-500 text-white'
                                    }`}
                                >
                                    {profile?.is_following ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <p className="mt-4">{profile?.bio}</p>
                <div className="flex gap-4 mt-4">
                    {profile?.facebook_url && (
                        <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer">
                            <FaFacebook className="text-2xl text-gray-600" />
                        </a>
                    )}
                    {/* Add other social media icons similarly */}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b mb-6">
                <div className="flex gap-6">
                    <button 
                        className={`py-2 px-4 ${activeTab === 'posts' ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Posts
                    </button>
                    <button 
                        className={`py-2 px-4 ${activeTab === 'playlists' ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab('playlists')}
                    >
                        Playlists
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'posts' && (
                <div className="space-y-6">
                    {posts.map(post => (
                        <AudioPost key={post.contentid} post={post} />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showEditModal && (
                <EditProfileModal 
                    profile={profile}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={fetchProfile}
                />
            )}
            {showVerificationModal && (
                <ArtistVerificationModal 
                    onClose={() => setShowVerificationModal(false)}
                    onVerified={fetchProfile}
                />
            )}
        </div>
    );
}

export default Profile;