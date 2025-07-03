import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import Home from './pages/Home';
import MyEvents from './pages/MyEvents';
import Events from './pages/Events';
import AuthPage from './pages/AuthPage';
import ProfileCard from './pages/ProfileCard';
import ClubProfileCard from './pages/ClubProfileCard';
import CreateEventForm from './pages/CreateEventForm';
import ClubDirectory from './pages/ClubDirectory';
import ClubDashboardPage from './pages/ClubDashboardPage'; 
import EventStatistics from './pages/EventStatistics.jsx';
import CampusEvents from "./pages/CampusEvents.jsx";
const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/club/:clubId" element={<ClubDashboardPage />} /> 
          <Route path="/myevents" element={<MyEvents />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profilecard" element={<ProfileCard />} />
          <Route path="/clubprofilecard" element={<ClubProfileCard />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/createevent" element={<CreateEventForm />} />
          <Route path="/clubpage" element={<ClubDirectory />} />
          <Route path='/eventstatistics' element={<EventStatistics/>}/>
          <Route path="/campusevents" element={<CampusEvents />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
