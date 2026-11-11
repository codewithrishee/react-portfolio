
import { useEffect, useState } from "react";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL;

const ManageProfile = () => {
    const [profile, setProfile] = useState({
        id: "",
        name: "",
        email: "",
        profile_photo: "",
    });

    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const token = localStorage.getItem("admin_token");

  const photoUrl = profile.profile_photo
    ? profile.profile_photo.startsWith("http")
        ? profile.profile_photo
        : `${API_URL}/storage/${profile.profile_photo}`
    : "";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/api/me`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load profile.");
                }

                setProfile(data.user);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    useEffect(() => {
        if (!photo) {
            setPreview("");
            return;
        }

        const objectUrl = URL.createObjectURL(photo);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [photo]);

    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const handlePhotoChange = (e) => {
        const selectedPhoto = e.target.files?.[0];

        if (selectedPhoto) {
            setPhoto(selectedPhoto);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const formData = new FormData();

            formData.append("name", profile.name);
            formData.append("email", profile.email);

            if (photo) {
                formData.append("profile_photo", photo);
            }

            const response = await fetch(`${API_URL}/api/profile`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update profile."
                );
            }

            setProfile(data.user);
            setPhoto(null);
            setMessage(data.message);
            window.dispatchEvent(
  new CustomEvent("admin-profile-updated", {
    detail: data.user,
  })
);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/profile/password`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(passwordData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to change password."
                );
            }

            setPasswordData({
                current_password: "",
                password: "",
                password_confirmation: "",
            });

            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="admin-page">Loading profile...</div>;
    }

    return (
        <div className="admin-page manage-profile">
            <div className="admin-page-header">
                <div>
                    <h1>Admin Profile</h1>
                    <p>Manage your account information and security.</p>
                </div>
            </div>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="profile-card">
                <div className="profile-card-header">
                    <h2>Profile Information</h2>
                    <p>Update your personal account details.</p>
                </div>

                <form onSubmit={handleProfileSubmit}>
                    <div className="profile-photo-section">
                        <div className="profile-avatar">
                            {preview || photoUrl ? (
                                <img
                                    src={preview || photoUrl}
                                    alt="Admin profile"
                                />
                            ) : (
                                <span>
                                    {profile.name?.charAt(0)?.toUpperCase() || "A"}
                                </span>
                            )}
                        </div>

                        <div>
                            <label htmlFor="profilePhoto">
                                Change Profile Photo
                            </label>
                            <input
                                id="profilePhoto"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handlePhotoChange}
                            />
                            <small>JPG, PNG or WEBP. Maximum 2 MB.</small>
                        </div>
                    </div>

                    <div className="profile-form-grid">
                        <div className="form-group">
                            <label>Admin ID</label>
                            <input
                                type="text"
                                value={profile.id || ""}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name || ""}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email || ""}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </form>
            </div>

            <div className="profile-card">
                <div className="profile-card-header">
                    <h2>Change Password</h2>
                    <p>Use your current password to set a new password.</p>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                    <div className="profile-form-grid">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="password"
                                value={passwordData.password}
                                onChange={handlePasswordChange}
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={passwordData.password_confirmation}
                                onChange={handlePasswordChange}
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={saving}>
                        {saving ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ManageProfile;
