import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function App() {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* protected routes */}
        <Route
          path = "/dashboard"
          element = {token ? <Dashboard/> : <Navigate to="/login" />}
        />

        {/* default */}
        <Route 
          path="/"
          element = {token ? <Navigate to="/dashboard"/> : <Navigate to="/login" />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App