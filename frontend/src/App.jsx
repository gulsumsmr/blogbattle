import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './features/auth/authSlice';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NewPost from './pages/NewPost';
import Vote from './pages/Vote';
import Results from './pages/Results';
import AdminPanel from './pages/AdminPanel';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

      if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Yükleniyor...</div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
          />
          <Route 
            path="/new" 
            element={isAuthenticated ? <NewPost /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/new-post" 
            element={<Navigate to="/new" />} 
          />
          <Route path="/vote" element={<Vote />} />
          <Route path="/results" element={<Results />} />
          <Route 
            path="/admin" 
            element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  );
}

export default App;
