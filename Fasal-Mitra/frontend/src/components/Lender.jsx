import React, { useState } from 'react';
import axios from "axios";
import "../styles/Lender.css";

export default function Lender() {
  const [machine, setMachine] = useState({
    name: "",
    description: "",
    rentalRate: "",
    category: "",
    availability: "",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => setMachine({ ...machine, [e.target.name]: e.target.value });
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMachine({ ...machine, image: e.target.files[0] });
    }
  };

  const removeImage = () => {
    setMachine({ ...machine, image: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const formData = new FormData();
      for (const key in machine) formData.append(key, machine[key]);

      const response = await axios.post("/api/machines", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Machine submitted successfully:", response.data);
      setSubmitMessage("Machine listed successfully!");
      setMachine({ name: "", description: "", rentalRate: "", category: "", availability: "", image: null });
    } catch (error) {
      console.error("Error submitting machine:", error);
      setSubmitMessage("Error listing machine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="lender-page">
    <div className="lender-container">
      <h2 className="form-title">List Your Farming Machine</h2>
      <form onSubmit={handleSubmit} className="lender-form">
        <input
          type="text"
          name="name"
          value={machine.name}
          onChange={handleChange}
          placeholder="Machine Name"
          required
          className="form-input"
        />
        <textarea
          name="description"
          value={machine.description}
          onChange={handleChange}
          placeholder="Machine Description"
          required
          className="form-textarea"
        />
        <input
          type="number"
          name="rentalRate"
          value={machine.rentalRate}
          onChange={handleChange}
          placeholder="Rental Rate ($/day)"
          required
          className="form-input"
        />
        <select
          name="category"
          value={machine.category}
          onChange={handleChange}
          required
          className="form-select"
        >
          <option value="">Select a category</option>
          <option value="tractor">Tractor</option>
          <option value="harvester">Harvester</option>
          <option value="planter">Planter</option>
          <option value="irrigationSystem">Irrigation System</option>
        </select>
        <input
          type="text"
          name="availability"
          value={machine.availability}
          onChange={handleChange}
          placeholder="Availability (e.g., 'Weekdays', 'All week')"
          required
          className="form-input"
        />
        
        <div className="image-upload-section">
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="form-file-input"
          />
          {machine.image && (
            <div className="uploaded-image-preview">
              <p>{machine.image.name}</p>
              <button type="button" onClick={removeImage} className="remove-image-button">
                Remove Image
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`form-button ${isSubmitting ? "button-loading" : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "List Machine"}
        </button>
      </form>
      {submitMessage && (
        <p className={`submit-message ${submitMessage.includes("Error") ? "error" : "success"}`}>
          {submitMessage}
        </p>
      )}
    </div>
    </div>
  );
}
