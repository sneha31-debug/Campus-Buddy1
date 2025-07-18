import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import "./ClubProfileCard.css";
import ApiService from "../services/api";

const ClubProfileCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, supabase } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [clubData, setClubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventsCount, setEventsCount] = useState(null);
  const [editData, setEditData] = useState({
    club_name: "",
    club_email: "",
    contact_person: "",
    contact_phone: "",
    description: "",
    website: "",
  });

  const insertInitialClubData = async () => {
    if (!user?.id || !supabase) return;

    try {
      const clubRecord = {
        id: user.id,
        name: user.user_metadata?.club_name || "", // Map to 'name' column
        contact_email: user.user_metadata?.email || user.email || "", // Map to 'contact_email' column
        contact_phone: user.user_metadata?.contact_phone || "",
        description: user.user_metadata?.description || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("clubs")
        .insert([clubRecord])
        .select()
        .single();

      if (error) {
        console.error("Error inserting club data:", error);
        setError(`Failed to create club record: ${error.message}`);
        return;
      }

      const mappedData = {
        id: data.id,
        club_name: data.name,
        club_email: data.contact_email,
        contact_person:
          user.user_metadata?.contact_person ||
          user.user_metadata?.full_name ||
          "",
        contact_phone: data.contact_phone,
        club_category: user.user_metadata?.club_category || "",
        established_year: user.user_metadata?.established_year || null,
        description: data.description,
        website: user.user_metadata?.website || "",
        logo_url: data.logo_url,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        role: user.user_metadata?.role || "club",
      };

      setClubData(mappedData);
      setEditData({
        club_name: mappedData.club_name || "",
        club_email: mappedData.club_email || "",
        contact_person: mappedData.contact_person || "",
        contact_phone: mappedData.contact_phone || "",
        description: mappedData.description || "",
        website: mappedData.website || "",
      });
    } catch (err) {
      console.error("Insert error:", err);
      setError(`Failed to create club record: ${err.message}`);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    // Use auth metadata immediately - accessing metadata directly from user object
    const metadata = user.user_metadata || {};

    const fallbackData = {
      id: user.id,
      club_name: metadata.club_name || "",
      club_email: metadata.email || user.email || "",
      contact_person: metadata.contact_person || metadata.full_name || "",
      contact_phone: metadata.contact_phone || "",
      club_category: metadata.club_category || "",
      established_year: metadata.established_year || null,
      description: metadata.description || "",
      website: metadata.website || "",
      role: metadata.role || metadata.user_type || "club",
      created_at: user.created_at,
      email_verified: metadata.email_verified || false,
      phone_verified: metadata.phone_verified || false,
    };

    setClubData(fallbackData);
    setEditData({
      club_name: fallbackData.club_name,
      club_email: fallbackData.club_email,
      contact_person: fallbackData.contact_person,
      contact_phone: fallbackData.contact_phone,
      description: fallbackData.description,
      website: fallbackData.website,
    });
    setLoading(false);

    const fetchFromDatabase = async () => {
      try {
        if (!supabase) {
          return;
        }

        const { data: dbClubData, error: dbError } = await supabase
          .from("clubs")
          .select("*")
          .eq("id", user.id)
          .single();

        if (dbError) {
          if (dbError.code === "PGRST116") {
            await insertInitialClubData();
          } else {
            setError(`Database error: ${dbError.message}`);
          }
          return;
        }

        if (dbClubData) {
          const mappedData = {
            id: dbClubData.id,
            club_name: dbClubData.name || "", // Map 'name' to 'club_name'
            club_email: dbClubData.contact_email || "", // Map 'contact_email' to 'club_email'
            contact_person: metadata.contact_person || metadata.full_name || "",
            contact_phone: dbClubData.contact_phone || "",
            club_category: metadata.club_category || "",
            established_year: metadata.established_year || null,
            description: dbClubData.description || "",
            website: metadata.website || "",
            logo_url: dbClubData.logo_url,
            is_active: dbClubData.is_active,
            created_at: dbClubData.created_at,
            updated_at: dbClubData.updated_at,
            role: metadata.role || metadata.user_type || "club",
            email_verified: metadata.email_verified || false,
            phone_verified: metadata.phone_verified || false,
          };

          setClubData(mappedData);
          setEditData({
            club_name: mappedData.club_name || "",
            club_email: mappedData.club_email || "",
            contact_person: mappedData.contact_person || "",
            contact_phone: mappedData.contact_phone || "",
            description: mappedData.description || "",
            website: mappedData.website || "",
          });
        }
      } catch (error) {
        console.error("Background database fetch failed:", error);
        setError(`Failed to fetch data: ${error.message}`);
      }
    };

    fetchFromDatabase();
  }, [user, supabase]);

  useEffect(() => {
    const fetchEventsCount = async () => {
      if (!clubData?.club_email) return;
      try {
        const data = await ApiService.getClubs();
        console.log("Fetched clubs data:", data); // debug
        // Match by contact_email instead of club_email
        const matchingClub = data.find(
          (club) => club.contact_email === clubData.club_email
        );
        console.log("Matching club found:", matchingClub);
        if (matchingClub) {
          setEventsCount(matchingClub.events_hosted || 0);
        } else {
          setEventsCount(0);
        }
      } catch (err) {
        console.error("Error fetching events count:", err);
        setEventsCount(0);
      }
    };
    fetchEventsCount();
  }, [clubData]);

  const handleClose = () => {
    if (location.state && location.state.from) {
      navigate(location.state.from, { replace: true });
    } else {
      navigate("/clubpage", { replace: true });
    }
  };

  // const handleEdit = () => {
  //   setIsEditing(true);
  // };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Update clubs table
      const { error: clubError } = await supabase
        .from("clubs")
        .update({
          name: editData.club_name,
          contact_email: editData.club_email,
          contact_phone: editData.contact_phone,
          description: editData.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (clubError) {
        console.error("Error updating club:", clubError);
        setError(`Failed to update profile: ${clubError.message}`);
        return;
      }

      // Update user metadata (for contact_person and website)
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          contact_person: editData.contact_person,
          website: editData.website,
        },
      });

      if (metaError) {
        console.error("Error updating metadata:", metaError);
        setError(
          `Failed to update contact person/website: ${metaError.message}`
        );
        return;
      }

      // Update local state
      setClubData((prev) => ({
        ...prev,
        club_name: editData.club_name,
        club_email: editData.club_email,
        contact_person: editData.contact_person,
        contact_phone: editData.contact_phone,
        description: editData.description,
        website: editData.website,
      }));

      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (clubData) {
      setEditData({
        club_name: clubData.club_name || "",
        club_email: clubData.club_email || "",
        contact_person: clubData.contact_person || "",
        contact_phone: clubData.contact_phone || "",
        description: clubData.description || "",
        website: clubData.website || "",
      });
    }
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await signOut();

      if (result.success) {
        setClubData(null);
        setEditData({
          club_name: "",
          club_email: "",
          contact_person: "",
          contact_phone: "",
          description: "",
          website: "",
        });
        navigate("/login", { replace: true });
      } else {
        setError(`Failed to sign out: ${result.error}`);
      }
    } catch (error) {
      console.error("Sign out error:", error);
      setError(`Failed to sign out: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatMemberSince = () => {
    if (!clubData?.created_at) return "Unknown";

    const date = new Date(clubData.created_at);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getClubInitials = () => {
    if (!clubData?.club_name) return "CL";
    return clubData.club_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="profile-overlay">
        <div className="profile-card">
          <div className="loading-spinner">
            <p>Loading club profile...</p>
            <button onClick={handleClose} className="close-btn">
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!clubData) {
    return (
      <div className="profile-overlay">
        <div className="profile-card">
          <div className="error-message">
            <p>Failed to load club profile data</p>
            <button onClick={handleClose} className="close-btn">
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-overlay">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-image">
            {clubData.logo_url ? (
              <img
                src={clubData.logo_url}
                alt="Club Profile"
                className="profile-img"
              />
            ) : (
              <div className="avatar-placeholder">{getClubInitials()}</div>
            )}
            <div className="online-indicator"></div>
          </div>

          <div className="profile-info">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editData.club_name}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      club_name: e.target.value,
                    }))
                  }
                  className="edit-input"
                  placeholder="Club Name"
                />
                <input
                  type="email"
                  value={editData.club_email}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      club_email: e.target.value,
                    }))
                  }
                  className="edit-input"
                  placeholder="Club Email"
                />
                <input
                  type="text"
                  value={editData.contact_person}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      contact_person: e.target.value,
                    }))
                  }
                  className="edit-input"
                  placeholder="Contact Person"
                />
                <input
                  type="tel"
                  value={editData.contact_phone}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      contact_phone: e.target.value,
                    }))
                  }
                  className="edit-input"
                  placeholder="Contact Phone"
                />
                <input
                  type="url"
                  value={editData.website}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  className="edit-input"
                  placeholder="Website URL"
                />
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="edit-input"
                  placeholder="Club Description"
                  rows="3"
                />
                <div className="button-group">
                  <button
                    className="edit-btn"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{clubData.club_name || "Club Name"}</h2>
                <p>{clubData.club_email || "No email provided"}</p>
                <div className="status-badge">
                  <span className="status-dot"></span>
                  Active Club
                  {clubData.email_verified && (
                    <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                      ✓ Email Verified
                    </span>
                  )}
                </div>
                <div className="button-group">
                  {/* <button className="edit-btn" onClick={handleEdit}>
                    Edit
                  </button> */}
                  <button
                    className="signout-btn"
                    onClick={handleSignOut}
                    disabled={loading}
                  >
                    {loading ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              </>
            )}
          </div>

          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ margin: "10px 0" }}>
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "10px",
                padding: "2px 6px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="quick-stats">
          <div className="club-stat-item">
            <div className="club-stat-icon">🎉</div>
            <div className="club-stat-content">
              <span className="club-stat-number">
                {" "}
                {eventsCount !== null ? eventsCount : "-"}
              </span>
              <span className="club-stat-label">Events Hosted</span>
            </div>
          </div>
          <div className="club-stat-item">
            <div className="club-stat-icon">👥</div>
            <div className="club-stat-content">
              <span className="club-stat-number">-</span>
              <span className="club-stat-label">Active Members</span>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <div className="detail-box">
              <div className="detail-icon">🎓</div>
              <div className="detail-content">
                <span className="detail-label">Category</span>
                <span className="detail-value">
                  {clubData.club_category || "Not specified"}
                </span>
              </div>
            </div>
            <div className="detail-box">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <span className="detail-label">Established</span>
                <span className="detail-value">
                  {clubData.established_year || "Not specified"}
                </span>
              </div>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-box">
              <div className="detail-icon">👤</div>
              <div className="detail-content">
                <span className="detail-label">Contact Person</span>
                <span className="detail-value">
                  {clubData.contact_person || "Not specified"}
                </span>
              </div>
            </div>
            <div className="detail-box">
              <div className="detail-icon">📱</div>
              <div className="detail-content">
                <span className="detail-label">Contact Phone</span>
                <span className="detail-value">
                  {clubData.contact_phone || "Not provided"}
                  {clubData.phone_verified && (
                    <span style={{ marginLeft: "4px", color: "green" }}>✓</span>
                  )}
                </span>
              </div>
            </div>
          </div>
          {clubData.website && (
            <div className="detail-row">
              <div className="detail-box">
                <div className="detail-icon">🌐</div>
                <div className="detail-content">
                  <span className="detail-label">Website</span>
                  <span className="detail-value">
                    <a
                      href={clubData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      Visit Website
                    </a>
                  </span>
                </div>
              </div>
              <div className="detail-box">
                <div className="detail-icon">📍</div>
                <div className="detail-content">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">{formatMemberSince()}</span>
                </div>
              </div>
            </div>
          )}
          {clubData.description && (
            <div className="detail-row">
              <div className="detail-box full-width">
                <div className="detail-icon">📝</div>
                <div className="detail-content">
                  <span className="detail-label">Description</span>
                  <span className="detail-value">{clubData.description}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubProfileCard;
