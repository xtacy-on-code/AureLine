import { createContext, useContext } from 'react';

// kept apart from the provider component so React Fast Refresh works
export const AuthContext = createContext(null);

// easy way to access the auth from any component
export const useAuth = () => useContext(AuthContext);
