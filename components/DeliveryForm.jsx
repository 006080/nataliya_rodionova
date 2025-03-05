import { useState } from "react";
import styles from "./DeliveryForm.module.css"; // Ensure the CSS file exists

const DeliveryForm = ({ onFormSubmit }) => {
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!deliveryDetails.fullName || !deliveryDetails.address || !deliveryDetails.city || !deliveryDetails.postalCode) {
      alert("Please fill in all the delivery details.");
      return;
    }

    onFormSubmit(deliveryDetails);
  };

  return (
    <form className={styles.deliveryForm} onSubmit={handleSubmit}>
      <h3>Delivery Information</h3>
      <input type="text" name="fullName" placeholder="Full Name" value={deliveryDetails.fullName} onChange={handleChange} required />
      <input type="text" name="address" placeholder="Address" value={deliveryDetails.address} onChange={handleChange} required />
      <input type="text" name="city" placeholder="City" value={deliveryDetails.city} onChange={handleChange} required />
      <input type="text" name="postalCode" placeholder="Postal Code" value={deliveryDetails.postalCode} onChange={handleChange} required />
      <button type="submit" className={styles.submitButton}>Save Delivery Details</button>
    </form>
  );
};

export default DeliveryForm;
