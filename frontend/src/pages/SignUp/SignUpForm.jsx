import { useState } from "react";
import "./SignupForm.css";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    bloodtype: "",
    location: "",
    usertype: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      fullname,
      username,
      email,
      phone,
      password,
      confirmPassword,
      bloodtype,
      location,
      usertype,
    } = formData;

    const isDonorOrRecipient = usertype === "Donor" || usertype === "Recipient";

    if (
      !fullname || !username || !email || !phone ||
      !password || !confirmPassword || !usertype ||
      (isDonorOrRecipient && (!bloodtype || !location || bloodtype === "N/A" || location === "N/A"))
    ) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    const formDataToSubmit = {
      fullname,
      username,
      email,
      phone,
      password,
      bloodtype: (isDonorOrRecipient ? bloodtype : "N/A"),
      location: (isDonorOrRecipient ? location : "N/A"),
      usertype,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataToSubmit),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);

        toast.success("Signup successful!");
        navigate("/login");
      } else {
        toast.warning(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred during signup. Please try again later.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Your Account</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          type="text"
          value={formData.fullname}
          onChange={e => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
        />

        <label>Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
        />

        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />

        <label>Phone</label>
        <input
          type="text"
          value={formData.phone}
          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />

        <label>Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
        />

        <label>Blood Type (required for Donors and Recipients)</label>
        <select
          value={formData.bloodtype}
          onChange={e => setFormData(prev => ({ ...prev, bloodtype: e.target.value }))}
        >
          <option disabled value="">Select</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="N/A">N/A</option>
        </select>

        <label>Location / Constituency (required for Donors and Recipients)</label>
        <select
          value={formData.location}
          onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
        >
          <option disabled value="">Select your constituency</option>
          <option value="Westlands">Westlands</option>
          <option value="Dagoretti North">Dagoretti North</option>
          <option value="Dagoretti South">Dagoretti South</option>
          <option value="Lang'ata">Lang'ata</option>
          <option value="Kibra">Kibra</option>
          <option value="Roysambu">Roysambu</option>
          <option value="Kasarani">Kasarani</option>
          <option value="Ruaraka">Ruaraka</option>
          <option value="Embakasi South">Embakasi South</option>
          <option value="Embakasi North">Embakasi North</option>
          <option value="Embakasi Central">Embakasi Central</option>
          <option value="Embakasi East">Embakasi East</option>
          <option value="Embakasi West">Embakasi West</option>
          <option value="Makadara">Makadara</option>
          <option value="Kamukunji">Kamukunji</option>
          <option value="Starehe">Starehe</option>
          <option value="Mathare">Mathare</option>
          <option value="N/A">N/A</option>
        </select>

        <label>User Type</label>
        <div className="user-type">
          {["Donor", "Recipient", "Healthcare Provider"].map(type => (
            <button
              key={type}
              type="button"
              className={formData.usertype === type ? "selected" : ""}
              onClick={() => setFormData(prev => ({ ...prev, usertype: type }))}
            >
              {type}
            </button>
          ))}
        </div>

        <button className="submit-btn" type="submit">Sign Up</button>
      </form>
    </div>
  );
}
