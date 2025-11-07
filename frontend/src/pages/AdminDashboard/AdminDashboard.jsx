import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import StatCard from "../../components/StatCard";
import "../../pages/AdminDashboard/AdminDashboard.css";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import API_BASE_URL from "../../config/api";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editedFullname, setEditedFullname] = useState("");

  const [showProfile, setShowProfile] = useState(
  localStorage.getItem("showProfile") === "true"
);

useEffect(() => {
  const handleStorageChange = () => {
    const show = localStorage.getItem("showProfile") === "true";
    setShowProfile(show);
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch error", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const updateUserStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/users/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map((user) => (user.id === id ? { ...user, status } : user)));
      toast.success("User status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const saveFullname = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/users/${id}`,
        { fullname: editedFullname },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, fullname: editedFullname } : user
        )
      );
      setEditingUser(null);
      setEditedFullname("");
      toast.success("Full Name updated!");
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  if (!stats) return <div className="loading">Loading...</div>;

  const donationChartData = {
    labels: stats.chartData.map((row) => row.week),
    datasets: [
      {
        label: "Weekly Donations",
        data: stats.chartData.map((row) => row.totalDonations),
        borderColor: "#c62828",
        backgroundColor: "#f28b82",
        tension: 0.4,
        pointBackgroundColor: "#c62828",
        pointRadius: 4,
      },
    ],
  };

  const requestChartData = {
    labels: stats.chartData.map((row) => row.week),
    datasets: [
      {
        label: "Weekly Requests",
        data: stats.chartData.map((row) => row.totalRequests),
        borderColor: "#37474f",
        backgroundColor: "#cfd8dc",
        tension: 0.4,
        pointBackgroundColor: "#37474f",
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="admin-dashboard">
  {showProfile && (
    <div className="profile-panel">
      <h3>Admin Profile</h3>
      <p><strong>Name:</strong> {admin?.fullname}</p>
      <p><strong>Email:</strong> {admin?.email}</p>
      <p><strong>User Type:</strong> {admin?.usertype}</p>
    </div>
  )}

      <h2>Admin Dashboard</h2>
      <div className="tab-bar">
        <button onClick={() => setActiveTab("overview")}>Overview</button>
        <button onClick={() => setActiveTab("users")}>Users</button>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="stats-grid">
            <StatCard title="Donors" value={stats.donors} color="red" />
            <StatCard title="Recipients" value={stats.recipients} color="black" />
            <StatCard title="Providers" value={stats.providers} color="red" />
            <StatCard title="Donations" value={stats.donations} color="black" />
            <StatCard title="Requests" value={stats.requests} color="red" />
            <StatCard title="Constituencies" value={stats.constituencies} color="black" />
            <StatCard title="Hospitals" value={stats.hospitals} color="red" />
          </div>

          <div className="chart-pair">
            <div className="chart-box">
              <h3>Donation Trend (Weekly)</h3>
              <Line data={donationChartData} />
            </div>
            <div className="chart-box">
              <h3>Request Trend (Weekly)</h3>
              <Line data={requestChartData} />
            </div>
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="users-section">
          <h3>All Users</h3>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>User Type</th>
                <th>Blood Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        value={editedFullname}
                        onChange={(e) => setEditedFullname(e.target.value)}
                      />
                    ) : (
                      user.fullname
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.usertype}</td>
                  <td>{user.bloodtype}</td>
                  <td>{user.location}</td>
                  <td>
                    <select
                      value={user.status || "active"}
                      onChange={(e) => updateUserStatus(user.id, e.target.value)}
                      className={`status-select ${user.status === "inactive" ? "inactive" : "active"}`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <div className="button-group">
                        <button className="btn-save" onClick={() => saveFullname(user.id)}>Save</button>
                        <button className="btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingUser(user.id);
                          setEditedFullname(user.fullname);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
