// CampusEvents.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Calendar, Star, Heart } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import EventStatisticsModal from "./EventStatistics";
import "./CampusEvents.css";

const CampusEvents = () => {
  const navigate = useNavigate();
  const { user, getUserRole, isStudent, isClub } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userResponses, setUserResponses] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Statistics modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Edit/Delete states
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Get user role from auth context
  const userRole = getUserRole();

  // Fetch events from JSON Server
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:3001/events");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const eventsData = await response.json();

      // Fetch clubs for additional data
      const clubsResponse = await fetch("http://localhost:3001/clubs");
      const clubsData = await clubsResponse.json();

      const clubsMap = {};
      clubsData.forEach((club) => {
        clubsMap[club.id] = club;
      });

      // Transform the data to match the expected format
      const transformedEvents = eventsData.map((event) => {
        const club = clubsMap[event.club_id] || {};

        return {
          id: event.id,
          name: event.title,
          description: event.description,
          date: new Date(event.event_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: event.event_time,
          venue: event.venue,
          club: club.name || "Unknown Club",
          category: club.category || "General",
          eventType: event.event_type,
          attendees: event.attendees_count || 0,
          status: event.status,
          needsVolunteers: event.needs_volunteers,
          imagePlaceholder: getCategoryEmoji(club.category),
          hasImage: !!event.poster_url,
          imageUrl: event.poster_url,
          tags: event.tags || [],
          maxVolunteers: event.max_volunteers,
          rsvpLimit: event.rsvp_limit,
          targetBatchYear: event.target_batch_year,
          createdBy: event.created_by,
          clubId: event.club_id,
          posterUrl: event.poster_url,
          duration_hours: event.duration_hours,
          registration_fee: event.registration_fee,
          contact_email: event.contact_email,
        };
      });

      setEvents(transformedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get emoji based on category
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      Sports: "🏀",
      Tech: "💻",
      "Arts (Drama)": "🎭",
      "Arts (Music)": "🎵",
      "Arts (Dance)": "💃",
      Photography: "📸",
      "E-Cell": "💼",
      "Dev Club": "⚡",
      "Content Creation": "📝",
      "Debate Society": "🗣️",
      "Cultural Committee": "🎪",
    };
    return emojiMap[category] || "📅";
  };

  // Fetch user's event attendance/responses from JSON Server
  const fetchUserResponses = async () => {
    if (!user?.id) return;

    try {
      // Fetch user's event responses
      const response = await fetch(
        `http://localhost:3001/event_attendance?user_id=${user.id}`
      );
      const data = await response.json();

      const responses = {};
      data.forEach((attendance) => {
        responses[attendance.event_id] = attendance.status;
      });

      setUserResponses(responses);
    } catch (err) {
      console.error("Error fetching user responses:", err);
    }
  };

  // Handle user response (RSVP) with JSON Server
  const handleUserResponse = async (eventId, response) => {
    if (!user?.id) return;

    try {
      const attendanceData = {
        event_id: eventId,
        user_id: user.id,
        status: response,
        updated_at: new Date().toISOString(),
      };

      // Check if user already has a response for this event
      const existingResponse = await fetch(
        `http://localhost:3001/event_attendance?event_id=${eventId}&user_id=${user.id}`
      );
      const existingData = await existingResponse.json();

      if (existingData.length > 0) {
        // Update existing record
        await fetch(
          `http://localhost:3001/event_attendance/${existingData[0].id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(attendanceData),
          }
        );
      } else {
        // Create new record
        await fetch("http://localhost:3001/event_attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attendanceData),
        });
      }

      // Update local state
      setUserResponses((prev) => ({
        ...prev,
        [eventId]: response,
      }));

      // Update attendees count if going
      if (response === "going") {
        const currentEvent = events.find((e) => e.id === eventId);
        const updatedCount = currentEvent.attendees + 1;

        await fetch(`http://localhost:3001/events/${eventId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendees_count: updatedCount }),
        });

        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId ? { ...event, attendees: updatedCount } : event
          )
        );
      }
    } catch (err) {
      console.error("Error handling user response:", err);
    }
  };

  // Handle volunteer registration with JSON Server
  const handleVolunteerResponse = async (eventId) => {
    if (!user?.id) return;

    try {
      await fetch("http://localhost:3001/event_volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          user_id: user.id,
          status: "pending",
          created_at: new Date().toISOString(),
        }),
      });

      setUserResponses((prev) => ({
        ...prev,
        [eventId]: "volunteer",
      }));
    } catch (err) {
      console.error("Error handling volunteer response:", err);
    }
  };

  // Handle showing statistics modal
  const handleShowStats = (event) => {
    setSelectedEvent(event);
    setShowStatsModal(true);
  };

  // Handle edit event
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEditForm(true);
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await fetch(`http://localhost:3001/events/${eventId}`, {
        method: "DELETE",
      });

      // Remove from local state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // Handle update event
  const handleUpdateEvent = async (updatedEvent) => {
    try {
      await fetch(`http://localhost:3001/events/${updatedEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedEvent.name,
          description: updatedEvent.description,
          event_date: updatedEvent.event_date,
          event_time: updatedEvent.time,
          venue: updatedEvent.venue,
          event_type: updatedEvent.eventType,
          needs_volunteers: updatedEvent.needsVolunteers,
          max_volunteers: updatedEvent.maxVolunteers,
          rsvp_limit: updatedEvent.rsvpLimit,
          registration_fee: updatedEvent.registration_fee,
          contact_email: updatedEvent.contact_email,
          duration_hours: updatedEvent.duration_hours,
          updated_at: new Date().toISOString(),
        }),
      });

      // Refresh events
      fetchEvents();
      setShowEditForm(false);
      setEditingEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserResponses();
    }
  }, [user?.id]);

  const categories = [
    "E-Cell",
    "Arts (Dance)",
    "Arts (Drama)",
    "Arts (Music)",
    "Sports",
    "Content Creation",
    "Dev Club",
    "Photography",
    "Debate Society",
  ];

  const eventTypes = [
    "hackathon",
    "workshop",
    "competition",
    "seminar",
    "festival",
    "cultural_show",
    "mandatory",
    "optional",
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleEventTypeChange = (eventType) => {
    setSelectedEventTypes((prev) =>
      prev.includes(eventType)
        ? prev.filter((e) => e !== eventType)
        : [...prev, eventType]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedEventTypes([]);
    setSearchQuery("");
  };

  const filteredEvents = events.filter((event) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "upcoming" && event.status === "upcoming") ||
      (activeTab === "past" && event.status === "past");

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(event.category);
    const matchesEventType =
      selectedEventTypes.length === 0 ||
      selectedEventTypes.includes(event.eventType);
    const matchesSearch =
      searchQuery === "" ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCategory && matchesEventType && matchesSearch;
  });

  // Get user's RSVPs count
  const getUserRSVPCount = () => {
    return Object.values(userResponses).filter(
      (response) => response === "going"
    ).length;
  };

  // Get upcoming events count
  const getUpcomingEventsCount = () => {
    return events.filter((event) => event.status === "upcoming").length;
  };

  // Quick Edit Form Component
  const QuickEditForm = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: event.name,
      description: event.description,
      venue: event.venue,
      time: event.time,
      needsVolunteers: event.needsVolunteers,
      registration_fee: event.registration_fee || 0,
      contact_email: event.contact_email || "",
      duration_hours: event.duration_hours || 1,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ ...event, ...formData });
    };

    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>Edit Event</h2>
            <button onClick={onCancel} className="close-button">
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label>Event Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Registration Fee (₹)</label>
              <input
                type="number"
                value={formData.registration_fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration_fee: parseInt(e.target.value),
                  })
                }
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Duration (hours)</label>
              <input
                type="number"
                value={formData.duration_hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_hours: parseInt(e.target.value),
                  })
                }
                min="1"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.needsVolunteers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      needsVolunteers: e.target.checked,
                    })
                  }
                />
                Needs Volunteers
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EventCard = ({ event }) => {
    const userResponse = userResponses[event.id];
    const isEventOwner = isClub() && event.createdBy === user?.id;

    return (
      <div className="event-card">
        <div className="event-image">
          {event.hasImage ? (
            <img src={event.imageUrl} alt={event.name} />
          ) : (
            <div className="event-placeholder-overlay">
              <div className="event-placeholder">{event.imagePlaceholder}</div>
            </div>
          )}

          {event.status === "past" && (
            <div className="event-status-badge">Past Event</div>
          )}
          <div className="photo-count">
            {event.hasImage ? "1 photo" : "No photos"}
          </div>
        </div>

        <div className="event-content">
          <div className="event-header">
            <h3 className="event-title">{event.name}</h3>
            <span
              className={`category-badge ${event.category
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[()]/g, "")}`}
            >
              {event.category}
            </span>
          </div>

          <p className="event-description">{event.description}</p>

          <div className="event-details">
            <div className="event-detail">
              <span className="detail-icon">📅</span>
              <span>
                {event.date} • {event.time}
              </span>
            </div>
            <div className="event-detail">
              <span className="detail-icon">📍</span>
              <span>{event.venue}</span>
            </div>
            <div className="event-detail">
              <span className="detail-icon">👥</span>
              <span>{event.attendees} interested</span>
            </div>
          </div>

          <div className="event-tags">
            <span className="tag">{event.category}</span>
            <span className="tag">{event.eventType}</span>
            <span className="tag">{event.club}</span>
          </div>

          {isStudent() ? (
            <div className="student-actions">
              <button
                className="action-btn view-details"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                👁️ View Details
              </button>
              <button
                className={`action-btn going ${
                  userResponse === "going" ? "active" : ""
                }`}
                onClick={() => handleUserResponse(event.id, "going")}
              >
                ✓ Going
              </button>
              <button
                className={`action-btn not-going ${
                  userResponse === "not_going" ? "active" : ""
                }`}
                onClick={() => handleUserResponse(event.id, "not_going")}
              >
                ✗ Not Going
              </button>
              <button
                className={`action-btn maybe ${
                  userResponse === "maybe" ? "active" : ""
                }`}
                onClick={() => handleUserResponse(event.id, "maybe")}
              >
                ? Maybe
              </button>
              {event.needsVolunteers && (
                <button
                  className={`action-btn volunteer ${
                    userResponse === "volunteer" ? "active" : ""
                  }`}
                  onClick={() => handleVolunteerResponse(event.id)}
                >
                  🙋‍♂️ Volunteer
                </button>
              )}
            </div>
          ) : (
            <div className="club-actions">
              <button
                className="action-btn view-details"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                👁️ View Details
              </button>
              <button
                className="action-btn stats"
                onClick={() => handleShowStats(event)}
              >
                📊 Stats
              </button>
              {isEventOwner && (
                <>
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditEvent(event)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show loading if user data is not yet available
  if (!user) {
    return (
      <div className="campus-events">
        <div className="loading-container">
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching events
  if (loading) {
    return (
      <div className="campus-events">
        <div className="loading-container">
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an issue
  if (error) {
    return (
      <div className="campus-events">
        <div className="error-container">
          <p>Error loading events: {error}</p>
          <button onClick={fetchEvents}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="campus-events">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="app-icon">📅</div>
          <div>
            <h1 className="app-title">Campus Events</h1>
            <p className="app-subtitle">
              ✨ Discover amazing events happening on campus
            </p>
          </div>
        </div>
        <div className="header-right">
          <div className="user-role-display">
            <span className="role-label">
              {isStudent() ? "Student" : isClub() ? "Club" : "User"} View
            </span>
            <span className="role-badge">
              {isStudent() ? "🎓" : isClub() ? "🏛️" : "👤"}
            </span>
          </div>
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {/* Floating Quick Stats */}
      <div className="floating-quick-stats">
        <div className="floating-stats-header">
          <TrendingUp className="floating-stats-icon" />
          <span className="floating-stats-title">Quick Stats</span>
        </div>
        <div className="floating-stats-list">
          <div className="floating-stat-item">
            <Calendar className="floating-stat-icon" />
            <span className="floating-stat-label">Total Events</span>
            <span className="floating-stat-number">{events.length}</span>
          </div>
          {isStudent() && (
            <div className="floating-stat-item">
              <Star className="floating-stat-icon" />
              <span className="floating-stat-label">My RSVPs</span>
              <span className="floating-stat-number">{getUserRSVPCount()}</span>
            </div>
          )}
          <div className="floating-stat-item">
            <Heart className="floating-stat-icon" />
            <span className="floating-stat-label">Upcoming</span>
            <span className="floating-stat-number">
              {getUpcomingEventsCount()}
            </span>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="filters-sidebar">
            <div className="filter-section">
              <h3>Search Events</h3>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-section">
              <h3>Date Range</h3>
              <input
                type="date"
                className="date-input"
                placeholder="Pick a date"
              />
            </div>

            <div className="filter-section">
              <h3>Club Categories</h3>
              {categories.map((category) => (
                <label key={category} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  {category}
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h3>Event Types</h3>
              {eventTypes.map((eventType) => (
                <label key={eventType} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedEventTypes.includes(eventType)}
                    onChange={() => handleEventTypeChange(eventType)}
                  />
                  {eventType}
                </label>
              ))}
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        )}

        {/* Events Content */}
        <div className="events-content">
          {/* Tabs */}
          <div className="content-tabs">
            <button
              className={`content-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Events
            </button>
            <button
              className={`content-tab ${
                activeTab === "upcoming" ? "active" : ""
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`content-tab ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
            >
              Past
            </button>
          </div>

          {/* Events Grid */}
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="no-events">
              <p>No events found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Modal */}
      <EventStatisticsModal
        event={selectedEvent}
        isOpen={showStatsModal}
        onClose={() => {
          setShowStatsModal(false);
          setSelectedEvent(null);
        }}
      />

      {/* Edit Form Modal */}
      {showEditForm && editingEvent && (
        <QuickEditForm
          event={editingEvent}
          onSave={handleUpdateEvent}
          onCancel={() => {
            setShowEditForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default CampusEvents;
