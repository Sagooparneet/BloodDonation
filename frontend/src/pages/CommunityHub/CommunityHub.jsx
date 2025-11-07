import { useEffect, useState } from "react";
import axios from "axios";
import "./CommunityHub.css";
import { toast } from 'sonner';
import API_BASE_URL from "../../config/api";
export default function CommunityHub() {
  const [stories, setStories] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [story, setStory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false); 
  const token = localStorage.getItem("token");
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

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/community/stories`);
      setStories(res.data);
    } catch (err) {
      console.error("Error fetching stories", err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handlePost = async () => {
    if (!story.trim()) return;

    try {
      await axios.post(
        `${API_BASE_URL}/api/community/stories`,
        { story },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setStory("");
      setShowForm(false);
      fetchStories();
    } catch (err) {
      console.error("Error posting story", err);
    }
  };

  return (
    <div className="community-hub">
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
      <h2>Community Stories</h2>

      <button className="post-toggle" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Post a Story"}
      </button>

      {showForm && (
        <div className="story-form">
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Share your experience..."
          />
          <button onClick={handlePost}>Submit</button>
        </div>
      )}

      <div className="stories-grid">
        {stories.map((item, idx) => (
          <div key={idx} className="story-box">
            <div className="story-header">
              <span className="initials">
                {item.fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <strong>{item.fullname}</strong>
              <span className="date">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="story-content">{item.story}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
