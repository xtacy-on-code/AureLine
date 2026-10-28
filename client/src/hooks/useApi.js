import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { apiRequest } from '../lib/api';

// apiRequest with the user's token; an expired or invalid token logs out and
// sends the user to login instead of leaving every request failing
export function useApi() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    return useCallback(async (path, options = {}) => {
        try {
            return await apiRequest(path, { ...options, token });
        } catch (err) {
            if (err.status === 401) {
                logout();
                navigate('/login', { replace: true, state: { expired: true } });
            }
            throw err;
        }
    }, [token, logout, navigate]);
}
