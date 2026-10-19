import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

const ProfilePage = () => {
  const { profile, signOut, fetchProfile, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/api/users/profile', formData);
      await fetchProfile(user.id);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <SEO title="Profile" path="/profile" />
      <h1 className="page-title">My Profile</h1>

      <div className="card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.full_name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <User className="w-4 h-4" /> Full Name
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input-field"
                id="profile-name"
              />
            ) : (
              <p className="text-gray-900 dark:text-white font-medium">{profile?.full_name}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <Mail className="w-4 h-4" /> Email
            </label>
            <p className="text-gray-900 dark:text-white font-medium">{profile?.email}</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <Phone className="w-4 h-4" /> Phone
            </label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                id="profile-phone"
              />
            ) : (
              <p className="text-gray-900 dark:text-white font-medium">{profile?.phone || 'Not set'}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={loading} className="btn-primary inline-flex items-center justify-center gap-2" id="save-profile">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary inline-flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn-primary inline-flex items-center justify-center gap-2" id="edit-profile">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button onClick={handleLogout} className="btn-danger inline-flex items-center justify-center gap-2" id="logout-btn">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
