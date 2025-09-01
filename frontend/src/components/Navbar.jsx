import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="card soft-bg border-0 rounded-none shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-gradient float">
            Blog Savaşı
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-slate-400 hover:text-accent transition-colors duration-300 font-medium">
              Ana Sayfa
            </Link>
            <Link to="/vote" className="text-slate-400 hover:text-accent-secondary transition-colors duration-300 font-medium">
              Oyla
            </Link>
            <Link to="/results" className="text-slate-400 hover:text-accent-success transition-colors duration-300 font-medium">
              Sonuçlar
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/new" className="text-slate-400 hover:text-accent transition-colors duration-300 font-medium">
                  Yeni Yazı
                </Link>
                <Link to="/admin" className="text-slate-400 hover:text-accent-secondary transition-colors duration-300 font-medium">
                  Manuel Eşleşme
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-400 hidden sm:inline font-medium">Merhaba, <span className="text-accent">{user?.username}</span></span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                  >
                    Çıkış
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn btn-secondary">
                  Giriş
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
