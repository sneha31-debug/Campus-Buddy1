// EventCardActions.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import "./EventCardActions.css";

const EventCardActions = ({
  event,
  userResponse,
  isLoading,
  onUserResponse,
  onVolunteerResponse,
  onShowStats,
  hideViewDetails = false, // New prop to hide view details button
  hideNotGoing = false, // New prop to hide not going button
}) => {
  const navigate = useNavigate();
  const { isStudent, isClub } = useAuth();

  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };

  const handleGoingClick = () => {
    if (userResponse !== "going" && !isLoading) {
      onUserResponse(event.id, "going");
    }
  };

  const handleMaybeClick = () => {
    if (userResponse !== "maybe" && !isLoading) {
      onUserResponse(event.id, "maybe");
    }
  };

  const handleNotGoingClick = () => {
    if (userResponse !== "not_going" && !isLoading) {
      onUserResponse(event.id, "not_going");
    }
  };

  const handleVolunteerClick = () => {
    if (userResponse !== "volunteer" && !isLoading) {
      onVolunteerResponse(event.id);
    }
  };

  const handleStatsClick = () => {
    onShowStats(event);
  };

  // Student Actions
  if (isStudent()) {
    return (
      <div className="event-actions student-actions">
        {!hideViewDetails && (
          <button
            className="action-btn view-details"
            onClick={handleViewDetails}
            title="View event details"
          >
            👁️ View Details
          </button>
        )}

        <button
          className={`action-btn going ${
            userResponse === "going" ? "active" : ""
          }`}
          onClick={handleGoingClick}
          disabled={userResponse === "going" || isLoading}
          title={
            userResponse === "going"
              ? "You're already going to this event"
              : "Mark as going"
          }
        >
          {isLoading && userResponse !== "going"
            ? "⏳"
            : userResponse === "going"
            ? "✓ Going"
            : "Going"}
        </button>

        <button
          className={`action-btn maybe ${
            userResponse === "maybe" ? "active" : ""
          }`}
          onClick={handleMaybeClick}
          disabled={userResponse === "maybe" || isLoading}
          title={
            userResponse === "maybe"
              ? "You're marked as maybe"
              : "Mark as maybe"
          }
        >
          {isLoading && userResponse !== "maybe"
            ? "⏳"
            : userResponse === "maybe"
            ? "? Maybe"
            : "Maybe"}
        </button>

        {!hideNotGoing && (
          <button
            className={`action-btn not-going ${
              userResponse === "not_going" ? "active" : ""
            }`}
            onClick={handleNotGoingClick}
            disabled={userResponse === "not_going" || isLoading}
            title={
              userResponse === "not_going"
                ? "You're not going to this event"
                : "Mark as not going"
            }
          >
            {isLoading && userResponse !== "not_going"
              ? "⏳"
              : userResponse === "not_going"
              ? "✗ Not Going"
              : "Not Going"}
          </button>
        )}

        {event.needsVolunteers && (
          <button
            className={`action-btn volunteer ${
              userResponse === "volunteer" ? "active" : ""
            }`}
            onClick={handleVolunteerClick}
            disabled={userResponse === "volunteer" || isLoading}
            title={
              userResponse === "volunteer"
                ? "You've volunteered for this event"
                : "Volunteer for this event"
            }
          >
            {isLoading && userResponse !== "volunteer"
              ? "⏳"
              : userResponse === "volunteer"
              ? "🙋‍♂️ Volunteered"
              : "🙋‍♂️ Volunteer"}
          </button>
        )}
      </div>
    );
  }

  // Club Actions
  if (isClub()) {
    return (
      <div className="event-actions club-actions">
        {!hideViewDetails && (
          <button
            className="action-btn view-details"
            onClick={handleViewDetails}
            title="View event details"
          >
            👁️ View Details
          </button>
        )}

        <button
          className="action-btn stats"
          onClick={handleStatsClick}
          title="View event statistics"
        >
          📊 Stats
        </button>

        {/* <button
          className="action-btn edit"
          onClick={() => navigate(`/events/${event.id}/edit`)}
          title="Edit event"
        >
          ✏️ Edit
        </button>

        <button
          className="action-btn manage"
          onClick={() => navigate(`/events/${event.id}/manage`)}
          title="Manage event"
        >
          ⚙️ Manage
        </button> */}
      </div>
    );
  }

  // Default Actions (for other user types)
  return (
    <div className="event-actions default-actions">
      {!hideViewDetails && (
        <button
          className="action-btn view-details"
          onClick={handleViewDetails}
          title="View event details"
        >
          👁️ View Details
        </button>
      )}
    </div>
  );
};

export default EventCardActions;
