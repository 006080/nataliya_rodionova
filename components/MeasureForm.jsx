// import { useState, createContext, useContext } from "react";
// import styles from "./MeasureForm.module.css";

// // Create a context for measurements
// export const MeasurementsContext = createContext(null);

// // Custom hook to use the measurements context
// export const useMeasurements = () => {
//   const context = useContext(MeasurementsContext);
//   if (!context) {
//     throw new Error('useMeasurements must be used within a MeasurementsProvider');
//   }
//   return context;
// };

// // Provider component
// export const MeasurementsProvider = ({ children }) => {
//   const [measurements, setMeasurements] = useState({
//     height: "",
//     chest: "",
//     waist: "",
//     hips: ""
//   });
  
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const updateMeasurements = (newMeasurements) => {
//     setMeasurements(newMeasurements);
//   };

//   const setSubmitted = (value) => {
//     setIsSubmitted(value);
//   };

//   return (
//     <MeasurementsContext.Provider value={{ 
//       measurements, 
//       updateMeasurements, 
//       isSubmitted, 
//       setSubmitted 
//     }}>
//       {children}
//     </MeasurementsContext.Provider>
//   );
// };

// const MeasureForm = ({ onFormValid }) => {
//   const { measurements, updateMeasurements, isSubmitted, setSubmitted } = useMeasurements();

//   const handleChange = (e) => {
//     updateMeasurements({ ...measurements, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Check if all required fields are filled
//     if (measurements.height && measurements.chest && measurements.waist && measurements.hips) {
//       setSubmitted(true);
//       // If onFormValid prop exists, call it
//       if (onFormValid && typeof onFormValid === 'function') {
//         onFormValid(true);
//       }
//     } else {
//       alert("Your measurements have been successfully added.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className={styles.measureForm}>
//       <h3>Enter Your Measurements</h3>
//       <label>
//         Height (cm):
//         <input 
//           type="number" 
//           name="height" 
//           value={measurements.height} 
//           onChange={handleChange} 
//           required 
//         />
//       </label>
//       <label>
//         Chest (cm):
//         <input 
//           type="number" 
//           name="chest" 
//           value={measurements.chest} 
//           onChange={handleChange} 
//           required 
//         />
//       </label>
//       <label>
//         Waist (cm):
//         <input 
//           type="number" 
//           name="waist" 
//           value={measurements.waist} 
//           onChange={handleChange} 
//           required 
//         />
//       </label>
//       <label>
//         Hips (cm):
//         <input 
//           type="number" 
//           name="hips" 
//           value={measurements.hips} 
//           onChange={handleChange} 
//           required 
//         />
//       </label>
//       <button 
//         type="submit" 
//         className={styles.submitButton} 
//         disabled={isSubmitted}
//       >
//         {isSubmitted ? "Measurements Submitted" : "Submit Measurements"}
//       </button>
//     </form>
//   );
// };

// export default MeasureForm;



import { useState } from "react";
import styles from "./MeasureForm.module.css";

const MeasureForm = ({ onSubmit }) => {
  const [measurements, setMeasurements] = useState({
    height: "",
    chest: "",
    waist: "",
    hips: ""
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