import React, { useState, useEffect, useCallback } from "react";
import "./ClubDashboardPage.css";
import {
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Star,
  Heart,
  Eye,
  Edit,
  BarChart3,
  Clock,
  Award,
  Plus,
  Activity,
  Target,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useToast } from "../components/ToastContext.jsx";

const ClubDashboardPage = () => {
  const { clubId: paramClubId } = useParams();
  const navigate = useNavigate();
  const { user, isClub, getUserRole } = useAuth();
  const { addToast } = useToast();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Edit/Delete states (same as CampusEvents)
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

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

  // Function to fetch and set the current user's club and its events from JSON server
  const fetchClubDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setClub(null);
    setEvents([]);

    if (!user) {
      setError("You must be logged in to view this dashboard.");
      setLoading(false);
      return;
    }

    try {
      const userEmail = user.email;
      const userId = user.id;

      // 1. Fetch all clubs
      const clubsResponse = await fetch("http://localhost:3001/clubs");
      if (!clubsResponse.ok) {
        throw new Error(`Failed to fetch clubs: ${clubsResponse.statusText}`);
      }
      const allClubs = await clubsResponse.json();

      // Find the club associated with the current user's email or created_by ID
      let currentUserClub = allClubs.find(
        (c) => c.created_by === userId || c.contact_email === userEmail
      );

      if (!currentUserClub) {
        setError("No club profile found for your account. Please create one.");
        addToast({
          type: "info",
          message:
            'No club profile found. You can create one via "Create Event" form.',
        });
        setLoading(false);
        return;
      }

      setClub(currentUserClub);

      // 2. Fetch all events
      const eventsResponse = await fetch("http://localhost:3001/events");
      if (!eventsResponse.ok) {
        throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
      }
      const allEvents = await eventsResponse.json();

      // Filter events by the current user's club ID
      const clubEvents = allEvents.filter(
        (event) => event.club_id === currentUserClub.id
      );

      // Sort events by date and time
      const sortedEvents = clubEvents.sort((a, b) => {
        const dateA = new Date(`${a.event_date}T${a.event_time}`);
        const dateB = new Date(`${b.event_date}T${b.event_time}`);
        return dateA - dateB;
      });

      setEvents(sortedEvents);
    } catch (err) {
      console.error(
        "Error fetching club dashboard data from JSON server:",
        err
      );
      setError("Failed to load dashboard data: " + err.message);
      addToast({ type: "error", message: "Failed to load dashboard data." });
    } finally {
      setLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    if (user !== undefined) {
      fetchClubDashboardData();
    }
  }, [user, fetchClubDashboardData]);

  // Enhanced delete function (same as CampusEvents)
  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await fetch(`http://localhost:3001/events/${eventId}`, {
        method: "DELETE",
      });

      // Remove from local state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      addToast({ type: "success", message: "Event deleted successfully!" });
    } catch (err) {
      console.error("Error deleting event:", err);
      addToast({
        type: "error",
        message: "Failed to delete event: " + err.message,
      });
    }
  };

  // Enhanced edit function (same as CampusEvents)
  const handleEditEvent = (event) => {
    // Transform the event data to match the edit form structure
    const eventForEdit = {
      ...event,
      name: event.title, // Map title to name for consistency
      event_date: event.event_date,
      time: event.event_time,
      needsVolunteers: event.needs_volunteers,
      maxVolunteers: event.max_volunteers,
      rsvpLimit: event.rsvp_limit,
      eventType: event.event_type,
    };

    setEditingEvent(eventForEdit);
    setShowEditForm(true);
  };

  // Enhanced update function (same as CampusEvents)
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
      fetchClubDashboardData();
      setShowEditForm(false);
      setEditingEvent(null);
      addToast({ type: "success", message: "Event updated successfully!" });
    } catch (err) {
      console.error("Error updating event:", err);
      addToast({
        type: "error",
        message: "Failed to update event: " + err.message,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get upcoming events count
  const getUpcomingEventsCount = () => {
    return events.filter((e) => {
      const eventDateTime = new Date(`${e.event_date}T${e.event_time}`);
      const now = new Date();
      return eventDateTime > now;
    }).length;
  };

  // Get past events count
  const getPastEventsCount = () => {
    return events.filter((e) => {
      const eventDateTime = new Date(`${e.event_date}T${e.event_time}`);
      const now = new Date();
      return eventDateTime < now;
    }).length;
  };

  // Filter events based on active tab
  const getFilteredEvents = () => {
    const now = new Date();
    switch (activeTab) {
      case "upcoming":
        return events.filter((e) => {
          const eventDateTime = new Date(`${e.event_date}T${e.event_time}`);
          return eventDateTime > now;
        });
      case "past":
        return events.filter((e) => {
          const eventDateTime = new Date(`${e.event_date}T${e.event_time}`);
          return eventDateTime < now;
        });
      default:
        return events;
    }
  };

  // Quick Edit Form Component (same as CampusEvents)
  const QuickEditForm = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: event.name || event.title,
      description: event.description,
      venue: event.venue,
      time: event.time || event.event_time,
      event_date: event.event_date,
      eventType: event.eventType || event.event_type,
      needsVolunteers: event.needsVolunteers || event.needs_volunteers,
      maxVolunteers: event.maxVolunteers || event.max_volunteers,
      rsvpLimit: event.rsvpLimit || event.rsvp_limit,
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
              <label>Event Date</label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) =>
                  setFormData({ ...formData, event_date: e.target.value })
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
              <label>Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
                required
              >
                <option value="">Select Event Type</option>
                <option value="hackathon">Hackathon</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
                <option value="seminar">Seminar</option>
                <option value="festival">Festival</option>
                <option value="cultural_show">Cultural Show</option>
                <option value="mandatory">Mandatory</option>
                <option value="optional">Optional</option>
              </select>
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
              <label>RSVP Limit</label>
              <input
                type="number"
                value={formData.rsvpLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rsvpLimit: parseInt(e.target.value),
                  })
                }
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Max Volunteers</label>
              <input
                type="number"
                value={formData.maxVolunteers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxVolunteers: parseInt(e.target.value),
                  })
                }
                min="0"
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

  // Stats Component
  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="club-dash-stats-card">
      <div className={`club-dash-stats-icon ${color}`}>
        <Icon size={24} />
      </div>
      <div className="club-dash-stats-content">
        <div className="club-dash-stats-value">{value}</div>
        <div className="club-dash-stats-label">{label}</div>
      </div>
    </div>
  );

  // Event Card Component with enhanced actions
  const EventCard = ({ event }) => {
    const eventDate = formatDate(event.event_date);
    const eventTime = formatTime(event.event_time);
    const categoryEmoji = getCategoryEmoji(club?.category);
    const isUpcoming =
      new Date(`${event.event_date}T${event.event_time}`) > new Date();

    return (
      <div className="club-dash-event-card">
        <div className="club-dash-event-image">
          {event.poster_url ? (
            <img src={event.poster_url} alt={event.title} />
          ) : (
            <div className="club-dash-event-placeholder">
              <div className="club-dash-event-placeholder-icon">
                {categoryEmoji}
              </div>
            </div>
          )}
          <div
            className={`club-dash-event-status ${
              isUpcoming ? "upcoming" : "past"
            }`}
          >
            {isUpcoming ? "Upcoming" : "Past Event"}
          </div>
        </div>

        <div className="club-dash-event-content">
          <div className="club-dash-event-header">
            <h3 className="club-dash-event-title">{event.title}</h3>
            <span className="club-dash-event-category">
              {club?.category || "General"}
            </span>
          </div>

          <p className="club-dash-event-description">{event.description}</p>

          <div className="club-dash-event-details">
            <div className="club-dash-event-detail">
              <Calendar size={16} />
              <span>
                {eventDate} • {eventTime}
              </span>
            </div>
            <div className="club-dash-event-detail">
              <MapPin size={16} />
              <span>{event.venue}</span>
            </div>
            <div className="club-dash-event-detail">
              <Users size={16} />
              <span>{event.attendees_count || 0} interested</span>
            </div>
          </div>

          <div className="club-dash-event-tags">
            <span className="club-dash-tag">{event.event_type}</span>
            {event.tags &&
              event.tags.map((tag, index) => (
                <span key={index} className="club-dash-tag">
                  #{tag}
                </span>
              ))}
          </div>

          <div className="club-dash-event-actions">
            <button
              className="club-dash-action-btn view"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <Eye size={16} />
              View
            </button>
            <button
              className="club-dash-action-btn edit"
              onClick={() => handleEditEvent(event)}
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              className="club-dash-action-btn delete"
              onClick={() => handleDeleteEvent(event.id)}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading Component
  const LoadingState = () => (
    <div className="club-dash-loading">
      <div className="club-dash-loading-content">
        <div className="club-dash-spinner"></div>
        <p>Loading club dashboard...</p>
      </div>
    </div>
  );

  // Error Component
  const ErrorState = () => (
    <div className="club-dash-error">
      <div className="club-dash-error-content">
        <div className="club-dash-error-icon">❌</div>
        <p>{error}</p>
      </div>
    </div>
  );

  // No Club Component
  const NoClubState = () => (
    <div className="club-dash-no-club">
      <div className="club-dash-no-club-content">
        <div className="club-dash-no-club-icon">🏛️</div>
        <h2>No Club Profile Found</h2>
        <p>
          It looks like you don't have a registered club profile associated with
          your account.
        </p>
        <p>
          To manage events, please create your club profile first when creating
          a new event.
        </p>
        <button
          className="club-dash-create-btn primary"
          onClick={() => navigate("/createevent")}
        >
          <Plus size={20} />
          Create Your Club & First Event
        </button>
      </div>
    </div>
  );

  // Empty Events Component
  const EmptyEventsState = () => (
    <div className="club-dash-empty">
      <div className="club-dash-empty-content">
        <div className="club-dash-empty-icon">📅</div>
        <h3>
          {activeTab === "all"
            ? "No events found for this club"
            : `No ${activeTab} events found`}
        </h3>
        <p>
          {activeTab === "all"
            ? "Start by creating your first event!"
            : `No ${activeTab} events to display at the moment.`}
        </p>
        {activeTab === "all" && (
          <button
            className="club-dash-create-btn primary"
            onClick={() => navigate("/createevent")}
          >
            <Plus size={20} />
            Create Your First Event
          </button>
        )}
      </div>
    </div>
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!club) return <NoClubState />;

  const filteredEvents = getFilteredEvents();

  return (
    <div className="club-dash-container">
      {/* Header */}
      <div className="club-dash-header">
        <div className="club-dash-header-left">
          <div className="club-dash-header-icon">
            {getCategoryEmoji(club.category)}
          </div>
          <div className="club-dash-header-info">
            <h1 className="club-dash-title">{club.name}</h1>
            <p className="club-dash-subtitle">
              {club.description || "Managing your club events"}
            </p>
          </div>
        </div>
        <div className="club-dash-header-right">
          <div className="club-dash-role-badge">
            <span>Club Dashboard</span>
          </div>
          <button
            className="club-dash-create-btn primary"
            onClick={() => navigate("/createevent")}
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="club-dash-stats">
        <StatsCard
          icon={Calendar}
          label="Total Events"
          value={events.length}
          color="blue"
        />
        <StatsCard
          icon={Users}
          label="Total RSVPs"
          value={events.reduce((sum, e) => sum + (e.attendees_count || 0), 0)}
          color="purple"
        />
        <StatsCard
          icon={TrendingUp}
          label="Upcoming"
          value={getUpcomingEventsCount()}
          color="green"
        />
        <StatsCard
          icon={Award}
          label="Past Events"
          value={getPastEventsCount()}
          color="orange"
        />
      </div>

      {/* Content */}
      <div className="club-dash-content">
        {/* Tabs */}
        <div className="club-dash-tabs">
          <button
            className={`club-dash-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Events ({events.length})
          </button>
          <button
            className={`club-dash-tab ${
              activeTab === "upcoming" ? "active" : ""
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({getUpcomingEventsCount()})
          </button>
          <button
            className={`club-dash-tab ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past ({getPastEventsCount()})
          </button>
        </div>

        {/* Events Grid */}
        <div className="club-dash-events">
          {filteredEvents.length === 0 ? (
            <EmptyEventsState />
          ) : (
            <div className="club-dash-events-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>

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

export default ClubDashboardPage;
