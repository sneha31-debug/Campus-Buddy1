import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockEvents } from "../data/mockEvents";
import "./EventDetails.css";
import { FaArrowLeft } from "react-icons/fa";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const foundEvent = mockEvents.find((e) => e.id === parseInt(id));
    setEvent(foundEvent);
  }, [id]);

  const updateStatus = (status) => {
    setEvent({ ...event, status });
  };

  if (!event) return <p className="loading">Loading...</p>;

  return (
    <div className="event-details-wrapper">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="event-details-card">
        <h1 className="event-title">{event.title}</h1>

        <section className="event-section">
          <h2>Description</h2>
          <p className="event-description">{event.description}</p>
        </section>

        <section className="event-section">
          <h2>Event Information</h2>
          <ul className="event-info-list">
            <li><strong>Date:</strong> {event.date}</li>
            <li><strong>Time:</strong> {event.time}</li>
            <li><strong>Location:</strong> {event.location}</li>
            <li><strong>Status:</strong> {event.status}</li>
          </ul>
        </section>

        <section className="event-section">
          <h2>Tags</h2>
          <div className="event-tags">
            {event.tags.map((tag, index) => (
              <span className="tag" key={index}>{tag}</span>
            ))}
          </div>
        </section>

        <section className="event-section">
          <h2>RSVP</h2>
          <div className="rsvp-buttons">
            <button
              onClick={() => updateStatus("Going")}
              className={`going ${event.status === "Going" ? "selected" : ""}`}
            >
              ✔ Going
            </button>
            <button
              onClick={() => updateStatus("Not Going")}
              className={`not-going ${event.status === "Not Going" ? "selected" : ""}`}
            >
              ✖ Not Going
            </button>
            <button
              onClick={() => updateStatus("Maybe")}
              className={`maybe ${event.status === "Maybe" ? "selected" : ""}`}
            >
              🤔 Maybe
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventDetails;
