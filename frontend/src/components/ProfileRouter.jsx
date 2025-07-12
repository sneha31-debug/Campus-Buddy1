import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import ProfileCard from "./ProfileCard";
import ClubProfileCard from "./ClubProfileCard";

const ProfileRouter = () => {
  const { user, getUserRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated || !isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }
  }, [isAuthenticated, navigate]);

  // Don't render anything if not authenticated
  if (!isAuthenticated || !isAuthenticated()) {
    return null;
  }

  const userRole = getUserRole();

  // Render the appropriate profile component based on user role
  if (userRole === "club") {
    return <ClubProfileCard />;
  } else {
    return <ProfileCard />;
  }
};

export default ProfileRouter;
