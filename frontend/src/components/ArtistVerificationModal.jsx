import React, { useState } from 'react';
import { Modal } from './Modal';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';

function ArtistVerificationModal({ onClose, onVerified }) {
    const [formData, setFormData] = useState({
        stage_name: '',
        genre: '',
        portfolio_url: '',
        social_proof: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/api/artist/verify', formData);
            toast.success('Artist verification request submitted successfully');
            onVerified();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit verification request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Become an Artist">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Stage Name</label>
                    <input
                        type="text"
                        name="stage_name"
                        value={formData.stage_name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Your artist name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Genre</label>
                    <select
                        name="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select a genre</option>
                        <option value="pop">Pop</option>
                        <option value="rock">Rock</option>
                        <option value="hiphop">Hip Hop</option>
                        <option value="jazz">Jazz</option>
                        <option value="classical">Classical</option>
                        <option value="electronic">Electronic</option>
                        <option value="folk">Folk</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
                    <input
                        type="url"
                        name="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Link to your music portfolio (SoundCloud, Spotify, etc.)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Social Proof</label>
                    <input
                        type="text"
                        name="social_proof"
                        value={formData.social_proof}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Social media following, awards, or achievements"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Tell us about your musical journey and why you want to be verified"
                    />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ArtistVerificationModal;