import React, { useState, useEffect } from "react";
import "./MyEvents.css";
import { mockEvents as initialEvents } from "../data/mockEvents";
import { FaCalendarPlus, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const categoryMap = {
  "All Categories": [],
  Technology: ["tech", "ai", "coding", "dev club"],
  "Arts & Culture": ["arts", "drama", "cultural", "dance"],
  Robotics: ["robotics"],
  Astronomy: ["astronomy"],
  "Sports & Fitness": ["sports", "fitness"],
  Esports: ["esports", "gaming"],
  "E-cell": ["e-cell", "entrepreneurship", "startup"],
  Workshops: ["workshop", "workshops"],
  Hackathons: ["hackathon", "hackathons"],
};

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const today = new Date();

  useEffect(() => {
    const savedTab = sessionStorage.getItem("myEventsTab");
    const savedCategory = sessionStorage.getItem("myEventsCategory");

    if (savedTab) setTab(savedTab);
    if (savedCategory) setSelectedCategory(savedCategory);

    const rsvpStatus = JSON.parse(localStorage.getItem("rsvpStatus")) || {};
    const updatedEvents = initialEvents.map((e) => ({
      ...e,
      status: rsvpStatus[e.id] || e.status || "",
    }));
    setEvents(updatedEvents);
  }, []);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    sessionStorage.setItem("myEventsTab", newTab);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    sessionStorage.setItem("myEventsCategory", category);
  };

  const addToCalendar = (event) => {
    const dateStr = event.date.replace(/-/g, "");
    const timeStr = event.time.replace(":", "");
    const link = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${dateStr}T${timeStr}00Z/${dateStr}T${timeStr}00Z&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}`;
    window.open(link, "_blank");
  };

  const filterEventByCategory = (event, category) => {
    if (category === "All Categories") return true;

    const keywords = categoryMap[category].map((k) => k.toLowerCase());
    return event.tags.some((tag) =>
      keywords.some((kw) => tag.toLowerCase().includes(kw))
    );
  };

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const isUpcoming = eventDate >= today;
    const isPast = eventDate < today;

    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterEventByCategory(event, selectedCategory);

    if (tab === "Upcoming") return isUpcoming && matchesCategory && matchesSearch;
    if (tab === "Past") return isPast && matchesCategory && matchesSearch;
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category) => {
    return events.filter((event) => filterEventByCategory(event, category)).length;
  };

  const categories = Object.keys(categoryMap).map((name) => ({
    name,
    icon: getCategoryIcon(name),
    count: getCategoryCount(name),
  }));

  function getCategoryIcon(name) {
    const iconMap = {
      "All Categories": "✨",
      Technology: "💻",
      "Arts & Culture": "🎨",
      Robotics: "🤖",
      Astronomy: "🔭",
      "Sports & Fitness": "🏆",
      Esports: "🎮",
      "E-cell": "💼",
      Workshops: "🛠️",
      Hackathons: "⚡",
    };
    return iconMap[name] || "📁";
  }

  return (
    <div className="my-events-container">
      <div className="my-events-header">
        <h1>✨ My Events ✨</h1>
        <p>Explore events and manage your interests</p>

        <div className="my-events-search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search clubs, activities, or interests..."
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
            className={`category-btn ${selectedCategory === cat.name ? "active" : ""}`}
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
        {filteredEvents.map((event) => {
          const eventDate = new Date(event.date);
          const isPast = eventDate < today;

          return (
            <div className="my-events-card" key={event.id}>
              {!isPast && <div className="my-events-badge status">{event.status}</div>}

              <img src={event.image} alt={event.title} className="my-events-image" />

              <div className="my-events-card-body">
                <h2>{event.title}</h2>
                <p className="my-events-desc">{event.description}</p>

                <div className="my-events-meta">
                  <p>📅 {event.date}</p>
                  <p>🕒 {event.time}</p>
                  <p>📍 {event.location}</p>
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
                      <button className="calendar-btn" onClick={() => addToCalendar(event)}>
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
        })}
      </div>
    </div>
  );
};

export default MyEvents;
