import React, { useState } from 'react';
import axios from 'axios';

function CreatePost() {
    const [audio, setAudio] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('audio', audio);
        formData.append('caption', caption);

        try {
            await axios.post('http://localhost:3000/post/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Reset form and show success message
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Audio File</label>
                    <input 
                        type="file" 
                        accept="audio/*"
                        onChange={(e) => setAudio(e.target.files[0])}
                        className="w-full"
                    />
                </div>
                
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Caption</label>
                    <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows="3"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg"
                >
                    {loading ? 'Posting...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}

export default CreatePost;