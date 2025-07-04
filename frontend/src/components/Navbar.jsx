import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Plus, 
  BarChart3, 
  User, 
  LogIn, 
  Sun, 
  Moon,
  Users
} from 'lucide-react';
import './Navbar.css';

const Navbar = ({ userType = 'student' }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const commonLinks = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/campusevents', label: 'Events', icon: Calendar },
  ];

  const studentLinks = [
    ...commonLinks,
    { to: '/myevents', label: 'My Events', icon: BookOpen },
  ];

  const clubLinks = [
    ...commonLinks,
    { to: '/createevent', label: 'Create', icon: Plus },
    { to: '/clubdashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const links = userType === 'student' ? studentLinks : clubLinks;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className={`navbar ${isDarkMode ? 'dark' : ''}`}>
      <div className="navbar-container">
        <div className="logo">
          <div className="logo-icon">
            <Users size={24} />
          </div>
          <span className="logo-text">Campus-Buddy</span>
        </div>

        <div className="nav-center">
          <ul className="nav-links">
            {links.map((link) => {
              const IconComponent = link.icon;
              return (
                <li key={link.to}>
                  <a href={link.to} className="nav-link">
                    <IconComponent size={18} />
                    <span>{link.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <a href="/login" className="login-btn">
            <LogIn size={18} />
            <span>Login</span>
          </a>
          
          <a href="/profilecard" className="profile-btn">
            <User size={18} />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
