import React, { useState, useEffect, useRef, useCallback } from 'react';
import AudioPost from './AudioPost';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [viewedPosts, setViewedPosts] = useState(new Set());
    
    const observer = useRef();
    const lastPostRef = useCallback(node => {
        if (loading) return;
        
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setViewedPosts(prev => {
                    const newSet = new Set(prev);
                    posts.slice(-3).forEach(post => newSet.add(post.contentID));
                    return newSet;
                });
                
                if (viewedPosts.size >= posts.length - 2) {
                    setPage(prevPage => prevPage + 1);
                }
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore, posts, viewedPosts]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/post/feed?page=${page}&limit=5`);
            console.log('Feed Response:', response.data); // Debug response
            
            if (response.data.feed && Array.isArray(response.data.feed)) {
                setPosts(prev => [...prev, ...response.data.feed]);
                setHasMore(response.data.hasMore);
            } else {
                toast.error('Invalid feed data format');
            }
        } catch (error) {
            console.error('Feed Error:', error); // Debug error
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const handleVote = async (contentID) => {
        try {
            await api.post(`/api/post/upvote/${contentID}`);
            setPosts(prev => 
                prev.map(post => 
                    post.contentID === contentID 
                        ? { ...post, vote_count: post.vote_count + 1 }
                        : post
                )
            );
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    return (
        <div className="space-y-6 py-4">
            {posts.map((post, index) => (
                <div
                    key={post.contentID}
                    ref={index === posts.length - 1 ? lastPostRef : null}
                >
                    <AudioPost
                        post={post}
                        onVote={() => handleVote(post.contentID)}
                    />
                </div>
            ))}
            {loading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
}

export default Feed;