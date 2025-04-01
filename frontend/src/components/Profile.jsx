import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AudioPlayer from './AudioPlayer';

function Profile() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);

    const handleFollow = async () => {
        try {
            await axios.post(`http://localhost:3000/user/follow/${profile.userID}`);
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileRes = await axios.get(`http://localhost:3000/user/profile/${username}`);
                setProfile(profileRes.data.profile);
                
                const postsRes = await axios.get(`http://localhost:3000/post/user/${profileRes.data.profile.userID}`);
                setPosts(postsRes.data.posts);
                
                const followStatus = await axios.get(`http://localhost:3000/user/follow/status/${profileRes.data.profile.userID}`);
                setIsFollowing(followStatus.data.isFollowing);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, [username]);

    return (
        <div className="max-w-4xl mx-auto p-4">
            {profile && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center gap-6">
                        <img 
                            src={profile.profile_pic || '/default-avatar.png'}
                            className="w-32 h-32 rounded-full"
                        />
                        <div>
                            <h1 className="text-2xl font-bold">{profile.username}</h1>
                            <div className="mt-2 flex gap-4">
                                <span>{profile.followers_count} Followers</span>
                                <span>{profile.following_count} Following</span>
                            </div>
                            <button 
                                onClick={handleFollow}
                                className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-full"
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {posts.map(post => (
                    <div key={post.contentID} className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center mb-4">
                            <img 
                                src={profile.profile_pic || '/default-avatar.png'} 
                                className="w-8 h-8 rounded-full mr-3"
                                alt={profile.username}
                            />
                            <span className="font-medium">{profile.username}</span>
                        </div>
                        
                        {post.audioID && (
                            <AudioPlayer 
                                audioUrl={`http://localhost:3000/post/stream/${post.audioID}`}
                                title={post.audio_name}
                                waveformUrl={`http://localhost:3000/post/waveform/${post.audioID}`}
                            />
                        )}
                        
                        <p className="mt-3 text-gray-700">{post.caption}</p>
                        
                        <div className="mt-4 flex items-center gap-4">
                            <button className="text-gray-600 hover:text-blue-600">
                                ♥ {post.vote || 0}
                            </button>
                            <button className="text-gray-600 hover:text-blue-600">
                                ↗ Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Profile;