import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function DashboardHeader() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const initials = user?.fullname
    ? user.fullname
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    : "NA";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleProfileClick = () => {
    const current = localStorage.getItem("showProfile");
    localStorage.setItem("showProfile", current === "true" ? "false" : "true");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <header className="header">
      <div className="logo">
        <span style={{ fontSize: "1.2rem" }}>🩸</span>{" "}
        <strong>Blood Donation Platform</strong>
      </div>

      <nav style={{ display: "flex", alignItems: "center" }}>
        <button className="initials-btn" onClick={handleProfileClick}>
          {initials}
        </button>
       <button className="btn-red logout-btn" onClick={handleLogout}>
          <strong>Log Out</strong>
       </button>

      </nav>
    </header>
  );
}
