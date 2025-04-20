import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { Modal } from './Modal';
import { formatTime } from '../utils/timeFormat';

// Global audio player reference
let currentlyPlaying = null;

function AudioPost({ post, onVote }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showWaveform, setShowWaveform] = useState(!post.cover_pic_url);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (showWaveform && post.audio_url) {
            wavesurfer.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#4a5568',
                progressColor: '#2b6cb0',
                cursorColor: '#2b6cb0',
                barWidth: 2,
                barRadius: 3,
                responsive: true,
                height: 100,
                barGap: 3
            });

            wavesurfer.current.load(post.audio_url);

            wavesurfer.current.on('ready', () => {
                setDuration(wavesurfer.current.getDuration());
            });

            wavesurfer.current.on('audioprocess', () => {
                setCurrentTime(wavesurfer.current.getCurrentTime());
            });

            wavesurfer.current.on('error', () => {
                toast.error('Failed to load audio');
                setShowWaveform(true);
            });

            return () => wavesurfer.current.destroy();
        }
    }, [showWaveform, post.audio_url]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                handlePlayPause();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handlePlayPause = () => {
        if (currentlyPlaying && currentlyPlaying !== wavesurfer.current) {
            currentlyPlaying.pause();
        }
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
            setIsPlaying(!isPlaying);
            currentlyPlaying = isPlaying ? null : wavesurfer.current;
        }
    };

    const handleShare = async (type) => {
        try {
            if (type === 'profile') {
                await api.post(`/api/post/share/${post.contentID}`);
                toast.success('Shared to your profile');
            } else if (type === 'copy') {
                const link = `${window.location.origin}/post/${post.contentID}`;
                await navigator.clipboard.writeText(link);
                toast.success('Link copied to clipboard');
            }
        } catch (err) {
            toast.error('Failed to share post');
        }
    };

    const loadComments = async () => {
        try {
            setLoadingComments(true);
            const response = await api.get(`/api/post/${post.contentID}/comments`);
            setComments(response.data.comments);
        } catch (err) {
            toast.error('Failed to load comments');
        } finally {
            setLoadingComments(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
            <div className="flex items-center mb-4">
                <img 
                    src={post.profile_pic_url || '/default-avatar.png'} 
                    alt={post.username}
                    className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                    <h3 className="font-semibold">{post.username}</h3>
                    <p className="text-sm text-gray-500">
                        {new Date(post.timestamp).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-700 mb-4">{post.description}</p>

            {post.audio_url && (
                <div className="mb-4">
                    {post.cover_pic_url && !showWaveform ? (
                        <img 
                            src={post.cover_pic_url} 
                            alt="Cover"
                            className="w-full h-48 object-cover rounded"
                        />
                    ) : (
                        <div ref={waveformRef} className="w-full" />
                    )}
                    
                    <div className="flex items-center mt-4">
                        <button 
                            onClick={handlePlayPause}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
                        
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="ml-4"
                        />
                        
                        <button
                            onClick={() => setShowWaveform(!showWaveform)}
                            className="ml-4 text-blue-500"
                        >
                            Toggle Waveform
                        </button>
                    </div>
                </div>
            )}

            <p className="text-gray-800 mb-4">{post.caption}</p>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={handleVote}
                        className="flex items-center text-gray-600 hover:text-blue-500"
                    >
                        <span>▲</span>
                        <span className="ml-1">{post.vote_count}</span>
                    </button>
                    
                    <button className="text-gray-600 hover:text-blue-500">
                        💬 {post.comment_count}
                    </button>
                    
                    <button className="text-gray-600 hover:text-blue-500">
                        Share
                    </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Share options */}
            <div className="flex mt-4 space-x-4">
                <button 
                    onClick={() => handleShare('profile')}
                    className="text-gray-600 hover:text-blue-500 transition-colors"
                >
                    Share to Profile
                </button>
                <button 
                    onClick={() => handleShare('copy')}
                    className="text-gray-600 hover:text-blue-500 transition-colors"
                >
                    Copy Link
                </button>
            </div>

            {/* Comments Modal */}
            <Modal
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                title="Comments"
            >
                <div className="max-h-96 overflow-y-auto">
                    {comments.slice(0, 3).map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                    {comments.length > 3 && (
                        <button 
                            onClick={loadComments}
                            className="text-blue-500 hover:text-blue-600 mt-4"
                        >
                            Load more comments
                        </button>
                    )}
                </div>
            </Modal>
        </div>
    );
}

export default AudioPost;