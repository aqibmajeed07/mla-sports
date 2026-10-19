import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mla_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Verify customer session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }

        // 2. Verify dedicated admin session from public.admin_users
        const storedAdminToken = localStorage.getItem('mla_admin_token');
        if (storedAdminToken) {
          try {
            const res = await api.get('/api/admin/me');
            if (res.data?.admin) {
              setAdminUser(res.data.admin);
              localStorage.setItem('mla_admin_user', JSON.stringify(res.data.admin));
            }
          } catch (err) {
            console.warn('Admin session expired or invalid:', err.message);
            localStorage.removeItem('mla_admin_token');
            localStorage.removeItem('mla_admin_user');
            setAdminUser(null);
          }
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async ({ email, password, full_name, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone },
      },
    });
    if (error) throw error;

    // Direct auto-login without waiting for email confirmation
    if (!data.session) {
      try {
        const loginRes = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginRes.data?.user) {
          setUser(loginRes.data.user);
          await fetchProfile(loginRes.data.user.id);
          return loginRes.data;
        }
      } catch (err) {
        console.warn('Auto-login after signup:', err.message);
      }
    } else {
      setUser(data.user);
      await fetchProfile(data.user.id);
    }
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await fetchProfile(data.user.id);
    return data;
  };

  /**
   * Dedicated Admin Authentication via backend /api/admin/login
   * Validates against public.admin_users with bcrypt encrypted hash
   */
  const adminSignIn = async ({ email, login, password }) => {
    const credential = (login || email || '').trim();
    const res = await api.post('/api/admin/login', {
      login: credential,
      password,
    });

    if (res.data?.token && res.data?.admin) {
      const { token, admin } = res.data;
      localStorage.setItem('mla_admin_token', token);
      localStorage.setItem('mla_admin_user', JSON.stringify(admin));
      setAdminUser(admin);
      return res.data;
    }
    throw new Error(res.message || 'Administrator authentication failed');
  };

  const adminSignOut = async () => {
    try {
      await api.post('/api/admin/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('mla_admin_token');
      localStorage.removeItem('mla_admin_user');
      setAdminUser(null);
    }
  };

  const signOut = async () => {
    if (adminUser) {
      await adminSignOut();
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const isAdmin = Boolean(adminUser) || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      adminUser,
      loading,
      isAdmin,
      signUp,
      signIn,
      adminSignIn,
      adminSignOut,
      signOut,
      resetPassword,
      fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
