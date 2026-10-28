import { useState, useCallback, useMemo } from 'react';
import { AuthContext } from './auth';

const readToken = () => {
    try {
        return localStorage.getItem('token');
    } catch {
        return null;
    }
};

// provider component it wraps the app and holds the token
export const AuthProvider = ({ children }) => {
    // initialize token from localStorage if available or null
    const [token, setToken] = useState(readToken);

    // login function - set token
    const login = useCallback((newToken) => {
        setToken(newToken);
        try {
            localStorage.setItem('token', newToken);
        } catch {
            // storage blocked, the session still works until reload
        }
    }, []);

    // logout function - clear token
    const logout = useCallback(() => {
        setToken(null);
        try {
            localStorage.removeItem('token');
        } catch {
            // nothing stored
        }
    }, []);

    const value = useMemo(() => ({ token, login, logout }), [token, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
