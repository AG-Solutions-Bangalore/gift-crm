import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProfileView from '../components/profile/ProfileView';
import { useAuthContext } from '../context/AuthContext';
import { fetchProfile, updateProfile } from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { token, logout } = useAuthContext();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ mobile: '', email: '' });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchProfile(token);
      const data = res?.data || res?.profile || res?.user || res || {};
      setProfile(data);
      setForm({
        mobile: data?.mobile || '',
        email: data?.email || '',
      });
    } catch (err) {
      toast.error(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mobileVal = (form.mobile || '').trim();
    const emailVal = (form.email || '').trim();

    if (!mobileVal) {
      toast.error('Please enter a mobile contact number.');
      return;
    }

    if (!emailVal || !emailVal.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({ mobile: mobileVal, email: emailVal }, token);
      toast.success(res?.message || 'Profile details updated successfully.');
      await loadProfile();
    } catch (err) {
      toast.error(err.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateAvatar = (newAvatar) => {
    setProfile((prev) => ({ ...prev, avatar: newAvatar }));
    const saved = localStorage.getItem('gift_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        u.avatar = newAvatar;
        localStorage.setItem('gift_user', JSON.stringify(u));
      } catch (e) {}
    }
  };

  return (
    <MainLayout>
      <ProfileView
        profile={profile}
        form={form}
        loading={loading}
        saving={saving}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onLogout={handleLogout}
        onUpdateAvatar={handleUpdateAvatar}
      />
    </MainLayout>
  );
}
