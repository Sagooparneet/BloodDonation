import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import "./RecipientDashboard.css";
import "../Donor Dashboard/DonorDashboard.css";
import API_BASE_URL from "../../config/api";

export default function RecipientDashboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeRequestCount, setActiveRequestCount] = useState(0);
  const [story, setStory] = useState("");
  const [requestStatus, setRequestStatus] = useState("Pending"); 
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    fullname: user?.fullname || "",
    location: user?.location || ""
  });
  const [showProfile, setShowProfile] = useState(localStorage.getItem("showProfile") === "true");

  useEffect(() => {
    const handleStorageChange = () => {
      setShowProfile(localStorage.getItem("showProfile") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Fetch active request count
  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE_URL}/api/blood-request/active`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setActiveRequestCount(res.data.count))
    .catch(err => console.error("Failed to fetch active count", err));
  }, [token]);

  // Fetch latest request status
 useEffect(() => {
  if (!token) return;
  axios.get(`${API_BASE_URL}/api/blood-request/latest-status`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    if (res.data.status) {
      setRequestStatus(res.data.status); 
    }
  })
  .catch(err => {
    console.error("Failed to fetch status", err);
  });
}, [token]);


  // Share story
  const shareStory = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/community/stories`, {
        story,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Story shared successfully!");
      setStory("");
    } catch (err) {
      console.error("Failed to share story", err);
      toast.error("Failed to share story.");
    }
  };

  // Mark as completed
  const markAsComplete = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/blood-request/mark-complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(" Request marked as completed!");
      window.location.reload(); 
    } catch (err) {
      console.error("Error marking complete", err);
      toast.error("Failed to complete request.");
    }
  };

  // Update Profile
  const handleProfileUpdate = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/user/${user.id}`, editedProfile, {
        headers: { "Content-Type": "application/json" }
      });

      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        const updatedUser = { ...user, ...editedProfile };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditMode(false);
        window.location.reload();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      console.error("Update error", err);
      toast.error("Could not update profile");
    }
  };

  return (
    <div className="dashboard-container">
      <h3 className="dashboard-title">Welcome Recipient, {user?.fullname}</h3>
      <p className="dashboard-subtitle">Manage your blood requests and donations</p>

      {showProfile && (
        <section className="profile-section">
          <h3>Your Profile</h3>
          {editMode ? (
            <>
              <label>Full Name:</label>
              <input
                type="text"
                value={editedProfile.fullname}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    fullname: e.target.value,
                  })
                }
              />
              <label>Location:</label>
              <input
                type="text"
                value={editedProfile.location}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    location: e.target.value,
                  })
                }
              />
              <button onClick={handleProfileUpdate}>Save</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <>
              <p>
                <strong>Full Name:</strong> {user?.fullname}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Blood Type:</strong> {user?.bloodtype}
              </p>
              <p>
                <strong>Location:</strong> {user?.location}
              </p>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </>
          )}
        </section>
      )}

      <div className="overview-box">
        <strong>Active Requests:</strong> {activeRequestCount}
      </div>

      <button className="create-btn" onClick={() => navigate("/blood-request")}>
        + Create Blood Request
      </button>

      <h3 className="section-title">Track Requests</h3>
      <p>Your request is being processed. You can match a donor:</p>
      <span
        className="donor-matching-link"
        onClick={() => navigate("/donors?fromRequest=true")}
      >
        Click to Match Donor
      </span>
    <h3 className="status-title">Donation Status</h3>
<div className={`status-badge ${requestStatus.toLowerCase()}`}>
  {requestStatus}
  {requestStatus.toLowerCase() === "rejected" && (
    <span
      className="retry-link"
      onClick={() => navigate("/donors?fromRequest=true")}
    >
      Rematch Donor
    </span>
  )}
</div>

<h3 className="section-title">Community Hub</h3>
      <textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder="Share your recovery story"
      />
      <div className="story-actions">
        <button onClick={shareStory} className="send-btn">
          Share Recovery Story
        </button>
        <button
          onClick={() => navigate("/community")}
          className="send-btn"
        >
          View Shared Stories
        </button>
      </div>
    </div>
  );
}
