import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // API base URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Set axios default headers
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // Load user on mount
    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/me`);
            setUser(res.data.user);
        } catch (error) {
            console.error('Error loading user:', error);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password, role) => {
        const res = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password,
            role
        });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (data) => {
        const res = await axios.put(`${API_URL}/auth/profile`, data);
        setUser(res.data.user);
        return res.data;
    };

    const updatePreferences = async (preferences) => {
        const res = await axios.put(`${API_URL}/auth/preferences`, preferences);
        setUser({ ...user, preferences: res.data.preferences });
        return res.data;
    };

    const handleOAuthCallback = useCallback(async (oauthToken) => {
        try {
            console.log('📱 handleOAuthCallback: Setting token and loading user');
            setToken(oauthToken);
            setLoading(true);

            // Set the token in axios headers immediately
            axios.defaults.headers.common['Authorization'] = `Bearer ${oauthToken}`;

            // Load user data
            const res = await axios.get(`${API_URL}/auth/me`);
            setUser(res.data.user);
            console.log('✅ OAuth user loaded successfully:', res.data.user.email);
            return res.data;
        } catch (error) {
            console.error('❌ Error in handleOAuthCallback:', error);
            setToken(null);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        handleOAuthCallback,
        API_URL
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
