import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axiosConfig";
import { toast } from "react-toastify";
import { Modal } from "./Modal";
import { formatTime } from "../utils/timeFormat";

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
				waveColor: 'rgb(74, 85, 104, 0.4)',
				progressColor: '#2b6cb0',
				cursorColor: '#2b6cb0',
				barWidth: 2,
				barRadius: 3,
				responsive: true,
				height: 100,
				barGap: 3,
				normalize: true,
				partialRender: true,
				pixelRatio: 1,
				fillParent: true,
				minPxPerSec: 50,
				interact: true,
				hideScrollbar: true,
				autoCenter: true,
			});

			const audioUrl = `http://localhost:3000/${post.audio_url}`;
			// const audioUrl = getFullAudioUrl(post.audio_url);
			wavesurfer.current.load(audioUrl);

			wavesurfer.current.on("ready", () => {
				setDuration(wavesurfer.current.getDuration());
			});

			wavesurfer.current.on("audioprocess", () => {
				setCurrentTime(wavesurfer.current.getCurrentTime());
			});

			wavesurfer.current.on("finish", () => {
				setIsPlaying(false);
				currentlyPlaying = null;
			});

			wavesurfer.current.on("error", (err) => {
				console.error("WaveSurfer error:", err);
				toast.error("Failed to load audio");
				setShowWaveform(true);
			});

			return () => {
				if (wavesurfer.current) {
					wavesurfer.current.destroy();
				}
			};
		}
	}, [showWaveform, post.audio_url]);

	useEffect(() => {
		const handleKeyPress = (e) => {
			if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
				e.preventDefault();
				handlePlayPause();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
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
	const handleVolumeChange = (e) => {
		const newVolume = parseFloat(e.target.value);
		setVolume(newVolume);
		if (wavesurfer.current) {
			wavesurfer.current.setVolume(newVolume);
		}
	};

	// Add this after the existing useEffect hooks
	useEffect(() => {
		if (wavesurfer.current) {
			wavesurfer.current.setVolume(volume);
		}
	}, [volume]);
	const handleShare = async (type) => {
		try {
			if (type === "profile") {
				await api.post(`/api/post/share/${post.contentID}`);
				toast.success("Shared to your profile");
			} else if (type === "copy") {
				const link = `${window.location.origin}/post/${post.contentID}`;
				await navigator.clipboard.writeText(link);
				toast.success("Link copied to clipboard");
			}
		} catch (err) {
			toast.error("Failed to share post");
		}
	};

	const loadComments = async () => {
		try {
			setLoadingComments(true);
			const response = await api.get(`/api/post/${post.contentID}/comments`);
			setComments(response.data.comments);
		} catch (err) {
			toast.error("Failed to load comments");
		} finally {
			setLoadingComments(false);
		}
	};
    if (!post) {
        return <div>Loading...</div>;
    }
    console.log("ppp",post);
    
	return (
		<div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
			{/* User Info Section */}
			<div className="flex items-center mb-6">
				<img
					src={post.profile_pic_url || "/default-avatar.png"}
					alt={post.username}
					className="w-12 h-12 rounded-full mr-4 border-2 border-blue-500"
				/>
				<div>
					<h3 className="font-bold text-lg">{post.username}</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{new Date(post.timestamp).toLocaleDateString(undefined, {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
				</div>
			</div>

			{/* Audio Content Section */}
			{post.audio_url && (
				<div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
					{post.cover_pic_url && !showWaveform ? (
						<div className="relative group">
							<img
								src={post.cover_pic_url}
								alt="Cover"
								className="w-full h-64 object-cover rounded-lg"
							/>
							<button
								onClick={handlePlayPause}
								className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-blue-500 rounded-full opacity-0 group-hover:opacity-90 transition-opacity"
							>
								{isPlaying ? (
									<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
										<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
									</svg>
								) : (
									<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
										<path d="M8 5v14l11-7z"/>
									</svg>
								)}
							</button>
						</div>
					) : (
						<div ref={waveformRef} className="w-full rounded-lg overflow-hidden" />
					)}

					{/* Audio Controls */}
					<div className="flex items-center justify-between mt-4 space-x-4">
						<div className="flex items-center space-x-4 flex-1">
							<button
								onClick={handlePlayPause}
								className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors"
							>
								{isPlaying ? "Pause" : "Play"}
							</button>
							<div className="flex items-center space-x-2 flex-1">
								<svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
									<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
								</svg>
								<input
									type="range"
									min="0"
									max="1"
									step="0.1"
									value={volume}
									onChange={handleVolumeChange}
									className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								/>
							</div>
						</div>
						<div className="flex items-center space-x-2 text-sm">
							<span>{formatTime(currentTime)}</span>
							<span>/</span>
							<span>{formatTime(duration)}</span>
						</div>
					</div>
				</div>
			)}

			{/* Post Content */}
			<div className="space-y-4">
				<h2 className="text-2xl font-bold">{post.title}</h2>
				<p className="text-gray-700 dark:text-gray-300">{post.description}</p>
				<p className="text-gray-600 dark:text-gray-400">{post.caption}</p>
			</div>

			{/* Interaction Buttons */}
			<div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
				<div className="flex items-center space-x-6">
					<button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
						<span>▲</span>
						<span>{post.vote_count}</span>
					</button>
					<button 
						onClick={() => setShowComments(true)}
						className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
					>
						<span>💬</span>
						<span>{post.comment_count}</span>
					</button>
					<div className="flex space-x-4">
						<button
							onClick={() => handleShare("profile")}
							className="text-gray-600 hover:text-blue-500 transition-colors"
						>
							Share to Profile
						</button>
						<button
							onClick={() => handleShare("copy")}
							className="text-gray-600 hover:text-blue-500 transition-colors"
						>
							Copy Link
						</button>
					</div>
				</div>
			</div>

			{/* Comments Modal remains unchanged */}
		</div>
	);
}

export default AudioPost;
