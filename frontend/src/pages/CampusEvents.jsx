// CampusEvents.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Calendar, Star, Heart } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import EventStatisticsModal from "./EventStatistics";
import EventCardActions from "../components/EventCardActions"; // Import the EventCardActions component
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
  const [respondingToEvent, setRespondingToEvent] = useState(null);

  // Statistics modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Get user role from auth context
  const userRole = getUserRole();

  // Function to calculate actual attendees count from database
  const calculateAttendeesCount = async (eventId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/event_attendance?event_id=${eventId}`
      );

      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
        return 0;
      }

      const attendanceData = await response.json();

      // Ensure we have an array
      if (!Array.isArray(attendanceData)) {
        console.error("Expected array but got:", typeof attendanceData);
        return 0;
      }

      // Count users who are "going" or "maybe"
      const interestedCount = attendanceData.filter((attendance) => {
        return attendance.status === "going" || attendance.status === "maybe";
      }).length;

      return interestedCount;
    } catch (err) {
      console.error("Error calculating attendees count:", err);
      return 0;
    }
  };

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

      // Transform the data and calculate accurate attendees count
      const transformedEvents = await Promise.all(
        eventsData.map(async (event) => {
          const club = clubsMap[event.club_id] || {};

          // Always fetch fresh attendees count from event_attendance table
          const actualAttendeesCount = await calculateAttendeesCount(event.id);

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
            attendees: actualAttendeesCount, // Use calculated count from event_attendance
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
        })
      );

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

  // Refresh attendees count for a specific event
  const refreshEventAttendeesCount = async (eventId) => {
    try {
      const updatedCount = await calculateAttendeesCount(eventId);

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, attendees: updatedCount } : event
        )
      );

      return updatedCount;
    } catch (err) {
      console.error("Error refreshing attendees count:", err);
      return 0;
    }
  };

  // Handle user response (RSVP) with JSON Server
  const handleUserResponse = async (eventId, response) => {
    if (!user?.id || respondingToEvent === eventId) return;

    // Set loading state
    setRespondingToEvent(eventId);

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

      const previousResponse =
        existingData.length > 0 ? existingData[0].status : null;

      // Don't make API call if user is selecting the same response
      if (previousResponse === response) {
        return;
      }

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

      // Refresh the attendees count from the database
      await refreshEventAttendeesCount(eventId);
    } catch (err) {
      console.error("Error handling user response:", err);
    } finally {
      // Clear loading state
      setRespondingToEvent(null);
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

  const EventCard = ({ event }) => {
    const userResponse = userResponses[event.id];
    const isLoading = respondingToEvent === event.id;

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

          {/* Replace the inline buttons with EventCardActions component */}
          <EventCardActions
            event={event}
            userResponse={userResponse}
            isLoading={isLoading}
            onUserResponse={handleUserResponse}
            onVolunteerResponse={handleVolunteerResponse}
            onShowStats={handleShowStats}
            hideNotGoing={true}
          />
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
    </div>
  );
};

export default CampusEvents;
