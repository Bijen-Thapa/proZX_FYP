import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Assuming you have AuthContext
import api from "../utils/axiosConfig";

function PostContent() {
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		caption: "",
		visibility: "public",
		audio: null,
	});
	const [isArtist, setIsArtist] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { user } = useAuth();

	useEffect(() => {
		// Check if user is an artist
		const checkArtistStatus = async () => {
			try {
				const response = await axios.get(
					`http://localhost:3000/api/user/isArtist/${user.id}`
				);
				setIsArtist(response.data.isArtist);
			} catch (err) {
				console.error("Error checking artist status:", err);
			}
		};
		// checkArtistStatus();
	}, [user]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 100 * 1024 * 1024) {
				// 100MB limit
				setError("File size must be less than 100MB");
				return;
			}
			setFormData((prev) => ({
				...prev,
				audio: file,
			}));
			setError("");
		}
	};

	// Add a ref for the file input
	const fileInputRef = useRef(null);

	// Add upload progress state
	const [uploadProgress, setUploadProgress] = useState(0);

	const [successMessage, setSuccessMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const formDataToSend = new FormData();
			formDataToSend.append("title", formData.title);
			formDataToSend.append("description", formData.description);
			formDataToSend.append("caption", formData.caption);
			formDataToSend.append("visibility", formData.visibility);
			if (formData.audio) {
				formDataToSend.append("audio", formData.audio);
			}

			// Simulate initial processing
			setUploadProgress(0);
			await new Promise(resolve => setTimeout(resolve, 800));
			setUploadProgress(15);

			// Simulate metadata processing
			await new Promise(resolve => setTimeout(resolve, 500));
			setUploadProgress(30);

			const response = await api.post("/api/post/create", formDataToSend, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					const progress = Math.round(
						(progressEvent.loaded * 70 / progressEvent.total) + 30
					);
					setUploadProgress(progress);
				},
			});

			// Simulate final processing
			await new Promise(resolve => setTimeout(resolve, 600));
			setUploadProgress(100);
			await new Promise(resolve => setTimeout(resolve, 400));

			// Reset form and file input
			setFormData({
				title: "",
				description: "",
				caption: "",
				visibility: "public",
				audio: null,
			});
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			
			setSuccessMessage("Post created successfully!");
			setTimeout(() => setSuccessMessage(""), 3000);
			
		} catch (err) {
			setError(err.response?.data?.message || "Error creating post");
		} finally {
			setLoading(false);
			setUploadProgress(0);
		}
	};
	return (
		<div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
			<h2 className="text-2xl font-bold mb-4 text-black">Create New Post</h2>

			{error && (
				<div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
			)}

			{successMessage && (
				<div className="bg-green-100 text-green-700 p-3 rounded mb-4">
					{successMessage}
				</div>
			)}

			{loading && (
				<div className="w-full bg-gray-200 rounded-full h-2.5">
					<div
						className="bg-blue-600 h-2.5 rounded-full"
						style={{ width: `${uploadProgress}%` }}
					></div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4 text-black">
				<div>
					<label className="block text-sm font-medium mb-1">Audio File</label>
					{/* <input
						type="file"
						accept="audio/*"
						id="audio"
						onChange={handleFileChange}
						className="w-full border rounded p-2 border-blue-600"
					/> */}
					<input
						ref={fileInputRef}
						type="file"
						accept="audio/*"
						onChange={handleFileChange}
						className="w-full border rounded p-2 border-blue-600"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Title</label>
					<input
						type="text"
						name="title"
						value={formData.title}
						onChange={handleInputChange}
						className="w-full border rounded p-2 border-blue-600"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Description</label>
					<textarea
						name="description"
						value={formData.description}
						onChange={handleInputChange}
						className="w-full border rounded p-2 border-blue-600"
						rows="3"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Caption</label>
					<textarea
						name="caption"
						value={formData.caption}
						onChange={handleInputChange}
						className="w-full border rounded p-2 border-blue-600"
						rows="2"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Visibility</label>
					<select
						name="visibility"
						value={formData.visibility}
						onChange={handleInputChange}
						className="w-full border rounded p-2 border-blue-600"
					>
						<option value="public">Public</option>
						<option value="private">Private</option>
						{isArtist && <option value="premium">Premium</option>}
					</select>
				</div>
				<button
					type="submit"
					disabled={loading}
					className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 
                        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
				>
					{loading ? "Creating Post..." : "Create Post"}
				</button>
			</form>
		</div>
	);
}

export default PostContent;
