import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../utils/Logo.png';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Templates', href: '/templates', icon: '📋' },
    { name: 'Data Export', href: '/data-export', icon: '📤' },
    { name: 'OE Checker', href: '/oe-checker', icon: '🔍' }
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-content">
            <img 
              src={logo} 
              alt="Maverick's Survey Tool" 
              className="sidebar-logo-icon"
            />
            
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-list">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  {item.name}
                  {isActive && <div className="sidebar-nav-indicator"></div>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="sidebar-user">
          <div className="sidebar-user-content">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">U</div>
              <div className="sidebar-user-details">
                <h4>User</h4>
                <p>Admin</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="sidebar-logout-btn"
              title="Logout"
              style={{
                padding: '12px',
                fontSize: '24px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                e.target.style.transform = 'scale(1.1)';
                e.target.style.animation = 'runningAnimation 0.5s infinite';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.transform = 'scale(1)';
                e.target.style.animation = 'none';
              }}
            >
              🏃‍♂️
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="main-header">
          <div className="main-header-content">
            <div className="main-header-title">
              
            </div>
            
            <div className="main-header-actions">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <span>{darkMode ? '☀️' : '🌙'}</span>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              
              {/* Quick Actions 
              <Link to="/create" className="btn-new-project">
                <span>✨</span>
                New Project
              </Link>*/}
              
              {/* Help Assistant 
              <button 
                onClick={() => document.querySelector('.chatbot-toggle')?.click()}
                className="btn-help"
                title="Get Help"
              >
                <span>🤖</span>
                Help
              </button>*/}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content-area">
          <div className="main-content-container">
            {children}
          </div>
        </main>
      </div>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Layout;