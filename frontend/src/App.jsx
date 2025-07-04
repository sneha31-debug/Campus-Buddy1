import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import MyEvents from "./pages/MyEvents";
import Events from './pages/Events';
import Footer from './components/Footer.jsx';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback.jsx'; // New callback component
import ProfileCard from './pages/ProfileCard';
import ClubProfileCard from './pages/ClubProfileCard';
import CreateEventForm from './pages/CreateEventForm';
import ClubDirectory from './pages/ClubDirectory';
import ClubDashboardPage from './pages/ClubDashboardPage'; 
import EventStatistics from './pages/EventStatistics.jsx';
import CampusEvents from "./pages/CampusEvents.jsx";
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => {
  return (
    <AuthProvider>
    <Router>
      <div>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected routes - accessible by any authenticated user */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/campusevents" 
            element={
              <ProtectedRoute>
                <CampusEvents />
              </ProtectedRoute>
            } 
          />
          
          {/* Student-specific routes */}
          <Route 
            path="/myevents" 
            element={
              <ProtectedRoute requiredRole="student">
                <MyEvents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profilecard" 
            element={
              <ProtectedRoute requiredRole="student">
                <ProfileCard />
              </ProtectedRoute>
            } 
          />
          
          {/* Club-specific routes */}
          <Route 
            path="/clubprofilecard" 
            element={
              <ProtectedRoute requiredRole="club">
                <ClubProfileCard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/createevent" 
            element={
              <ProtectedRoute requiredRole="club">
                <CreateEventForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clubpage" 
            element={
              <ProtectedRoute requiredRole="club">
                <ClubDirectory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eventstatistics" 
            element={
              <ProtectedRoute requiredRole="club">
                <EventStatistics />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
};

export default App;