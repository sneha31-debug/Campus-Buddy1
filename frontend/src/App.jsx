import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import MyEvents from './pages/MyEvents';
import Events from './pages/Events';
import ProfileCard from './pages/ProfileCard';
import ClubProfileCard from './pages/ClubProfileCard'
const App = () => {
  return (
    <Router>
      <div>
        <div>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/myevents" element={<MyEvents />} />
            <Route path="/events" element={<Events />} />
            <Route path='/profilecard' element={<ProfileCard/>} />
            <Route path='/clubprofilecard' element={<ClubProfileCard/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;



