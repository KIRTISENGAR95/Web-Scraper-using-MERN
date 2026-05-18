import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
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
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/bookmarks" style={linkStyle}>Bookmarks</Link>
        <Link to="/login" style={linkStyle}>Login</Link>
        <Link to="/register" style={{ ...linkStyle, background: '#ff6600', padding: '0.5rem 1rem', borderRadius: '4px' }}>Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;
