import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Upload, X, Plus } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import { useToast } from "../components/ToastContext.jsx";
import "./CreateEventForm.css";

const CreateEventForm = () => {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [allClubs, setAllClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [showAddClubForm, setShowAddClubForm] = useState(false);
  const [newClubData, setNewClubData] = useState({
    name: "",
    description: "",
    contact_email: "",
    category: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    venue: "",
    tags: [],
    rsvp_limit: "",
    poster_url: "", // Changed from 'poster: null' to 'poster_url: ""'
    event_type: "optional",
    target_batch_year: "",
    max_volunteers: "",
  });

  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingClub, setAddingClub] = useState(false);

  // Fetch event types from JSON server
  const fetchEventTypes = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/eventTypes");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEventTypes(data);
    } catch (error) {
      console.error("Error fetching event types:", error);
      setEventTypes([
        { value: "optional", label: "Optional" },
        { value: "compulsory", label: "Compulsory" },
        { value: "batch_compulsory", label: "Batch Compulsory" },
      ]);
    }
  }, []);

  // Fetch available tags from JSON server
  const fetchAvailableTags = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/tags");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const tagNames = data.map((tag) => tag.name);
      setAvailableTags(tagNames || []);
    } catch (error) {
      console.error("Error fetching event tags:", error);
      setAvailableTags([
        "workshop",
        "seminar",
        "social",
        "sports",
        "cultural",
        "technical",
        "academic",
        "networking",
        "competition",
        "meeting",
      ]);
    }
  }, []);

  // Fetch clubs from JSON server
  const fetchClubs = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/clubs");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllClubs(data || []);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      addToast({
        type: "error",
        message: "Failed to fetch clubs. " + error.message,
      });
      setAllClubs([]);
    }
  }, [addToast]);

  // Fetch all required data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClubs(),
        fetchEventTypes(),
        fetchAvailableTags(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      addToast({
        type: "error",
        message: "Failed to load form data. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchClubs, fetchEventTypes, fetchAvailableTags, addToast]);

  // Add new club to JSON server
  const handleAddNewClub = async (e) => {
    e.preventDefault();
    if (!newClubData.name.trim()) {
      addToast({
        type: "error",
        message: "Club name is required.",
      });
      return;
    }

    setAddingClub(true);
    try {
      const clubData = {
        name: newClubData.name.trim(),
        description: newClubData.description.trim(),
        contact_email: newClubData.contact_email.trim() || user?.email || "",
        category: newClubData.category.trim() || "General",
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: user?.id || "anonymous",
      };

      const response = await fetch("http://localhost:3001/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clubData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newClub = await response.json();

      // Update clubs list and select the new club
      setAllClubs((prev) => [...prev, newClub]);
      setSelectedClubId(newClub.id);

      // Reset form and hide it
      setNewClubData({
        name: "",
        description: "",
        contact_email: "",
        category: "",
      });
      setShowAddClubForm(false);

      addToast({
        type: "success",
        message: "Club added successfully!",
      });
    } catch (error) {
      console.error("Error adding club:", error);
      addToast({
        type: "error",
        message: `Failed to add club: ${error.message}`,
      });
    } finally {
      setAddingClub(false);
    }
  };

  useEffect(() => {
    if (user !== undefined) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewClubInputChange = (e) => {
    const { name, value } = e.target;
    setNewClubData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setFormData((prev) => ({ ...prev, tags: newTags }));
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  const handlePosterUrlChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, poster_url: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast({
        type: "error",
        message: "You must be logged in to create an event.",
      });
      return;
    }

    if (!selectedClubId) {
      addToast({ type: "error", message: "Please select a club." });
      return;
    }

    setSubmitting(true);

    try {
      // Validate event date is not in the past
      const eventDate = new Date(formData.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        addToast({
          type: "error",
          message: "Event date cannot be in the past.",
        });
        setSubmitting(false);
        return;
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        event_date: formData.event_date,
        event_time: formData.event_time,
        venue: formData.venue.trim(),
        created_by: user?.id || "anonymous",
        club_id: selectedClubId,
        event_type: formData.event_type,
        tags: formData.tags.length > 0 ? formData.tags : [],
        max_volunteers: formData.max_volunteers
          ? parseInt(formData.max_volunteers)
          : 0,
        target_batch_year: formData.target_batch_year
          ? parseInt(formData.target_batch_year)
          : null,
        needs_volunteers:
          formData.max_volunteers && parseInt(formData.max_volunteers) > 0,
        rsvp_limit: formData.rsvp_limit ? parseInt(formData.rsvp_limit) : null,
        poster_url: formData.poster_url.trim() || null, // Save URL directly
        status: "upcoming",
        is_active: true,
        attendees_count: 0,
        created_at: new Date().toISOString(),
      };

      // Submit event to JSON Server
      const response = await fetch("http://localhost:3001/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const insertedEvent = await response.json();

      // Remove the poster upload logic - URL is already saved above

      addToast({ type: "success", message: "Event created successfully!" });

      // Reset form
      setFormData({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        venue: "",
        tags: [],
        rsvp_limit: "",
        poster_url: "", // Changed from 'poster: null' to 'poster_url: ""'
        event_type: "optional",
        target_batch_year: "",
        max_volunteers: "",
      });
      setSelectedTags([]);
      setSelectedClubId("");
      document.getElementById("event-form").reset();
    } catch (error) {
      console.error("Event creation error:", error);
      addToast({
        type: "error",
        message: `Event creation failed: ${error.message}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_date: "",
      event_time: "",
      venue: "",
      tags: [],
      rsvp_limit: "",
      poster_url: "", // Changed from 'poster: null' to 'poster_url: ""'
      event_type: "optional",
      target_batch_year: "",
      max_volunteers: "",
    });
    setSelectedTags([]);
    setSelectedClubId("");
    setShowAddClubForm(false);
    setNewClubData({
      name: "",
      description: "",
      contact_email: "",
      category: "",
    });
    document.getElementById("event-form")?.reset();
  };

  // Loading state
  if (loading) {
    return (
      <div className="form-container">
        <div className="form-wrapper">
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div
              className="spinner"
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                animation: "spin 2s linear infinite",
                margin: "0 auto 20px",
              }}
            ></div>
            <p>Loading form data...</p>
            <button
              onClick={fetchAllData}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Retry Loading Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      id="event-form"
      className="form-container"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="form-wrapper">
        <h1 className="form-title">Create New Event</h1>
        <div className="form-content">
          {/* Club Selection with Add New Club Option */}
          <div className="form-group">
            <label htmlFor="club_id" className="form-label">
              Club <span className="required">*</span>
            </label>
            <div className="club-selection-container">
              <select
                id="club_id"
                name="club_id"
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="form-input"
                required
                style={{ marginBottom: "10px" }}
              >
                <option value="" disabled>
                  {allClubs.length === 0
                    ? "No clubs available"
                    : "Select a club"}
                </option>
                {allClubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddClubForm(!showAddClubForm)}
                className="add-club-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#374151",
                  transition: "all 0.2s",
                }}
              >
                <Plus size={16} />
                Add New Club
              </button>
            </div>

            {/* Add New Club Form */}
            {showAddClubForm && (
              <div
                className="add-club-form"
                style={{
                  marginTop: "15px",
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "15px",
                    fontSize: "16px",
                    color: "#374151",
                  }}
                >
                  Add New Club
                </h3>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="form-label">
                    Club Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newClubData.name}
                    onChange={handleNewClubInputChange}
                    className="form-input"
                    placeholder="Enter club name"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={newClubData.description}
                    onChange={handleNewClubInputChange}
                    className="form-textarea"
                    placeholder="Brief description of the club"
                    rows={3}
                  />
                </div>

                <div className="form-row" style={{ marginBottom: "15px" }}>
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={newClubData.contact_email}
                      onChange={handleNewClubInputChange}
                      className="form-input"
                      placeholder="contact@club.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={newClubData.category}
                      onChange={handleNewClubInputChange}
                      className="form-input"
                      placeholder="e.g., Technical, Cultural, Sports"
                    />
                  </div>
                </div>

                <div
                  className="form-buttons"
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                    marginTop: "15px",
                    paddingTop: "15px",
                    borderTop: "1px solid #e9ecef",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddClubForm(false);
                      setNewClubData({
                        name: "",
                        description: "",
                        contact_email: "",
                        category: "",
                      });
                    }}
                    className="btn btn-cancel"
                    disabled={addingClub}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewClub}
                    className="btn btn-create"
                    disabled={addingClub}
                  >
                    {addingClub ? "Adding..." : "Add Club"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Event Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Event Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter event title"
              maxLength={255}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="form-textarea"
              placeholder="Describe your event..."
              required
            />
          </div>

          {/* Date and Time */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_date" className="form-label">
                Date <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <input
                  id="event_date"
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  className="form-input icon-input"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                <Calendar className="input-icon" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="event_time" className="form-label">
                Time <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <input
                  id="event_time"
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleInputChange}
                  className="form-input icon-input"
                  required
                />
                <Clock className="input-icon" />
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="form-group">
            <label htmlFor="venue" className="form-label">
              Venue <span className="required">*</span>
            </label>
            <input
              id="venue"
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter venue location"
              maxLength={255}
              required
            />
          </div>

          {/* Event Type */}
          <div className="form-group">
            <label htmlFor="event_type" className="form-label">
              Event Type
            </label>
            <select
              id="event_type"
              name="event_type"
              value={formData.event_type}
              onChange={handleInputChange}
              className="form-input"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Batch Year and Max Volunteers */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="target_batch_year" className="form-label">
                Target Batch Year
              </label>
              <input
                id="target_batch_year"
                type="number"
                name="target_batch_year"
                value={formData.target_batch_year}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 2025"
                min="2020"
                max="2030"
              />
            </div>
            <div className="form-group">
              <label htmlFor="max_volunteers" className="form-label">
                Max Volunteers
              </label>
              <input
                id="max_volunteers"
                type="number"
                name="max_volunteers"
                value={formData.max_volunteers}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 10"
                min="0"
              />
            </div>
          </div>

          {/* RSVP Limit */}
          <div className="form-group">
            <label htmlFor="rsvp_limit" className="form-label">
              RSVP Limit
            </label>
            <input
              id="rsvp_limit"
              type="number"
              name="rsvp_limit"
              value={formData.rsvp_limit}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Maximum attendees"
              min="1"
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tags-container">
              <div
                className="tags-selector"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
              >
                <div className="selected-tags">
                  {selectedTags.length === 0 ? (
                    <span className="placeholder">Select tags</span>
                  ) : (
                    selectedTags.map((tag) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                        <X
                          className="tag-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag);
                          }}
                        />
                      </span>
                    ))
                  )}
                </div>
                <div className="dropdown-arrow">▼</div>
              </div>
              {showTagDropdown && (
                <div className="tags-dropdown">
                  {availableTags.map((tag) => (
                    <div
                      key={tag}
                      className={`tag-option ${
                        selectedTags.includes(tag) ? "selected" : ""
                      }`}
                      onClick={() => {
                        handleTagSelect(tag);
                        setShowTagDropdown(false);
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="poster_url" className="form-label">
              Event Poster URL
            </label>
            <input
              id="poster_url"
              type="url"
              name="poster_url"
              value={formData.poster_url}
              onChange={handlePosterUrlChange}
              className="form-input"
              placeholder="https://example.com/poster.jpg"
            />
            <p
              className="upload-subtext"
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "#6b7280",
              }}
            >
              Enter a direct URL to an image (PNG, JPG, GIF)
            </p>
            {/* Optional: Preview the image if URL is provided */}
            {formData.poster_url && (
              <div style={{ marginTop: "1rem" }}>
                <img
                  src={formData.poster_url}
                  alt="Poster preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.target.style.display = "block";
                  }}
                />
              </div>
            )}
          </div>

          {/* Form Buttons */}
          <div className="form-buttons">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-create"
              disabled={submitting}
            >
              {submitting ? <div className="spinner"></div> : "Create Event"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateEventForm;
