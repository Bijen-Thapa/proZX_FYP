import React, { useState } from 'react';
import { Modal } from './Modal';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';

function EditProfileModal({ profile, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        bio: profile?.bio || '',
        about: profile?.about || '',
        facebook_url: profile?.facebook_url || '',
        instagram_url: profile?.instagram_url || '',
        twitter_url: profile?.twitter_url || '',
        soundcloud_url: profile?.soundcloud_url || '',
        youtube_url: profile?.youtube_url || '',
        profile_picture: null
    });
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(profile?.profile_picture_url);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                profile_picture: file
            }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            await api.put('/api/profile/update', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Profile updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Edit Profile">
            <form onSubmit={handleSubmit} className="space-y-4 ">
                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        <img
                            src={previewUrl || '/default-avatar.png'}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            📷
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows="3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">About</label>
                    <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows="3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
                    <input
                        type="url"
                        name="facebook_url"
                        value={formData.facebook_url}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
                    <input
                        type="url"
                        name="instagram_url"
                        value={formData.instagram_url}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
                    <input
                        type="url"
                        name="twitter_url"
                        value={formData.twitter_url}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">SoundCloud URL</label>
                    <input
                        type="url"
                        name="soundcloud_url"
                        value={formData.soundcloud_url}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">YouTube URL</label>
                    <input
                        type="url"
                        name="youtube_url"
                        value={formData.youtube_url}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default EditProfileModal;