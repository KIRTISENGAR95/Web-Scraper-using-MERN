import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#1a1a1a',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const linkStyle = {
    color: '#ffffff',
    textDecoration: 'none',
    marginLeft: '1.5rem',
    fontWeight: '500'
  };

  return (
    <nav style={navStyle}>
      <div style={{ fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
        <Link to="/" style={{ color: '#ff6600', textDecoration: 'none' }}>HN Scraper</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={linkStyle}>Home</Link>
        {user ? (
          <>
            <Link to="/bookmarks" style={linkStyle}>Bookmarks</Link>
            <button 
              onClick={handleLogout} 
              style={{ ...linkStyle, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Logout ({user.name.split(' ')[0]})
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={{ ...linkStyle, background: '#ff6600', padding: '0.5rem 1rem', borderRadius: '4px' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
