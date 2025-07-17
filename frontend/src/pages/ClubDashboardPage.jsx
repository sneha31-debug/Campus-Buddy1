import React, { useState, useEffect } from 'react';
import './ClubDashboardPage.css';
import { Pencil, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import clubData from '../data/clubdata';

const ClubDashboardPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const club = clubData[clubId] || 
              clubData[parseInt(clubId)] || 
              Object.values(clubData).find(c => c.id === clubId) ||
              Object.values(clubData).find(c => c.id === parseInt(clubId));

  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (club) {
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
    return <div className="dashboard-container">❌ Club Not Found</div>;
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

      <div className="stat-cards">
        <div className="stat-card">
          <p className="stat-label">Total Events</p>
          <p className="stat-number">{events.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total RSVPs</p>
          <p className="stat-number">
            {events.reduce((sum, e) => sum + e.rsvps, 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Upcoming Events</p>
          <p className="stat-number">
            {events.filter((e) => new Date(e.date) >= new Date()).length}
          </p>
        </div>
      </div>

      <div className="event-list">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-details">
              <h2 className="event-title">{event.title}</h2>
              <p className="event-description">{event.description}</p>
              <p className="event-info">
                📅 {event.date} @ {event.time} | 📍 {event.venue} | 🙋 {event.rsvps} RSVPs
              </p>
              <div className="event-tags">
                {event.tags.map((tag, index) => (
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
        ))}
      </div>
    </div>
  );
};

export default ClubDashboardPage;
