import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import "./DonorMatching.css";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API_BASE_URL from "../../config/api";

mapboxgl.accessToken = "pk.eyJ1IjoiY2hlbHVsZWkzNSIsImEiOiJjbWM3bmxoZ3IwdnFiMnpwOXQ4bnIyaXd5In0.B0V9cs0IqngUlGrXmPivDQ";

export default function DonorMatching() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [bloodType, setBloodType] = useState("");
  const [constituencies, setConstituencies] = useState([]);
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");

  const markersRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [36.8219, -1.2921],
      zoom: 10,
    });
    mapRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    const fetchConstituencies = async () => {
      const res = await axios.get(`${API_BASE_URL}/api/constituencies`);
      setConstituencies(res.data);
    };
    fetchConstituencies();
  }, []);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  const handleFilter = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/blood-request/match-from-request`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { center, donors } = res.data;
      setBloodType(donors[0]?.bloodtype || "");

      const calculated = donors.map((donor) => {
        const distance = haversineDistance(
          parseFloat(center.latitude),
          parseFloat(center.longitude),
          parseFloat(donor.latitude),
          parseFloat(donor.longitude)
        );
        return {
          ...donor,
          distanceFromRecipient: distance.toFixed(2),
          distanceFromHospital: null,
        };
      });

      setDonors(calculated);
      clearMarkers();

      const map = mapRef.current;
      map.flyTo({ center: [center.longitude, center.latitude], zoom: 12 });

      map.once("moveend", () => {
        const recipientMarker = new mapboxgl.Marker({ color: "blue" })
          .setLngLat([center.longitude, center.latitude])
          .setPopup(new mapboxgl.Popup().setText(`Request Location: ${center.location}`))
          .addTo(map);
        markersRef.current.push(recipientMarker);

        calculated.forEach((donor) => {
          const donorMarker = new mapboxgl.Marker({ color: "red" })
            .setLngLat([parseFloat(donor.longitude), parseFloat(donor.latitude)])
            .setPopup(
              new mapboxgl.Popup().setText(
                `${donor.fullname} (${donor.bloodtype}) - ${donor.distanceFromRecipient} km from Recipient`
              )
            )
            .addTo(map);
          markersRef.current.push(donorMarker);
        });
      });

      const hospitalsRes = await axios.get(
        `${API_BASE_URL}/api/hospitals/${center.location}`
      );
      setHospitals(hospitalsRes.data);
      setSelectedHospital("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load donors or map data.");
    }
  };

  const handleHospitalChange = async (e) => {
    const selected = e.target.value;
    setSelectedHospital(selected);

    if (!selected) return;

    const constituency = selectedConstituency || donors[0]?.location;
    if (!constituency) return;

    const res = await axios.get(`${API_BASE_URL}/api/hospitals/${constituency}`);
    const hospital = res.data.find((h) => h.name === selected);
    if (!hospital) return;

    const { latitude: hospLat, longitude: hospLng } = hospital;

    const updatedDonors = donors.map((donor) => {
      const distance = haversineDistance(
        hospLat,
        hospLng,
        parseFloat(donor.latitude),
        parseFloat(donor.longitude)
      );
      return {
        ...donor,
        distanceFromHospital: distance.toFixed(2),
      };
    });

    setDonors(updatedDonors);

    const map = mapRef.current;
    map.flyTo({ center: [hospLng, hospLat], zoom: 13 });
    clearMarkers();

    const hospitalMarker = new mapboxgl.Marker({ color: "green" })
      .setLngLat([hospLng, hospLat])
      .setPopup(new mapboxgl.Popup().setText(hospital.name))
      .addTo(map);
    markersRef.current.push(hospitalMarker);

    updatedDonors.forEach((donor) => {
      const popupText = `${donor.fullname} (${donor.bloodtype}) - ${donor.distanceFromRecipient} km from Recipient | ${donor.distanceFromHospital} km from Hospital`;

      const donorMarker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([parseFloat(donor.longitude), parseFloat(donor.latitude)])
        .setPopup(new mapboxgl.Popup().setText(popupText))
        .addTo(map);
      markersRef.current.push(donorMarker);
    });
  };

  const handleRequestBlood = async (donor) => {
    const token = localStorage.getItem("token");
    if (!selectedHospital) return toast.error("Please select a hospital.");

    try {
      const urgencyLevel = "High";
      const units = 1;
      const contact_info = "N/A";
      const dateNeeded = new Date().toISOString().slice(0, 10);

      const bloodReqRes = await axios.post(
        `${API_BASE_URL}/api/blood-request`,
        {
          blood_type: bloodType,
          urgency_level: urgencyLevel,
          units,
          location: donor.location,
          contact_info,
          date_needed: dateNeeded,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const requestId = bloodReqRes.data.request_id;

      await axios.post(
        `${API_BASE_URL}/api/blood-request/send-donor-request`,
        {
          donor_id: donor.id,
          request_id: requestId,
          hospital_name: selectedHospital,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Request sent to ${donor.fullname}`);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.warning("Request already sent to this donor.");
      } else {
        console.error("Error sending request:", err);
        toast.error("Failed to send request.");
      }
    }
  };

  return (
    <div className="donor-page">
      <div className="filter-sidebar">
        <h3>Filter Donors</h3>
        <div className="filter-group">
          <label>Constituency</label>
          <select value={selectedConstituency} onChange={(e) => setSelectedConstituency(e.target.value)}>
            <option disabled value="">-- Select Constituency --</option>
            {constituencies.map((c, i) => (
              <option key={i} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Blood Type</label>
          <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
            <option disabled value="">-- Select Blood Type --</option>
            <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
            <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
          </select>
        </div>
        <button className="apply-btn" onClick={handleFilter}>Apply Filter</button>
        <div className="filter-group">
          <label>Nearby Hospitals</label>
          <select value={selectedHospital} onChange={handleHospitalChange}>
            <option disabled value="">-- Select Hospital --</option>
            {hospitals.map((h, i) => (
              <option key={i} value={h.name}>{h.name}</option>
            ))}
          </select>
        </div>
        <button className="back-btn" onClick={() => navigate("/recipient")}>← Back to Dashboard</button>
      </div>

      <div className="donor-table">
        <h2>Potential Donors</h2>
        <div ref={mapContainer} className="map-container" />
        <table>
          <thead>
            <tr>
              <th>Donor</th>
              <th>Blood Type</th>
              <th>Distance to Recipient</th>
              <th>Distance to Hospital</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {donors.length > 0 ? (
              donors.map((donor, index) => (
                <tr key={index}>
                  <td>{donor.fullname}</td>
                  <td>{donor.bloodtype}</td>
                  <td>{donor.distanceFromRecipient} km</td>
                  <td>{donor.distanceFromHospital ? `${donor.distanceFromHospital} km` : "-"}</td>
                  <td>{donor.availability ? <span className="available-status">Available</span> : <span className="unavailable-status">Unavailable</span>}</td>
                  <td><button className="request-btn" onClick={() => handleRequestBlood(donor)}>Request Blood</button></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6">No matching donors found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
