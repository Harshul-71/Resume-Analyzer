import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '', photo: null });
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('users/candidate/profile/');
            setProfile({
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || '',
                email: res.data.email || '',
                photo: res.data.photo || null
            });
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        setProfile(prev => ({ ...prev, photo: e.target.files[0] }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('first_name', profile.first_name);
        formData.append('last_name', profile.last_name);
        if (profile.photo instanceof File) {
            formData.append('photo', profile.photo);
        }

        try {
            await api.put('users/candidate/profile/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Profile updated successfully!');
            fetchProfile(); // Refresh
        } catch (err) {
            setMessage('Failed to update profile.');
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('users/change-password/', passwords);
            setMessage('Password changed successfully!');
            setPasswords({ old_password: '', new_password: '' });
        } catch (err) {
            setMessage('Failed to change password. Check your old password.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="profile-container">
            <h1 className="page-title">My Profile</h1>
            {message && <div className="alert-message">{message}</div>}
            
            <div className="premium-card">
                <h2>Personal Information</h2>
                <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="form-group">
                        <label>First Name</label>
                        <input type="text" name="first_name" value={profile.first_name} onChange={handleProfileChange} required />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" name="last_name" value={profile.last_name} onChange={handleProfileChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email (Read-only)</label>
                        <input type="email" value={profile.email} disabled />
                    </div>
                    <div className="form-group">
                        <label>Profile Photo</label>
                        {profile.photo && typeof profile.photo === 'string' && (
                            <img src={`http://localhost:8000${profile.photo}`} alt="Profile" className="profile-preview" />
                        )}
                        <input type="file" name="photo" accept="image/*" onChange={handlePhotoChange} />
                    </div>
                    <button type="submit" className="btn-primary">Update Profile</button>
                </form>
            </div>

            <div className="premium-card">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="profile-form">
                    <div className="form-group">
                        <label>Old Password</label>
                        <input type="password" name="old_password" value={passwords.old_password} onChange={handlePasswordChange} required />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input type="password" name="new_password" value={passwords.new_password} onChange={handlePasswordChange} required />
                    </div>
                    <button type="submit" className="btn-secondary">Change Password</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
