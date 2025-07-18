// CampusEvents.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Calendar, Star, Heart, Search } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import EventStatisticsModal from "./EventStatistics";
import EventCardActions from "../components/EventCardActions"; // Import the EventCardActions component
import "./CampusEvents.css";
import ApiService from "../services/api";

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

  // Add selectedCategory state
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get user role from auth context
  const userRole = getUserRole();

  // Function to calculate actual attendees count from database
  const calculateAttendeesCount = async (eventId) => {
    try {
      const attendanceData = await ApiService.getEventAttendanceByEvent(eventId);
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
      const eventsData = await ApiService.getEvents();
      // Fetch clubs for additional data
      const clubsData = await ApiService.getClubs();
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
          // Provide default values for all fields used in the card
          const name = event.title || "Untitled Event";
          const description = event.description || "No description provided.";
          const date = event.event_date
            ? new Date(event.event_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Date not set";
          const time = event.event_time || "Time not set";
          const venue = event.venue || "Venue not set";
          const category = club.category || "General";
          const eventType = event.event_type || "General";
          const clubName = club.name || "Unknown Club";
          const status = event.status || "upcoming";
          const needsVolunteers = event.needs_volunteers || false;
          const tags = event.tags || [category, eventType, clubName];
          const maxVolunteers = event.max_volunteers || 0;
          const rsvpLimit = event.rsvp_limit || 0;
          const targetBatchYear = event.target_batch_year || null;
          const createdBy = event.created_by || null;
          const clubId = event.club_id || null;
          const duration_hours = event.duration_hours || null;
          const registration_fee = event.registration_fee || 0;
          const contact_email = event.contact_email || "";
          // Fallback for image
          const imageUrl = event.poster_url || "https://via.placeholder.com/400x200?text=Event";
          const hasImage = !!event.poster_url;
          return {
            id: event.id,
            name,
            description,
            date,
            time,
            venue,
            club: clubName,
            category,
            eventType,
            attendees: actualAttendeesCount, // Use calculated count from event_attendance
            status,
            needsVolunteers,
            imagePlaceholder: getCategoryEmoji(category),
            hasImage,
            imageUrl,
            tags,
            maxVolunteers,
            rsvpLimit,
            targetBatchYear,
            createdBy,
            clubId,
            posterUrl: event.poster_url,
            duration_hours,
            registration_fee,
            contact_email,
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
      const data = await ApiService.getEventAttendance();
      const responses = {};
      data.filter((attendance) => attendance.user_id === user.id).forEach((attendance) => {
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
      const existingData = (await ApiService.getEventAttendance()).filter(
        (a) => a.event_id === eventId && a.user_id === user.id
      );
      const previousResponse =
        existingData.length > 0 ? existingData[0].status : null;

      // Don't make API call if user is selecting the same response
      if (previousResponse === response) {
        return;
      }

      if (existingData.length > 0) {
        // Update existing record
        await ApiService.updateEventAttendance(existingData[0].id, attendanceData);
      } else {
        // Create new record
        await ApiService.createEventAttendance(attendanceData);
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
      await ApiService.createEventVolunteer({
        event_id: eventId,
        user_id: user.id,
        status: "pending",
        created_at: new Date().toISOString(),
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

  // Replace selectedCategories with selectedCategory in filtering logic
  const filteredEvents = events.filter((event) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "upcoming" && event.status === "upcoming") ||
      (activeTab === "past" && event.status === "past");

    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
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

  // Get past events count
  const getPastEventsCount = () => {
    return events.filter((event) => event.status === "past").length;
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
      <div className="my-events-header">
        <h1>
          <span className="gradient-emoji">✨</span>
          Campus <span className="gradient-title">Events</span>
          <span className="gradient-emoji">✨</span>
        </h1>
        <p>Discover amazing events happening on campus</p>
        <div className="my-events-search-bar">
          <span className="search-icon">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Search campus events..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn" onClick={() => {}} disabled>
            Search
          </button>
        </div>
        <div className="my-events-categories">
          {["All", ...categories].map((cat, index) => (
            <button
              key={index}
              className={`category-btn ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span className="cat-label">{cat}</span>
            </button>
          ))}
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
        {/* Events Content */}
        <div className="events-content">
          {/* Tabs */}
          <div className="content-tabs">
            <button
              className={`content-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Events
              <span
                style={{
                  background: "#e0e7ff",
                  color: "#1d4ed8",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "2px 10px",
                  marginLeft: 8,
                  display: "inline-block",
                  minWidth: 28,
                  textAlign: "center",
                }}
              >
                {events.length}
              </span>
            </button>
            <button
              className={`content-tab ${
                activeTab === "upcoming" ? "active" : ""
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
              <span className="tab-count">{getUpcomingEventsCount()}</span>
            </button>
            <button
              className={`content-tab ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
            >
              Past
              <span className="tab-count">{getPastEventsCount()}</span>
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
