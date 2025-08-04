// import { useState, useEffect } from "react";
// import { countries } from "../src/utils/countries";
// import { getStorageItem, setStorageItem } from "../src/utils/enhancedConsentUtils";
// import styles from "./DeliveryForm.module.css";

// const DeliveryForm = ({ onFormSubmit, initialData = null }) => {
//   const [deliveryDetails, setDeliveryDetails] = useState(() => {
//     if (initialData) {
//       return initialData;
//     }
    
//     try {
//       // Use consent-aware storage getter
//       const savedData = getStorageItem('deliveryDetails', 'userPreferences');
//       if (savedData) {
//         return JSON.parse(savedData);
//       }
//     } catch (error) {
//       console.error('Error loading delivery details from localStorage:', error);
//     }
    
//     return {
//       fullName: "",
//       address: "",
//       city: "",
//       postalCode: "",
//       country: "",
//       email: "",
//       phone: "",
//     };
//   });
  
//   const [errors, setErrors] = useState({});
//   const [storageNotice, setStorageNotice] = useState('');

//   // Listen for storage consent changes
//   useEffect(() => {
//     const handleStorageConsentChange = (event) => {
//       const { localStorage: storageSettings } = event.detail;
      
//       if (!storageSettings.granted || !storageSettings.categories.userPreferences) {
//         setStorageNotice('Your delivery preferences will not be saved due to your privacy settings.');
//       } else {
//         setStorageNotice('');
//       }
//     };

//     window.addEventListener('storageConsentChanged', handleStorageConsentChange);
    
//     // Check initial state
//     const hasAnyData = Object.values(deliveryDetails).some(value => value.trim() !== '');
//     if (hasAnyData && !getStorageItem('deliveryDetails', 'userPreferences')) {
//       setStorageNotice('Your delivery preferences will not be saved due to your privacy settings.');
//     }

//     return () => {
//       window.removeEventListener('storageConsentChanged', handleStorageConsentChange);
//     };
//   }, [deliveryDetails]);

//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };
  
//   const validatePhone = (phone) => {
//     // Simple validation for phone number (at least 10 digits)
//     const re = /^\d{10,15}$/;
//     return re.test(phone.replace(/\D/g, ''));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setDeliveryDetails(prev => ({ ...prev, [name]: value }));
    
//     // Clear error for this field when the user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: null }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     // Check required fields
//     if (!deliveryDetails.fullName.trim()) {
//       newErrors.fullName = "Full name is required";
//     }
    
//     if (!deliveryDetails.address.trim()) {
//       newErrors.address = "Address is required";
//     }

//     if (!deliveryDetails.postalCode.trim()) {
//       newErrors.postalCode = "Postal code is required";
//     }
    
//     if (!deliveryDetails.city.trim()) {
//       newErrors.city = "City is required";
//     }
    
//     if (!deliveryDetails.country.trim()) {
//       newErrors.country = "Country is required";
//     }
    
//     if (!deliveryDetails.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!validateEmail(deliveryDetails.email)) {
//       newErrors.email = "Please enter a valid email address";
//     }
    
//     if (!deliveryDetails.phone.trim()) {
//       newErrors.phone = "Phone number is required";
//     } else if (!validatePhone(deliveryDetails.phone)) {
//       newErrors.phone = "Please enter a valid phone number";
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (validateForm()) {
//       // Try to save with consent check
//       const saveSuccess = setStorageItem('deliveryDetails', JSON.stringify(deliveryDetails), 'userPreferences');
      
//       if (!saveSuccess) {
//         setStorageNotice('Delivery details submitted but not saved due to your privacy settings. You may need to re-enter them on your next visit.');
//       } else {
//         // Clear any previous notice if save was successful
//         setStorageNotice('');
//       }
      
//       onFormSubmit(deliveryDetails);
//     }
//   };

//   const openPrivacySettings = () => {
//     window.dispatchEvent(new CustomEvent('openConsentSettings'));
//   };

//   return (
//     <form className={styles.deliveryForm} onSubmit={handleSubmit}>
//       <h3>Delivery Information</h3>
      
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
      
//       <div className={styles.formField}>
//         <label htmlFor="fullName">Full Name</label>
//         <input 
//           type="text" 
//           id="fullName"
//           name="fullName" 
//           placeholder="Full Name" 
//           value={deliveryDetails.fullName} 
//           onChange={handleChange} 
//           className={errors.fullName ? styles.errorInput : ""}
//         />
//         {errors.fullName && <div className={styles.errorText}>{errors.fullName}</div>}
//       </div>
      
//       <div className={styles.formField}>
//         <label htmlFor="address">Address</label>
//         <input 
//           type="text" 
//           id="address"
//           name="address" 
//           placeholder="Address" 
//           value={deliveryDetails.address} 
//           onChange={handleChange} 
//           className={errors.address ? styles.errorInput : ""}
//         />
//         {errors.address && <div className={styles.errorText}>{errors.address}</div>}
//       </div>
      
//       <div className={styles.formRow}>
//         <div className={styles.formField}>
//           <label htmlFor="postalCode">Postal Code</label>
//           <input 
//             type="text" 
//             id="postalCode"
//             name="postalCode" 
//             placeholder="Postal Code" 
//             value={deliveryDetails.postalCode} 
//             onChange={handleChange} 
//             className={errors.postalCode ? styles.errorInput : ""}
//           />
//           {errors.postalCode && <div className={styles.errorText}>{errors.postalCode}</div>}
//         </div>

//         <div className={styles.formField}>
//           <label htmlFor="city">City</label>
//           <input 
//             type="text" 
//             id="city"
//             name="city" 
//             placeholder="City" 
//             value={deliveryDetails.city} 
//             onChange={handleChange} 
//             className={errors.city ? styles.errorInput : ""}
//           />
//           {errors.city && <div className={styles.errorText}>{errors.city}</div>}
//         </div>
//       </div>

//       <div className={styles.formGroup}>
//         <label htmlFor="country">Country *</label>
//         <select
//           id="country"
//           name="country"
//           value={deliveryDetails.country}
//           onChange={handleChange}
//           className={errors.country ? styles.inputError : ''}
//         >
//           <option value="">Select Country</option>
//           {countries.map(country => (
//             <option key={country.code} value={country.code}>
//               {country.name}
//             </option>
//           ))}
//         </select>
//         {errors.country && <span className={styles.errorMessage}>{errors.country}</span>}
//       </div>
      
//       <div className={styles.formField}>
//         <label htmlFor="email">Email</label>
//         <input 
//           type="email" 
//           id="email"
//           name="email" 
//           placeholder="Email" 
//           value={deliveryDetails.email} 
//           onChange={handleChange} 
//           className={errors.email ? styles.errorInput : ""}
//         />
//         {errors.email && <div className={styles.errorText}>{errors.email}</div>}
//       </div>
      
//       <div className={styles.formField}>
//         <label htmlFor="phone">Phone</label>
//         <input 
//           type="tel" 
//           id="phone"
//           name="phone" 
//           placeholder="Phone" 
//           value={deliveryDetails.phone} 
//           onChange={handleChange} 
//           className={errors.phone ? styles.errorInput : ""}
//         />
//         {errors.phone && <div className={styles.errorText}>{errors.phone}</div>}
//       </div>
      
//       <button type="submit" className={styles.submitButton}>
//         Continue to Payment
//       </button>
//     </form>
//   );
// };

// export default DeliveryForm;







import { useState, useEffect } from "react";
import { countries } from "../src/utils/countries";
import { getStorageItem, setStorageItem, isStorageAllowed } from "../src/utils/enhancedConsentUtils";
import styles from "./DeliveryForm.module.css";

const DeliveryForm = ({ onFormSubmit, initialData = null }) => {
  const [deliveryDetails, setDeliveryDetails] = useState(() => {
    if (initialData) {
      return initialData;
    }
    
    try {
      // Use consent-aware storage getter
      const savedData = getStorageItem('deliveryDetails', 'userPreferences');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading delivery details from localStorage:', error);
    }
    
    return {
      fullName: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      email: "",
      phone: "",
    };
  });
  
  const [errors, setErrors] = useState({});
  const [storageNotice, setStorageNotice] = useState('');

  // Check storage consent and update notice
  const checkAndUpdateStorageNotice = () => {
    if (!isStorageAllowed('deliveryDetails', 'userPreferences')) {
      setStorageNotice('Your delivery preferences will not be saved due to your privacy settings.');
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
        setStorageNotice('Your delivery preferences will not be saved due to your privacy settings.');
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validatePhone = (phone) => {
    // Simple validation for phone number (at least 10 digits)
    const re = /^\d{10,15}$/;
    return re.test(phone.replace(/\D/g, ''));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when the user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check required fields
    if (!deliveryDetails.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!deliveryDetails.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!deliveryDetails.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }
    
    if (!deliveryDetails.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!deliveryDetails.country.trim()) {
      newErrors.country = "Country is required";
    }
    
    if (!deliveryDetails.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(deliveryDetails.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!deliveryDetails.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(deliveryDetails.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Try to save with consent check
      const saveSuccess = setStorageItem('deliveryDetails', JSON.stringify(deliveryDetails), 'userPreferences');
      
      if (!saveSuccess) {
        setStorageNotice('Delivery details submitted but not saved due to your privacy settings. You may need to re-enter them on your next visit.');
      } else {
        // Clear any previous notice if save was successful
        setStorageNotice('');
      }
      
      onFormSubmit(deliveryDetails);
    }
  };

  const openPrivacySettings = () => {
    window.dispatchEvent(new CustomEvent('openConsentSettings'));
  };

  return (
    <form className={styles.deliveryForm} onSubmit={handleSubmit}>
      <h3>Delivery Information</h3>
      
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
      
      <div className={styles.formField}>
        <label htmlFor="fullName">Full Name</label>
        <input 
          type="text" 
          id="fullName"
          name="fullName" 
          placeholder="Full Name" 
          value={deliveryDetails.fullName} 
          onChange={handleChange} 
          className={errors.fullName ? styles.errorInput : ""}
        />
        {errors.fullName && <div className={styles.errorText}>{errors.fullName}</div>}
      </div>
      
      <div className={styles.formField}>
        <label htmlFor="address">Address</label>
        <input 
          type="text" 
          id="address"
          name="address" 
          placeholder="Address" 
          value={deliveryDetails.address} 
          onChange={handleChange} 
          className={errors.address ? styles.errorInput : ""}
        />
        {errors.address && <div className={styles.errorText}>{errors.address}</div>}
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label htmlFor="postalCode">Postal Code</label>
          <input 
            type="text" 
            id="postalCode"
            name="postalCode" 
            placeholder="Postal Code" 
            value={deliveryDetails.postalCode} 
            onChange={handleChange} 
            className={errors.postalCode ? styles.errorInput : ""}
          />
          {errors.postalCode && <div className={styles.errorText}>{errors.postalCode}</div>}
        </div>

        <div className={styles.formField}>
          <label htmlFor="city">City</label>
          <input 
            type="text" 
            id="city"
            name="city" 
            placeholder="City" 
            value={deliveryDetails.city} 
            onChange={handleChange} 
            className={errors.city ? styles.errorInput : ""}
          />
          {errors.city && <div className={styles.errorText}>{errors.city}</div>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="country">Country *</label>
        <select
          id="country"
          name="country"
          value={deliveryDetails.country}
          onChange={handleChange}
          className={errors.country ? styles.inputError : ''}
        >
          <option value="">Select Country</option>
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.country && <span className={styles.errorMessage}>{errors.country}</span>}
      </div>
      
      <div className={styles.formField}>
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email"
          name="email" 
          placeholder="Email" 
          value={deliveryDetails.email} 
          onChange={handleChange} 
          className={errors.email ? styles.errorInput : ""}
        />
        {errors.email && <div className={styles.errorText}>{errors.email}</div>}
      </div>
      
      <div className={styles.formField}>
        <label htmlFor="phone">Phone</label>
        <input 
          type="tel" 
          id="phone"
          name="phone" 
          placeholder="Phone" 
          value={deliveryDetails.phone} 
          onChange={handleChange} 
          className={errors.phone ? styles.errorInput : ""}
        />
        {errors.phone && <div className={styles.errorText}>{errors.phone}</div>}
      </div>
      
      <button type="submit" className={styles.submitButton}>
        Continue to Payment
      </button>
    </form>
  );
};

export default DeliveryForm;