import React, { useEffect, useState } from "react";
import "./HealthProviderDashboard.css";
import { toast } from 'sonner';
import API_BASE_URL from "../../config/api";

export default function HealthcareProviderDashboard() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(localStorage.getItem("showProfile") === "true");
  const [editMode, setEditMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [editedProfile, setEditedProfile] = useState({
    fullname: user?.fullname || "",
    location: user?.location || "",
  });

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/all-appointments`);
      const data = await res.json();
      setAppointments(data.appointments);
    } catch (error) {
      toast.error("Failed to fetch appointments.");
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchBloodRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blood-request/all`);
      const data = await res.json();
      setBloodRequests(data.requests);
      console.log("Fetched Blood Requests:", data.requests); 
    } catch (error) {
      console.error("Error fetching blood requests:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchAppointments();
      await fetchBloodRequests();
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      setShowProfile(localStorage.getItem("showProfile") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleAppointmentStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
     if (res.ok) {
      toast.success(data.message || "Appointment updated!");
      fetchAppointments(); 
    } else {
      toast.error(data.message || "Failed to update appointment.");
    }
    } catch (error) {
      toast.error("An error occurred while updating appointment.");
      console.error("Error updating appointment:", error);
    }
  };

  const handleProfileUpdate = () => {
    const updatedUser = {
      ...user,
      fullname: editedProfile.fullname,
      location: editedProfile.location,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setEditMode(false);
    toast.success("Profile updated!");
  };

  if (loading) return <p>Loading Dashboard...</p>;

  const upcomingAppointments = appointments.filter(a => a.status === "Scheduled");
  const completedAppointments = appointments.filter(a => a.status === "Completed");

  return (
    <div className="healthcare-dashboard">
      <h2>Healthcare Provider Dashboard</h2>
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
              <p><strong>Full Name:</strong> {user?.fullname}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Blood Type:</strong> {user?.bloodtype}</p>
              <p><strong>Location:</strong> {user?.location}</p>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </>
          )}
        </section>
      )}

      <div className="tab-buttons">
        <button className={activeTab === "appointments" ? "active" : ""} onClick={() => setActiveTab("appointments")}>Donor Appointments</button>
        <button className={activeTab === "bloodRequests" ? "active" : ""} onClick={() => setActiveTab("bloodRequests")}>Recipient Blood Requests</button>
      </div>

      {activeTab === "appointments" && (
        <>
          <h3>Upcoming Donor Appointments</h3>
          {upcomingAppointments.length === 0 ? <p>No scheduled appointments found.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor Name</th>
                  <th>Blood Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{new Date(appt.date).toLocaleString()}</td>
                    <td>{appt.donor_name}</td>
                    <td>{appt.bloodtype}</td>
                    <td>{appt.location}</td>
                    <td>{appt.status}</td>
                    <td>
                      <button onClick={() => handleAppointmentStatusChange(appt.id, "Completed")}>
                        Mark as Completed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3>Completed Donor Appointments</h3>
          {completedAppointments.length === 0 ? <p>No completed appointments found.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor Name</th>
                  <th>Blood Type</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{new Date(appt.date).toLocaleString()}</td>
                    <td>{appt.donor_name}</td>
                    <td>{appt.bloodtype}</td>
                    <td>{appt.location}</td>
                    <td>{appt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === "bloodRequests" && (
        <>
          <h3>Recipient Blood Requests</h3>
          {!Array.isArray(bloodRequests) || bloodRequests.length === 0 ? <p>No blood requests found.</p> : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Recipient Name</th>
                  <th>Blood Type</th>
                  <th>Urgency</th>
                  <th>Units</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Date Needed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bloodRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{req.recipient_name}</td> 
                    <td>{req.blood_type}</td>
                    <td>{req.urgency_level}</td>
                    <td>{req.units}</td>
                    <td>{req.location}</td>
                    <td>{req.contact_info}</td>
                    <td>{new Date(req.date_needed).toLocaleDateString()}</td>
                    <td>{req.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
