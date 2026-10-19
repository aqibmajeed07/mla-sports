import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { adminSignIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleQuickFill = (login, password) => {
    setFormData({ login, password });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.login || !formData.password) {
      setErrorMsg('Please enter both admin username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await adminSignIn({
        login: formData.login.trim(),
        password: formData.password,
      });
      toast.success('Admin authentication verified successfully.');
      navigate('/admin');
    } catch (error) {
      setErrorMsg(error.message || 'Authentication failed. Please verify admin credentials.');
      toast.error(error.message || 'Admin authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <SEO title="Admin Portal Login" path="/admin/login" />

      {/* Subtle luxury glow backgrounds */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back to store link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-xl shadow-amber-600/20 mb-4 ring-1 ring-amber-400/30">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            MLA Sports
          </h1>
          <p className="text-amber-400 font-semibold text-xs tracking-[0.25em] uppercase mt-1">
            Dedicated Workshop Administration Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Admin Authentication</h2>
              <p className="text-xs text-slate-400">Separate encrypted credentials in database</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <KeyRound className="w-3 h-3" /> Encrypted
            </span>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="admin-login-form">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Username or Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="login"
                  required
                  value={formData.login}
                  onChange={handleChange}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
                  placeholder="admin@mlasports.com or admin"
                  id="admin-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
                  placeholder="Enter administrator password"
                  id="admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 cursor-pointer"
              id="admin-submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Verifying Admin Access...
                </>
              ) : (
                'Authenticate as Administrator'
              )}
            </button>
          </form>

          {/* Quick-Fill Helper for Authorized Staff */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Authorized Staff Profiles (Click to fill):
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@mlasports.com', 'Password123!')}
                className="text-left text-xs p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/60 flex items-center justify-between"
              >
                <span><strong>Master Admin:</strong> admin@mlasports.com</span>
                <span className="text-[10px] text-amber-400 font-mono">Use Profile →</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('aqib', 'Password123!')}
                className="text-left text-xs p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/60 flex items-center justify-between"
              >
                <span><strong>Developer Admin:</strong> aqib / miraqib12</span>
                <span className="text-[10px] text-amber-400 font-mono">Use Profile →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
