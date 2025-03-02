import { useState } from "react";
import styles from "./MeasureForm.module.css";

const MeasureForm = ({ onFormValid }) => {
  const [measurements, setMeasurements] = useState({
    height: "",
    chest: "",
    waist: "",
    hips: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setMeasurements({ ...measurements, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if all required fields are filled
    if (measurements.height && measurements.chest && measurements.waist && measurements.hips) {
      setIsSubmitted(true);
      // If onFormValid prop exists, call it
      if (onFormValid && typeof onFormValid === 'function') {
        onFormValid(true);
      }
    } else {
      alert("Please fill out all fields before submitting.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.measureForm}>
      <h3>Enter Your Measurements</h3>
      <label>
        Height (cm):
        <input 
          type="number" 
          name="height" 
          value={measurements.height} 
          onChange={handleChange} 
          required 
        />
      </label>
      <label>
        Chest (cm):
        <input 
          type="number" 
          name="chest" 
          value={measurements.chest} 
          onChange={handleChange} 
          required 
        />
      </label>
      <label>
        Waist (cm):
        <input 
          type="number" 
          name="waist" 
          value={measurements.waist} 
          onChange={handleChange} 
          required 
        />
      </label>
      <label>
        Hips (cm):
        <input 
          type="number" 
          name="hips" 
          value={measurements.hips} 
          onChange={handleChange} 
          required 
        />
      </label>
      <button 
        type="submit" 
        className={styles.submitButton} 
        disabled={isSubmitted}
      >
        {isSubmitted ? "Measurements Submitted" : "Submit Measurements"}
      </button>
    </form>
  );
};

export default MeasureForm;