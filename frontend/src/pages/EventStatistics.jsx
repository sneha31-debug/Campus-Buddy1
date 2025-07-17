import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Clock,
  Mail,
  DollarSign,
} from "lucide-react";
import "./EventStatistics.css";

const EventStatisticsModal = ({ event, isOpen, onClose }) => {
  const [rsvpData, setRsvpData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching RSVP data from JSON Server
  useEffect(() => {
    if (isOpen && event) {
      fetchRsvpData();
    }
  }, [isOpen, event]);

  const fetchRsvpData = async () => {
    try {
      setLoading(true);

      // In a real implementation, you would fetch from JSON Server:
      // const response = await fetch(`http://localhost:3001/event_attendance?event_id=${event.id}`);
      // const data = await response.json();

      // For now, we'll simulate realistic data based on the event's attendees count
      const totalAttendees = event.attendees || 0;
      const goingCount = Math.floor(totalAttendees * 0.7); // 70% going
      const maybeCount = Math.floor(totalAttendees * 0.2); // 20% maybe
      const notGoingCount = totalAttendees - goingCount - maybeCount; // remainder not going

      const simulatedData = [
        {
          status: "Going",
          count: goingCount,
          color: "#4CAF50",
          percentage: Math.round((goingCount / totalAttendees) * 100) || 0,
        },
        {
          status: "Maybe",
          count: maybeCount,
          color: "#FF9800",
          percentage: Math.round((maybeCount / totalAttendees) * 100) || 0,
        },
        {
          status: "Not Going",
          count: notGoingCount,
          color: "#F44336",
          percentage: Math.round((notGoingCount / totalAttendees) * 100) || 0,
        },
      ];

      setRsvpData(simulatedData);
    } catch (error) {
      console.error("Error fetching RSVP data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      icon: <Users className="icon-sm" />,
      value: event?.attendees || 0,
      label: "Total Interested",
      color: "#4A90E2",
    },
    {
      icon: <Calendar className="icon-sm" />,
      value: event?.status === "upcoming" ? "Upcoming" : "Past",
      label: "Event Status",
      color: event?.status === "upcoming" ? "#7ED321" : "#9B9B9B",
    },
    {
      icon: <Clock className="icon-sm" />,
      value: event?.duration_hours ? `${event.duration_hours}h` : "N/A",
      label: "Duration",
      color: "#9013FE",
    },
    {
      icon: <DollarSign className="icon-sm" />,
      value: event?.registration_fee ? `₹${event.registration_fee}` : "Free",
      label: "Registration",
      color: event?.registration_fee ? "#D0021B" : "#4CAF50",
    },
  ];

  // Calculate year-wise distribution (simulated)
  const yearDistribution = [
    {
      year: "1st Year",
      count: Math.floor((event?.attendees || 0) * 0.35),
      percentage: 35,
    },
    {
      year: "2nd Year",
      count: Math.floor((event?.attendees || 0) * 0.25),
      percentage: 25,
    },
    {
      year: "3rd Year",
      count: Math.floor((event?.attendees || 0) * 0.25),
      percentage: 25,
    },
    {
      year: "4th Year",
      count: Math.floor((event?.attendees || 0) * 0.15),
      percentage: 15,
    },
  ];

  if (!isOpen || !event) return null;

  return (
    <div className="event-stats-modal-overlay">
      <div className="event-stats-modal-container">
        {/* Header */}
        <div className="event-stats-modal-header">
          <div className="event-stats-header-content">
            <TrendingUp className="event-stats-icon-md event-stats-header-icon" />
            <h2 className="event-stats-header-title">Event Statistics</h2>
          </div>
          <button onClick={onClose} className="event-stats-close-button">
            <X className="event-stats-icon-md" />
          </button>
        </div>

        {/* Event Info */}
        <div className="event-stats-event-info-section">
          <div className="event-stats-event-header">
            <span className="event-stats-event-emoji">
              {event.imagePlaceholder}
            </span>
            <div>
              <h3 className="event-stats-event-name">{event.name}</h3>
              <span className="event-stats-event-category">
                {event.category}
              </span>
            </div>
          </div>

          <div className="event-stats-event-details">
            <div className="event-stats-detail-item">
              <Calendar className="event-stats-icon-xs" />
              <span>
                {event.date} • {event.time}
              </span>
            </div>
            <div className="event-stats-detail-item">
              <MapPin className="event-stats-icon-xs" />
              <span>{event.venue}</span>
            </div>
            <div className="event-stats-detail-item">
              <Mail className="event-stats-icon-xs" />
              <span>{event.contact_email || "N/A"}</span>
            </div>
          </div>

          <div className="event-stats-tags-container">
            {event.tags?.map((tag, index) => (
              <span key={index} className="event-stats-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="event-stats-stats-section">
          <div className="event-stats-stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="event-stats-stat-card">
                <div
                  className="event-stats-stat-icon"
                  style={{ color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div
                  className="event-stats-stat-value"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="event-stats-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RSVP Section */}
        <div className="event-stats-rsvp-section">
          <h3 className="event-stats-section-title">
            <TrendingUp className="event-stats-icon-sm" />
            RSVP Breakdown
          </h3>

          {loading ? (
            <div className="event-stats-loading-container">
              <div className="event-stats-spinner"></div>
              <p className="event-stats-loading-text">Loading statistics...</p>
            </div>
          ) : (
            <div className="event-stats-rsvp-list">
              {rsvpData.map((item, index) => (
                <div key={index} className="event-stats-rsvp-item">
                  <div className="event-stats-rsvp-left">
                    <span className="event-stats-rsvp-status">
                      {item.status}
                    </span>
                    <div className="event-stats-progress-bar">
                      <div
                        className="event-stats-progress-fill"
                        style={{
                          backgroundColor: item.color,
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="event-stats-rsvp-right">
                    <span className="event-stats-rsvp-percentage">
                      {item.percentage}%
                    </span>
                    <span
                      className="event-stats-rsvp-count"
                      style={{ color: item.color }}
                    >
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Year Distribution */}
        <div className="event-stats-year-distribution-section">
          <h3 className="event-stats-section-title">
            Audience by Year of Study
          </h3>
          <div className="event-stats-year-list">
            {yearDistribution.map((item, index) => (
              <div key={index} className="event-stats-year-item">
                <div className="event-stats-year-left">
                  <span className="event-stats-year-label">{item.year}</span>
                  <div className="event-stats-progress-bar">
                    <div
                      className="event-stats-progress-fill event-stats-year-progress"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="event-stats-year-right">
                  <span className="event-stats-year-percentage">
                    {item.percentage}%
                  </span>
                  <span className="event-stats-year-count">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventStatisticsModal;
