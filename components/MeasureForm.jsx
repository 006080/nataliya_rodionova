import { useState } from "react";
import styles from "./MeasureForm.module.css";

const MeasureForm = ({ setIsMeasureFormValid }) => {
  const [measurements, setMeasurements] = useState({
    height: "",
    weight: "",
    chest: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setMeasurements({ ...measurements, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (measurements.height && measurements.weight && measurements.chest) {
      setIsSubmitted(true);
      setIsMeasureFormValid(true); // Enable PayPal button
    } else {
      alert("Please fill out all fields before submitting.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.measureForm}>
      <h3>Enter Your Measurements</h3>
      <label>
        Height (cm):
        <input type="number" name="height" value={measurements.height} onChange={handleChange} required />
      </label>
      <label>
        Chest (kg):
        <input type="number" name="chest" value={measurements.chest} onChange={handleChange} required />
      </label>
      <label>
        Waist (cm):
        <input type="number" name="waist " value={measurements.waist} onChange={handleChange} required />
      </label>
      <label>
        Hips (cm):
        <input type="number" name="hips" value={measurements.hips} onChange={handleChange} required />
      </label>
      <button type="submit" className={styles.submitButton} disabled={isSubmitted}>
        {isSubmitted ? "Measurements Submitted" : "Submit Measurements"}
      </button>
    </form>
  );
};

export default MeasureForm;
