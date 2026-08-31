import { createContext, useContext, useMemo, useState } from 'react';
import { fetchPanelDotenv, logoutUser } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'gift_token';
const USER_KEY = 'gift_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  /* ── LOGIN ── */
  const login = async (payload) => {
    const responseData = payload?.data || payload || {};
    const userInfo =
      responseData?.UserInfo ||
      responseData?.userInfo ||
      responseData?.data?.UserInfo ||
      responseData;

    const nextToken =
      userInfo?.token ||
      responseData.token ||
      responseData.access_token ||
      'gift_mock_token_' + Date.now();

    const rawUser =
      userInfo?.user ||
      responseData.user ||
      responseData?.data?.user || {};

    const nextUser = {
      id: rawUser.id || 1,
      username: rawUser.name || rawUser.mobile || 'admin',
      name: rawUser.name || 'Administrator',
      email: rawUser.email || 'admin@gmail.com',
      mobile: rawUser.mobile || '',
      role: rawUser.user_position || (rawUser.user_type === 2 ? 'Admin' : 'Super Admin'),
      avatar: rawUser.user_image || null,
      raw: rawUser
    };

    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));

    setToken(nextToken);
    setUser(nextUser);

    try {
      await fetchPanelDotenv();
    } catch (err) {
      console.warn('[AuthContext] dotenv load warning:', err.message);
    }
  };

  /* ── LOGOUT ── */
  const logout = async () => {
    try {
      await logoutUser(token);
    } catch (err) {
      console.warn('[AuthContext] Logout failed:', err.message);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider');
  return context;
};

export default AuthContext;
