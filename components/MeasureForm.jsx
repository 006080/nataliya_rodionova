import { useState } from "react";
import styles from "./MeasureForm.module.css";

const MeasureForm = ({ onSubmit, initialData = null }) => {
  const [measurements, setMeasurements] = useState(() => {
    if (initialData) {
      return initialData;
    }
    
    try {
      const savedData = localStorage.getItem('measurements');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading measurements from localStorage:', error);
    }
    
    return {
      height: "",
      chest: "",
      waist: "",
      hips: ""
    };
  });
  
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if all required fields are filled
    if (measurements.height && measurements.chest && measurements.waist && measurements.hips) {
      setSubmitted(true);
      
      // Save to localStorage before submitting
      try {
        localStorage.setItem('measurements', JSON.stringify(measurements));
      } catch (error) {
        console.error('Error saving measurements to localStorage:', error);
      }
      
      // Call the onSubmit prop with the measurements data
      if (onSubmit && typeof onSubmit === 'function') {
        onSubmit(measurements);
      }
    } else {
      alert("Please fill in all measurement fields.");
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
          disabled={submitted}
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
          disabled={submitted}
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
          disabled={submitted} 
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
          disabled={submitted} 
          required 
        />
      </label>
      <button 
        type="submit" 
        className={styles.submitButton} 
        disabled={submitted}
      >
        {submitted ? "Measurements Submitted" : "Submit Measurements"}
      </button>
    </form>
  );
};

export default MeasureForm;