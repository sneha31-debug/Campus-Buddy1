import React, { useState, useEffect } from "react";
import "./MyEvents.css";
import { mockEvents as initialEvents } from "../data/mockEvents";
import { FaCalendarPlus, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const navigate = useNavigate();
  const today = new Date();

  useEffect(() => {
    setEvents(initialEvents);
  }, []);

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const matchesCategory =
      selectedCategory === "All Categories" ||
      event.tags.some((tag) =>
        tag.toLowerCase().includes(selectedCategory.toLowerCase())
      );

    if (tab === "All") return matchesCategory;
    if (tab === "Upcoming") return eventDate >= today && matchesCategory;
    if (tab === "Past") return eventDate < today && matchesCategory;
    if (tab === "Attending") return event.status === "Going" && matchesCategory;
    return matchesCategory;
  });

  const getAttendancePercentage = (event) => {
    if (!event.attendees || !event.capacity) return 0;
    return Math.round((event.attendees / event.capacity) * 100);
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

  const categories = [
    { name: "All Categories", icon: "✨", count: 24 },
    { name: "Technology", icon: "💻", count: 6 },
    { name: "Arts & Culture", icon: "🎨", count: 5 },
    { name: "Sports & Fitness", icon: "🏆", count: 4 },
    { name: "Music & Performance", icon: "🎵", count: 3 },
    { name: "Environment", icon: "🌱", count: 2 },
    { name: "Business", icon: "💼", count: 4 },
    { name: "Workshops", icon: "🛠️", count: 3 },
    { name: "AI", icon: "🧠", count: 2 },
    { name: "Hackathons", icon: "⚡", count: 2 },
  ];

  return (
    <div className="my-events-container">
      <div className="my-events-header">
        <h1>✨ My Events ✨</h1>
        <p>Events you're attending or considering</p>
      </div>

      {/* 🔄 Scrollable Categories (No white wrapper) */}
      <div className="my-events-categories">
        {categories.map((cat, index) => (
          <button
            key={index}
            className={`category-btn ${
              selectedCategory === cat.name ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.name}</span>
            <span className="cat-count">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* 🔄 Tabs */}
      <div className="my-events-tabs">
        {["All", "Upcoming", "Attending", "Past"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 🔄 Event List */}
      <div className="my-events-list">
        {filteredEvents.map((event) => {
          const attendance = getAttendancePercentage(event);
          return (
            <div className="my-events-card" key={event.id}>
              <div className="my-events-badge status">{event.status}</div>
              <img
                src={event.image}
                alt={event.title}
                className="my-events-image"
              />

              <div className="my-events-card-body">
                <h2>{event.title}</h2>
                <p className="my-events-desc">{event.description}</p>

                <div className="my-events-meta">
                  <p>📅 {event.date}</p>
                  <p>🕒 {event.time}</p>
                  <p>📍 {event.location}</p>
                </div>

                <div className="my-events-progress">
                  <p>{attendance}% filled</p>
                  <div className="my-events-bar">
                    <div
                      className="my-events-fill"
                      style={{ width: `${attendance}%` }}
                    ></div>
                  </div>
                </div>

                <div className="my-events-tags">
                  {event.tags.map((tag, i) => (
                    <span
                      className={`my-events-tag tag-${tag.toLowerCase()}`}
                      key={i}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="my-events-buttons">
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
