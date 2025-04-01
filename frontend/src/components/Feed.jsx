import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AudioPlayer from './AudioPlayer';

function Feed() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/post/feed');
                setPosts(response.data.feed);
            } catch (error) {
                console.error('Error fetching feed:', error);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="max-w-3xl mx-auto p-4">
            {posts.map(post => (
                <div key={post.contentID} className="bg-white rounded-lg shadow-md mb-6 p-4">
                    <div className="flex items-center mb-4">
                        <img src={post.profile_pic || '/default-avatar.png'} 
                             className="w-10 h-10 rounded-full mr-3" />
                        <span className="font-semibold">{post.username}</span>
                    </div>
                    
                    {post.audioID && (
                        <AudioPlayer 
                            audioUrl={`http://localhost:3000/post/stream/${post.audioID}`}
                            title={post.audio_name}
                        />
                    )}
                    
                    <p className="mt-3 text-gray-700">{post.caption}</p>
                    
                    <div className="mt-4 flex items-center gap-4">
                        <button className="text-gray-600 hover:text-blue-600">
                            Upvote ({post.vote})
                        </button>
                        <button className="text-gray-600 hover:text-blue-600">
                            Share
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Feed;