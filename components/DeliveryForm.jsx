// import { useState } from "react";
// import { countries } from "../src/utils/countries";
// import styles from "./DeliveryForm.module.css";


// const DeliveryForm = ({ onFormSubmit }) => {
//   const [deliveryDetails, setDeliveryDetails] = useState({
//     fullName: "",
//     address: "",
//     city: "",
//     postalCode: "",
//     country: "",
//     email: "",
//     phone: "",
//   });
  
//   const [errors, setErrors] = useState({});

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
//       onFormSubmit(deliveryDetails);
//     }
//   };

//   return (
//     <form className={styles.deliveryForm} onSubmit={handleSubmit}>
//       <h3>Delivery Information</h3>
      
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
//           <label htmlFor="country">Country *</label>
//           <select
//             id="country"
//             name="country"
//             value={deliveryDetails.country}
//             onChange={handleChange}
//             className={errors.country ? styles.inputError : ''}
//           >
//             <option value="">Select Country</option>
//             {countries.map(country => (
//               <option key={country.code} value={country.code}>
//                 {country.name}
//               </option>
//             ))}
//           </select>
//           {errors.country && <span className={styles.errorMessage}>{errors.country}</span>}
//         </div>
      
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




import { useState } from "react";
import { countries } from "../src/utils/countries";
import styles from "./DeliveryForm.module.css";

const DeliveryForm = ({ onFormSubmit, initialData = null }) => {
  // Initialize from props, localStorage, or defaults
  const [deliveryDetails, setDeliveryDetails] = useState(() => {
    // First prioritize passed initialData
    if (initialData) {
      return initialData;
    }
    
    // Then try to get from localStorage
    try {
      const savedData = localStorage.getItem('deliveryDetails');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading delivery details from localStorage:', error);
    }
    
    // Default empty state
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
      // Save to localStorage before submitting
      try {
        localStorage.setItem('deliveryDetails', JSON.stringify(deliveryDetails));
      } catch (error) {
        console.error('Error saving delivery details to localStorage:', error);
      }
      
      onFormSubmit(deliveryDetails);
    }
  };

  return (
    <form className={styles.deliveryForm} onSubmit={handleSubmit}>
      <h3>Delivery Information</h3>
      
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