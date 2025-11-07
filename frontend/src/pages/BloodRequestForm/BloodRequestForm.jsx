import React, { useState } from "react";
import "./BloodRequestForm.css";
import axios from "axios";
import { toast} from 'sonner';
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";

function BloodRequestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    blood_type: "",
    urgency_level: "",
    units: "",
    location: "",
    contact_info: "",
    date_needed: ""
  });
 
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not logged in.");
      return;
    }

    const res = await axios.post(
      `${API_BASE_URL}/api/blood-request`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      }
    );

    if (res.status === 201 || res.status === 200) {
      toast.success("Request submitted successfully!");
         setTimeout(() => {
          navigate("/recipient");
        }, 2000);

      setFormData({
        blood_type: "",
        urgency_level: "",
        units: "",
        location: "",
        contact_info: "",
        date_needed: ""
      });
      

    } else {
      toast.error("Something went wrong.");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    toast.error("Error submitting request. Please try again.");
  }
};



  return (
    <form className="blood-request-form" onSubmit={handleSubmit}>
      <h2>Request Blood</h2>

      <select name="blood_type" value={formData.blood_type} onChange={handleChange} required>
        <option disabled value="">Select Blood Type</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
      </select>

      <select name="urgency_level" value={formData.urgency_level} onChange={handleChange} required>
        <option disabled value="">Select Urgency</option>
        <option value="Low">Low</option>
        <option value="Moderate">Moderate</option>
        <option value="High">High</option>
        <option value="Emergency">Emergency</option>
      </select>

      <input type="number" name="units" placeholder="Enter Number of Units" value={formData.units} onChange={handleChange} required min="1" />

      <select name="location" value={formData.location} onChange={handleChange} required>
        <option disabled value="">Select Nairobi Constituency</option>
        <option value="Westlands">Westlands</option>
        <option value="Dagoretti North">Dagoretti North</option>
        <option value="Dagoretti South">Dagoretti South</option>
        <option value="Lang'ata">Lang'ata</option>
        <option value="Kibra">Kibra</option>
        <option value="Roysambu">Roysambu</option>
        <option value="Kasarani">Kasarani</option>
        <option value="Ruaraka">Ruaraka</option>
        <option value="Embakasi North">Embakasi North</option>
        <option value="Embakasi Central">Embakasi Central</option>
        <option value="Embakasi East">Embakasi East</option>
        <option value="Embakasi West">Embakasi West</option>
        <option value="Embakasi South">Embakasi South</option>
        <option value="Makadara">Makadara</option>
        <option value="Kamukunji">Kamukunji</option>
        <option value="Starehe">Starehe</option>
        <option value="Mathare">Mathare</option>
      </select>

      <input type="text" name="contact_info" placeholder="Enter Contact Information" value={formData.contact_info} onChange={handleChange} required />
      <input type="date" name="date_needed" value={formData.date_needed} onChange={handleChange} min={today}required />

      <button type="submit">Submit Request</button>
    </form>
  );
}

export default BloodRequestForm;
