import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "./DonorDashboard.css";
import axios from "axios";
import API_BASE_URL from "../../config/api";

export default function DonorDashboard() {
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quiz");
  const [quizResult, setQuizResult] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showProfile, setShowProfile] = useState(localStorage.getItem("showProfile") === "true");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editedFullname, setEditedFullname] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [bloodRequests, setBloodRequests] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [story, setStory] = useState("");


  const [quiz, setQuiz] = useState({
    dob: "",
    weight: "",
    chronicIllness: "",
    recentDonation: ""
  });

  const [appointmentData, setAppointmentData] = useState({
    date: "",
    location: "",
    status: "Scheduled",
    units: ""
  });

  const userId = parseInt(localStorage.getItem("userId"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !token) {
      toast.error("No user logged in! Redirecting to login...");
      navigate("/login");
      return;
    }

    async function fetchData() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [userRes, appRes, notifRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/user/${userId}`, { headers }),
          fetch(`${API_BASE_URL}/api/appointments/${userId}`, { headers }),
          fetch(`${API_BASE_URL}/api/notifications/${userId}`, { headers })
        ]);

        const userJson = await userRes.json();
        setUserData(userJson.user);

        const appJson = await appRes.json();
        setAppointments(Array.isArray(appJson.appointments) ? appJson.appointments : []);

        const notifJson = await notifRes.json();
        const allNotifs = notifJson.notifications || [];
        setNotifications(allNotifs);

        fetchBloodRequests();
        fetchConstituencies();

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, token, navigate]);

  const fetchConstituencies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/constituencies`);
      setConstituencies(res.data);
    } catch (err) {
      console.error("Failed to fetch constituencies", err);
    }
  };

  const fetchHospitals = async (constituency) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/hospitals/${constituency}`);
      setHospitals(res.data);
    } catch (err) {
      console.error("Failed to fetch hospitals", err);
    }
  };

  useEffect(() => {
    if (selectedConstituency) {
      fetchHospitals(selectedConstituency);
    }
  }, [selectedConstituency]);

  useEffect(() => {
    const handleStorageChange = () => {
      const show = localStorage.getItem("showProfile") === "true";
      setShowProfile(show);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchBloodRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/blood-request/donor-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBloodRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch blood requests:", err);
    }
  };

  const handleQuizSubmit = async (e) => {
  e.preventDefault();
  const { dob, weight, chronicIllness, recentDonation } = quiz;

  // Calculate age from DOB
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const isEligible =
    age >= 18 &&
    parseInt(weight) >= 50 &&
    chronicIllness === "no" &&
    recentDonation === "no";

  const resultText = isEligible ? "Eligible" : "Not Eligible";
  setQuizResult(resultText);
  setQuizSubmitted(true);

  try {
    await fetch(`${API_BASE_URL}/api/quiz/quiz-results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: userId, dob, weight, chronicIllness, recentDonation, result: resultText }),
    });
    toast.success("Quiz result saved.");
    if (isEligible) {
      toast.success("You are eligible to donate blood!");
      setTimeout(() => {
  setActiveTab("notifications"); // Redirect to notifications tab
      }, 3000);
  } else {
    toast.error(<span>You must be 18+, 50kg+, no chronic illness or recent donation.</span>);
  }
  } catch (err) {
    console.error("Quiz save error:", err);
    toast.error("Error saving quiz result.");
  }
};


  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (quizResult !== "Eligible") {
      toast.error("You must pass the eligibility quiz to book an appointment.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId, ...appointmentData }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Appointment booked!");
        setAppointments(prev => [...prev, data.appointment]);
        setAppointmentData({ date: "", location: "", status: "Scheduled" });
      } else {
        toast.error(data.error || "Booking failed.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Server error.");
    }
  };

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

  const respondToRequest = async (requestId, response) => {
  try {
    await axios.post(
      `${API_BASE_URL}/api/blood-request/donor-requests/respond`,
      { request_id: requestId, response },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success(
      `You have ${response === "accepted" ? "accepted" : "rejected"} the request.`
    );
    setNotifications((prev) =>
      prev.map((n) =>
        n.request_id === requestId ? { ...n, response } : n
      )
    );
    setBloodRequests((prev) =>
      prev.map((r) =>
        r.request_id === requestId ? { ...r, response } : r
      )
    );
  } catch (err) {
    console.error("❌ Response failed:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Failed to respond to request.");
  }
};


  const handleProfileSave = async () => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/user/${userId}`,
        { fullname: editedFullname, email: editedEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated!");
      setUserData(res.data.updatedUser);
      setEditingProfile(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="donor-dashboard">
      <h3>Welcome Donor, {userData?.fullname}</h3>

      {showProfile && (
        <div className="profile-dropdown">
          {editingProfile ? (
            <>
              <input
                type="text"
                value={editedFullname}
                onChange={(e) => setEditedFullname(e.target.value)}
                placeholder="Full Name"
              />
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                placeholder="Email"
              />
              <button onClick={handleProfileSave}>Save</button>
              <button onClick={() => setEditingProfile(false)}>Cancel</button>
            </>
          ) : (
            <>
              <p><strong>Full Name:</strong> {userData?.fullname}</p>
              <p><strong>Email:</strong> {userData?.email}</p>
              <button onClick={() => {
                setEditedFullname(userData.fullname);
                setEditedEmail(userData.email);
                setEditingProfile(true);
              }}>
                Edit Profile
              </button>
            </>
          )}
        </div>
      )}

      <div className="dashboard-tabs">
        <button onClick={() => setActiveTab("quiz")} className={activeTab === "quiz" ? "active" : ""}>Eligibility Quiz</button>
        <button onClick={() => setActiveTab("appointments")} className={activeTab === "appointments" ? "active" : ""}>Appointments</button>
        <button
          onClick={() => {
            if (quizResult === "Eligible") {
              setActiveTab("notifications");
            } else {
              toast.error("Complete the eligibility quiz and be marked as eligible to access notifications.");
            }
          }}
            className={activeTab === "notifications" ? "active" : ""}
          >
            Notifications
          </button>

        <button
  onClick={() => setActiveTab("story")}
  className={activeTab === "story" ? "active" : ""}
>
  Share Story
</button>

      </div>

      {activeTab === "quiz" && (
        <section>
          <h3>Eligibility Quiz</h3>
          <form onSubmit={handleQuizSubmit} className="eligibility-quiz-form">
            <label>Date of Birth:</label>
            <input
              type="date"
              value={quiz.dob}
              onChange={(e) => setQuiz({ ...quiz, dob: e.target.value })}
              required
            />
            <label>Weight (kg):</label>
            <input type="number" min = "1" step="1" value={quiz.weight} onChange={(e) => setQuiz({ ...quiz, weight: e.target.value })} required />
            <label>Do you have any chronic illness?</label>
            <select value={quiz.chronicIllness} onChange={(e) => setQuiz({ ...quiz, chronicIllness: e.target.value })} required>
              <option value="">-- Select --</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            <label>Have you donated blood in the last 3 months?</label>
            <select value={quiz.recentDonation} onChange={(e) => setQuiz({ ...quiz, recentDonation: e.target.value })} required>
              <option value="">-- Select --</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            <button type="submit">Submit Quiz</button>
          </form>
          {quizSubmitted && (
            <p className={`quiz-result ${quizResult === "Eligible" ? "eligible" : "not-eligible"}`}>
              You are {quizResult} to donate blood.
            </p>
          )}
        </section>
      )}

      {activeTab === "appointments" && (
        <section className="appointments-section">
          <h3>Your Appointments</h3>
          {appointments.length === 0 ? (
            <p>No appointments booked.</p>
          ) : (
            <table className="appointment-table">
              <thead>
                <tr><th>Date</th><th>Location</th><th>Status</th><th>Units</th></tr>
              </thead>
              <tbody>
                {appointments.filter(Boolean).map((a, index) => (
                  <tr key={a?.id || index}>
                    <td>{a?.date ? new Date(a.date).toLocaleString() : "N/A"}</td>
                    <td>{a?.location || "N/A"}</td>
                    <td>{a?.status || "N/A"}</td>
                    <td>{a?.units || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h4>Book New Appointment</h4>
          <form onSubmit={handleAppointmentSubmit} className="book-appointment">
            <label>Date & Time:</label>
            <input
              type="datetime-local"
              value={appointmentData.date}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
              required
            />
            <label>Units to Donate:</label>
            <input
              type="number"
              value={appointmentData.units}
              min="1"
              onChange={(e) => setAppointmentData({ ...appointmentData, units: e.target.value })}
              required
            />
            <label>Select Constituency:</label>
            <select
              value={selectedConstituency}
              onChange={(e) => setSelectedConstituency(e.target.value)}
              required
            >
              <option value="">-- Select Constituency --</option>
              {constituencies.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <label>Select Hospital:</label>
            <select
              value={appointmentData.location}
              onChange={(e) => setAppointmentData({ ...appointmentData, location: e.target.value })}
              required
            >
              <option value="">-- Select Hospital --</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.name}>{h.name}</option>
              ))}
            </select>
            <button type="submit">Book Appointment</button>
          </form>
        </section>
      )}

      {activeTab === "notifications" && (
  <section className="notification-center">
    <h3>Notifications</h3>
    {notifications.length === 0 ? (
      <p>No notifications yet.</p>
    ) : (
      <ul className="notifications-list">
  {notifications.map((n) => {
    const matchingRequest = bloodRequests.find(
      (r) => Number(r.request_id || r.id) === Number(n.request_id)
    );

    return (
      <li key={n.id} className="notification-item">
        <div className="notification-text">
          <strong>{n.type}:</strong> {n.message}
        </div>

        <div className="notification-meta">
          <small className="notif-date">
            <strong>Received:</strong>{" "}
            {new Date(n.created_at).toLocaleString()}
          </small>

          {matchingRequest?.date_needed && (
            <div className="date-needed">
              <strong>Date Needed:</strong>{" "}
              {new Date(matchingRequest.date_needed).toLocaleDateString()}
            </div>
          )}
        </div>

        {n.type === "Blood Request" && n.request_id && (
          <>
            {n.response === "accepted" && (
              <p className="status-label accepted">Accepted</p>
            )}
            {n.response === "rejected" && (
              <p className="status-label rejected">Rejected</p>
            )}
            {!n.response || n.response === "pending" ? (
              <div className="notif-actions">
                <button
                  onClick={() => respondToRequest(n.request_id, "accepted")}
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToRequest(n.request_id, "rejected")}
                >
                  Reject
                </button>
              </div>
            ) : null}
          </>
        )}
      </li>
    );
  })}
</ul>

    )}
  </section>
)}

      {activeTab === "story" && (
  <section className="share-story-section">
    <h3>Share Your Recovery Story</h3>
    <textarea
      value={story}
      onChange={(e) => setStory(e.target.value)}
      placeholder="Write your blood donation or recovery story..."
      className="story-textarea"
    />
    <div className="story-actions">
      <button onClick={shareStory} className="send-btn">
        Share Story
      </button>
      <button
        onClick={() => navigate("/community")}
        className="send-btn"
      >
        View Shared Stories
      </button>
    </div>
  </section>
)}

    </div>
  );
}
