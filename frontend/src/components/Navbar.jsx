import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Users,
} from "lucide-react";
import { useAuth } from "../hook/useAuth";
import "./Navbar.css";

const Navbar = ({ userType = "student" }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, getUserRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    if (isAuthenticated && isAuthenticated()) {
      const role = getUserRole();
      setCurrentUserRole(role);
    }
  }, [user, isAuthenticated, getUserRole]);

  // Use the current user's role if authenticated, otherwise fall back to prop
  const effectiveUserType = currentUserRole || userType;

  const commonLinks = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/campusevents", label: "Events", icon: Calendar },
  ];

  const studentLinks = [
    ...commonLinks,
    { to: "/myevents", label: "My Events", icon: BookOpen },
  ];

  const clubLinks = [
    ...commonLinks,
    { to: "/createevent", label: "Create", icon: Plus },
    { to: "/clubdashboard", label: "Dashboard", icon: BarChart3 },
  ];

  const links = effectiveUserType === "student" ? studentLinks : clubLinks;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleProfileClick = () => {
    if (isAuthenticated && isAuthenticated()) {
      // Route to appropriate profile based on user role
      if (effectiveUserType === "club") {
        navigate("/clubprofilecard");
      } else {
        navigate("/profilecard");
      }
    } else {
      navigate("/login");
    }
  };

  const handleLoginClick = () => {
    if (isAuthenticated && isAuthenticated()) {
      // If already logged in, go to appropriate dashboard
      if (effectiveUserType === "club") {
        navigate("/clubpage");
      } else {
        navigate("/home");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className={`navbar ${isDarkMode ? "dark" : ""}`}>
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

          <button className="login-btn" onClick={handleLoginClick}>
            <LogIn size={18} />
            <span>
              {isAuthenticated && isAuthenticated()
                ? effectiveUserType === "club"
                  ? "Dashboard"
                  : "Home"
                : "Login"}
            </span>
          </button>

          <button className="profile-btn" onClick={handleProfileClick}>
            <User size={18} />
            {isAuthenticated && isAuthenticated() && (
              <span className="profile-indicator"></span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
