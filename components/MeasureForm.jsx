// import { useState, useEffect } from "react";
// import { getStorageItem, setStorageItem } from '../src/utils/enhancedConsentUtils';
// import styles from "./MeasureForm.module.css";

// const MeasureForm = ({ onSubmit, initialData = null }) => {
//   const [measurements, setMeasurements] = useState(() => {
//     if (initialData) {
//       return initialData;
//     }
    
//     try {
//       // Use consent-aware storage getter
//       const savedData = getStorageItem('measurements', 'userPreferences');
//       if (savedData) {
//         return JSON.parse(savedData);
//       }
//     } catch (error) {
//       console.error('Error loading measurements from localStorage:', error);
//     }
    
//     return {
//       height: "",
//       chest: "",
//       waist: "",
//       hips: ""
//     };
//   });
  
//   const [submitted, setSubmitted] = useState(false);
//   const [storageNotice, setStorageNotice] = useState('');

//   // Listen for storage consent changes
//   useEffect(() => {
//     const handleStorageConsentChange = (event) => {
//       const { localStorage: storageSettings } = event.detail;
      
//       if (!storageSettings.granted || !storageSettings.categories.userPreferences) {
//         setStorageNotice('Your measurement preferences will not be saved due to your privacy settings.');
//       } else {
//         setStorageNotice('');
//       }
//     };

//     window.addEventListener('storageConsentChanged', handleStorageConsentChange);
    
//     // Check initial state
//     const savedData = getStorageItem('measurements', 'userPreferences');
//     if (!savedData && (measurements.height || measurements.chest || measurements.waist || measurements.hips)) {
//       // Only show notice if user has entered data but it can't be saved
//       if (getStorageItem === null) { // If the function returns null, storage is denied
//         setStorageNotice('Your measurement preferences will not be saved due to your privacy settings.');
//       }
//     }

//     return () => {
//       window.removeEventListener('storageConsentChanged', handleStorageConsentChange);
//     };
//   }, [measurements]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setMeasurements(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Check if all required fields are filled
//     if (measurements.height && measurements.chest && measurements.waist && measurements.hips) {
//       setSubmitted(true);
      
//       // Try to save to localStorage with consent check
//       const saveSuccess = setStorageItem('measurements', JSON.stringify(measurements), 'userPreferences');
      
//       if (!saveSuccess) {
//         setStorageNotice('Measurements submitted but not saved due to your privacy settings. You may need to re-enter them on your next visit.');
//       } else {
//         // Clear any previous notice if save was successful
//         setStorageNotice('');
//       }
      
//       // Call the onSubmit prop with the measurements data
//       if (onSubmit && typeof onSubmit === 'function') {
//         onSubmit(measurements);
//       }
//     } else {
//       alert("Please fill in all measurement fields.");
//     }
//   };

//   const openPrivacySettings = () => {
//     window.dispatchEvent(new CustomEvent('openConsentSettings'));
//   };

//   return (
//     <form onSubmit={handleSubmit} className={styles.measureForm}>
//       <h3>Enter Your Measurements</h3>
      
//       {storageNotice && (
//         <div className={styles.storageNotice}>
//           {storageNotice}
//           {storageNotice.includes('privacy settings') && (
//             <>
//               {' '}
//               <button 
//                 type="button"
//                 onClick={openPrivacySettings}
//                 className={styles.privacyLink}
//               >
//                 Update privacy settings
//               </button>{' '}
//               to save your preferences.
//             </>
//           )}
//         </div>
//       )}
      
//       <label>
//         Height (cm):
//         <input 
//           type="number" 
//           name="height" 
//           value={measurements.height} 
//           onChange={handleChange} 
//           disabled={submitted}
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
//           disabled={submitted}
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
//           disabled={submitted} 
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
//           disabled={submitted} 
//           required 
//         />
//       </label>
//       <button 
//         type="submit" 
//         className={styles.submitButton} 
//         disabled={submitted}
//       >
//         {submitted ? "Measurements Submitted" : "Submit Measurements"}
//       </button>
//     </form>
//   );
// };

// export default MeasureForm;





import { useState, useEffect } from "react";
import { getStorageItem, setStorageItem, isStorageAllowed } from '../src/utils/enhancedConsentUtils';
import styles from "./MeasureForm.module.css";

const MeasureForm = ({ onSubmit, initialData = null }) => {
  const [measurements, setMeasurements] = useState(() => {
    if (initialData) {
      return initialData;
    }
    
    try {
      // Use consent-aware storage getter
      const savedData = getStorageItem('measurements', 'userPreferences');
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
  const [storageNotice, setStorageNotice] = useState('');

  // Check storage consent and update notice
  const checkAndUpdateStorageNotice = () => {
    if (!isStorageAllowed('measurements', 'userPreferences')) {
      setStorageNotice('Your measurement preferences will not be saved due to your privacy settings.');
    } else {
      setStorageNotice('');
    }
  };

  useEffect(() => {
    // Check initial state
    checkAndUpdateStorageNotice();

    // Listen for storage consent changes
    const handleStorageConsentChange = (event) => {
      const { localStorage: storageSettings } = event.detail;
      
      if (!storageSettings.granted || !storageSettings.categories.userPreferences) {
        setStorageNotice('Your measurement preferences will not be saved due to your privacy settings.');
      } else {
        setStorageNotice('');
      }
    };

    // Also listen for general consent changes to immediately update
    const handleConsentChange = () => {
      checkAndUpdateStorageNotice();
    };

    window.addEventListener('storageConsentChanged', handleStorageConsentChange);
    window.addEventListener('consentChanged', handleConsentChange);

    return () => {
      window.removeEventListener('storageConsentChanged', handleStorageConsentChange);
      window.removeEventListener('consentChanged', handleConsentChange);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if all required fields are filled
    if (measurements.height && measurements.chest && measurements.waist && measurements.hips) {
      setSubmitted(true);
      
      // Try to save to localStorage with consent check
      const saveSuccess = setStorageItem('measurements', JSON.stringify(measurements), 'userPreferences');
      
      if (!saveSuccess) {
        setStorageNotice('Measurements submitted but not saved due to your privacy settings. You may need to re-enter them on your next visit.');
      } else {
        // Clear any previous notice if save was successful
        setStorageNotice('');
      }
      
      // Call the onSubmit prop with the measurements data
      if (onSubmit && typeof onSubmit === 'function') {
        onSubmit(measurements);
      }
    } else {
      alert("Please fill in all measurement fields.");
    }
  };

  const openPrivacySettings = () => {
    window.dispatchEvent(new CustomEvent('openConsentSettings'));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.measureForm}>
      <h3>Enter Your Measurements</h3>
      
      {storageNotice && (
        <div className={styles.storageNotice}>
          {storageNotice}
          {storageNotice.includes('privacy settings') && (
            <>
              {' '}
              <button 
                type="button"
                onClick={openPrivacySettings}
                className={styles.privacyLink}
              >
                Update privacy settings
              </button>{' '}
              to save your preferences.
            </>
          )}
        </div>
      )}
      
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