import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import MyEvents from './pages/MyEvents'
import Events from './pages/Events'
import Footer from './components/Footer.jsx'
const App = () => {
  return (
    <>
    <Footer/>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<MyEvents />} />
        <Route path="/events" element={<Events />} />
      </Routes>
      <Footer/>
    </Router>
    </>
  );
};

export default App;


