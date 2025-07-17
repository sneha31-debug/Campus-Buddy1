import React, { useState, useEffect } from "react";
import "./MyEvents.css";
import { FaCalendarPlus, FaArrowRight } from "react-icons/fa";
import {
  TrendingUp,
  CheckCircle,
  HelpCircle,
  Users,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

const categoryMap = {
  "All Categories": [],
  "E-Cell": ["e-cell", "entrepreneurship", "startup"],
  "Arts (Dance)": ["arts", "dance", "cultural"],
  "Arts (Drama)": ["arts", "drama", "cultural"],
  "Arts (Music)": ["arts", "music", "cultural"],
  Sports: ["sports", "fitness"],
  "Content Creation": ["content", "creation", "writing"],
  "Dev Club": ["dev", "coding", "tech", "programming"],
  Photography: ["photography", "photo"],
  "Debate Society": ["debate", "society", "discussion"],
  "Cultural Committee": ["cultural", "committee"],
};

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [userResponses, setUserResponses] = useState({});
  const [tab, setTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date();

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
        const eventDate = new Date(event.event_date);

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.event_date,
          time: event.event_time,
          location: event.venue,
          club: club.name || "Unknown Club",
          category: club.category || "General",
          eventType: event.event_type,
          attendees: event.attendees_count || 0,
          status: eventDate < today ? "past" : "upcoming",
          needsVolunteers: event.needs_volunteers,
          image:
            event.poster_url ||
            `https://via.placeholder.com/400x200?text=${encodeURIComponent(
              event.title
            )}`,
          tags: [club.category, event.event_type, club.name].filter(Boolean),
          maxVolunteers: event.max_volunteers,
          rsvpLimit: event.rsvp_limit,
          registrationFee: event.registration_fee || 0,
          contactEmail: event.contact_email,
          durationHours: event.duration_hours,
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

  // Fetch user's event responses from JSON Server
  const fetchUserResponses = async () => {
    if (!user?.id) return;

    try {
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

  // Fetch volunteer responses
  const fetchVolunteerResponses = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `http://localhost:3001/event_volunteers?user_id=${user.id}`
      );
      const data = await response.json();

      const volunteerResponses = {};
      data.forEach((volunteer) => {
        volunteerResponses[volunteer.event_id] = "volunteer";
      });

      // Merge with existing responses
      setUserResponses((prev) => ({
        ...prev,
        ...volunteerResponses,
      }));
    } catch (err) {
      console.error("Error fetching volunteer responses:", err);
    }
  };

  useEffect(() => {
    const savedTab = sessionStorage.getItem("myEventsTab");
    const savedCategory = sessionStorage.getItem("myEventsCategory");

    if (savedTab) setTab(savedTab);
    if (savedCategory) setSelectedCategory(savedCategory);

    fetchEvents();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserResponses();
      fetchVolunteerResponses();
    }
  }, [user?.id]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    sessionStorage.setItem("myEventsTab", newTab);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    sessionStorage.setItem("myEventsCategory", category);
  };

  const addToCalendar = (event) => {
    const eventDate = new Date(event.date);
    const [hours, minutes] = event.time.split(":");
    eventDate.setHours(parseInt(hours), parseInt(minutes));

    const startDate = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(
      eventDate.getTime() + (event.durationHours || 2) * 60 * 60 * 1000
    )
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");

    const link = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}`;
    window.open(link, "_blank");
  };

  const filterEventByCategory = (event, category) => {
    if (category === "All Categories") return true;

    const keywords = categoryMap[category] || [];
    const keywordsLower = keywords.map((k) => k.toLowerCase());

    return (
      event.tags.some((tag) =>
        keywordsLower.some((kw) => tag.toLowerCase().includes(kw))
      ) || event.category === category
    );
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      going: { text: "Going", color: "success", icon: "✓" },
      not_going: { text: "Not Going", color: "danger", icon: "✗" },
      maybe: { text: "Maybe", color: "warning", icon: "?" },
      volunteer: { text: "Volunteering", color: "info", icon: "🙋‍♂️" },
    };
    return (
      statusMap[status] || { text: "Unknown", color: "secondary", icon: "?" }
    );
  };

  // Filter events to show only those the user has responded to
  const filteredEvents = events.filter((event) => {
    const userResponse = userResponses[event.id];
    if (!userResponse) return false; // Only show events user has responded to

    const eventDate = new Date(event.date);
    const isUpcoming = eventDate >= today;
    const isPast = eventDate < today;

    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterEventByCategory(event, selectedCategory);

    if (tab === "Upcoming")
      return isUpcoming && matchesCategory && matchesSearch;
    if (tab === "Past") return isPast && matchesCategory && matchesSearch;
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category) => {
    return events.filter(
      (event) =>
        userResponses[event.id] && filterEventByCategory(event, category)
    ).length;
  };

  const categories = Object.keys(categoryMap).map((name) => ({
    name,
    icon: getCategoryIcon(name),
    count: getCategoryCount(name),
  }));

  function getCategoryIcon(name) {
    const iconMap = {
      "All Categories": "✨",
      "E-Cell": "💼",
      "Arts (Dance)": "💃",
      "Arts (Drama)": "🎭",
      "Arts (Music)": "🎵",
      Sports: "🏆",
      "Content Creation": "📝",
      "Dev Club": "💻",
      Photography: "📸",
      "Debate Society": "🗣️",
      "Cultural Committee": "🎪",
    };
    return iconMap[name] || "📁";
  }

  const getResponseCounts = () => {
    const counts = {
      going: 0,
      not_going: 0,
      maybe: 0,
      volunteer: 0,
      total: 0,
    };

    Object.values(userResponses).forEach((response) => {
      if (counts.hasOwnProperty(response)) {
        counts[response]++;
        counts.total++;
      }
    });

    return counts;
  };

  const responseCounts = getResponseCounts();

  if (loading) {
    return (
      <div className="my-events-container">
        <div className="loading-container">
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-events-container">
        <div className="error-container">
          <p>Error loading events: {error}</p>
          <button onClick={fetchEvents}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-events-container">
      <div className="response-summary-panel">
        <div className="summary-panel-header">
          <TrendingUp className="summary-panel-icon" />
          <span className="summary-panel-title">Response Summary</span>
        </div>
        <div className="summary-metrics-list">
          <div className="summary-metric-item">
            <CheckCircle className="summary-metric-icon" />
            <span className="summary-metric-label">Going</span>
            <span className="summary-metric-number">
              {responseCounts.going}
            </span>
          </div>
          <div className="summary-metric-item">
            <HelpCircle className="summary-metric-icon" />
            <span className="summary-metric-label">Maybe</span>
            <span className="summary-metric-number">
              {responseCounts.maybe}
            </span>
          </div>
          <div className="summary-metric-item">
            <Users className="summary-metric-icon" />
            <span className="summary-metric-label">Volunteering</span>
            <span className="summary-metric-number">
              {responseCounts.volunteer}
            </span>
          </div>
          <div className="summary-metric-item">
            <BarChart3 className="summary-metric-icon" />
            <span className="summary-metric-label">Total</span>
            <span className="summary-metric-number">
              {responseCounts.total}
            </span>
          </div>
        </div>
      </div>
      <div className="my-events-header">
        <h1>✨ My Events ✨</h1>
        <p>Events you've responded to and your interests</p>
        <div className="my-events-search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search your events..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn">Search</button>
        </div>
      </div>

      <div className="my-events-categories">
        {categories.map((cat, index) => (
          <button
            key={index}
            className={`category-btn ${
              selectedCategory === cat.name ? "active" : ""
            }`}
            onClick={() => handleCategoryChange(cat.name)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.name}</span>
            <span className="cat-count">{cat.count}</span>
          </button>
        ))}
      </div>

      <div className="my-events-tabs">
        {["All", "Upcoming", "Past"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => handleTabChange(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="my-events-list">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <p>
              No events found. Visit the Campus Events page to RSVP to events!
            </p>
            <button
              className="browse-events-btn"
              onClick={() => navigate("/campus-events")}
            >
              Browse Events
            </button>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < today;
            const userResponse = userResponses[event.id];
            const statusDisplay = getStatusDisplay(userResponse);

            return (
              <div className="my-events-card" key={event.id}>
                <div
                  className={`my-events-badge status status-${statusDisplay.color}`}
                >
                  {statusDisplay.icon} {statusDisplay.text}
                </div>

                <img
                  src={event.image}
                  alt={event.title}
                  className="my-events-image"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x200?text=${encodeURIComponent(
                      event.title
                    )}`;
                  }}
                />

                <div className="my-events-card-body">
                  <h2>{event.title}</h2>
                  <p className="my-events-desc">{event.description}</p>

                  <div className="my-events-meta">
                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                    <p>🕒 {event.time}</p>
                    <p>📍 {event.location}</p>
                    <p>🏛️ {event.club}</p>
                    {event.registrationFee > 0 && (
                      <p>💰 ₹{event.registrationFee}</p>
                    )}
                  </div>

                  <div className="my-events-tags">
                    {event.tags.map((tag, i) => (
                      <span
                        className={`my-events-tag tag-${tag
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        key={i}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="my-events-buttons">
                    {isPast ? (
                      <div className="past-ended-msg">This event has ended</div>
                    ) : (
                      <>
                        <button
                          className="calendar-btn"
                          onClick={() => addToCalendar(event)}
                        >
                          <FaCalendarPlus /> Add to Calendar
                        </button>
                        <button
                          className="my-events-details-btn"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          View Details <FaArrowRight />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyEvents;
