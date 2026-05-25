import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// provider component it wraps the app and holds the token
export const AuthProvider = ({ children }) => {
    // initialize token from localStorage if available or null
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // login function - set token 
    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    }

    // logout function - clear token
    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    }

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// easy way to access the auth from any component
export const useAuth = () => useContext(AuthContext);