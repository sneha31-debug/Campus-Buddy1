import React, { useState, useEffect } from 'react';
import './ClubDashboardPage.css';
import { Pencil, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import clubData from '../data/clubdata';

const ClubDashboardPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
   
  console.log('clubId from params:', clubId);
  console.log('clubData:', clubData);
  console.log('Available club keys:', Object.keys(clubData));

  const club = clubData[clubId] || 
              clubData[parseInt(clubId)] || 
              Object.values(clubData).find(c => c.id === clubId) ||
              Object.values(clubData).find(c => c.id === parseInt(clubId));

  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (club && club.events) {
      setEvents(club.events);
    }
  }, [club]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents((prev) => prev.filter((event) => event.id !== id));
    }
  };

  const handleEdit = (id) => {
    const event = events.find((e) => e.id === id);
    const newTitle = prompt('Edit Event Title:', event.title);
    if (newTitle && newTitle.trim() !== '') {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, title: newTitle } : e))
      );
    }
  };

  if (!club) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>❌ Club Not Found</h2>
          <p>Club ID: {clubId}</p>
          <p>Available clubs: {Object.keys(clubData).join(', ')}</p>
          <button onClick={() => navigate('/')}>Go Back Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{club.name}</h1>
        <p className="dashboard-tagline">{club.tagline}</p>
        <button
          className="create-event-btn"
          onClick={() => navigate('/createevent')}
        >
          + Create New Event
        </button>
      </div>

      <div className="dash-stat-cards">
        <div className="dash-stat-card">
          <p className="dash-stat-label">Total Events</p>
          <p className="dash-stat-number">{events.length}</p>
        </div>
        <div className="dash-stat-card">
          <p className="dash-stat-label">Total RSVPs</p>
          <p className="dash-stat-number">
            {events.reduce((sum, e) => sum + e.rsvps, 0)}
          </p>
        </div>
        <div className="dash-stat-card">
          <p className="dash-stat-label">Upcoming Events</p>
          <p className="dash-stat-number">
            {events.filter((e) => new Date(e.date) >= new Date()).length}
          </p>
        </div>
      </div>

      <div className="event-list">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No events found for this club.</p>
            <button 
              className="create-event-btn"
              onClick={() => navigate('/createevent')}
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-details">
                <h2 className="event-title">{event.title}</h2>
                <p className="event-description">{event.description}</p>
                <p className="event-info">
                  📅 {event.date} @ {event.time} | 📍 {event.venue} | 🙋 {event.rsvps} RSVPs
                </p>
                <div className="event-tags">
                  {event.tags && event.tags.map((tag, index) => (
                    <span key={index} className="event-tag">#{tag}</span>
                  ))}
                </div>
              </div>
              <div className="event-actions">
                <button
                  onClick={() => handleEdit(event.id)}
                  className="icon-btn blue"
                  title="Edit"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="icon-btn red"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClubDashboardPage;