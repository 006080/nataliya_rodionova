import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "./SubmitForm.module.css";

// Initialize Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx", // Replace with your Cloudinary cloud name
  },
});

// Function to get the Cloudinary image
const getImage = (imageId) =>
  cld.image(imageId).format("auto").quality("auto");

const SubmitForm = ({ onClose }) => {
  return (
    <div className={styles.submitModal}>
      {/* Replace local image with Cloudinary image */}
      <AdvancedImage
        className={styles.adesivo}
        cldImg={getImage("adesivo_vgxut0")} // Replace with your Cloudinary public ID
        alt="Sticker"
      />
      {/* <div className={styles.header}>
        <h3 style={{ textAlign: "center" }}>Form submitted successfully!</h3>
        <FontAwesomeIcon
          icon={faTimes}
          className={styles.closeIcon}
          onClick={onClose}
        />
      </div>
      <div className={styles.itemList}>
        <div className={styles.item}>
          <p>Please be patient as we process your message.</p>
          <button
            onClick={onClose}
            style={{ backgroundColor: "white", color: "black" }}
          >
            OK
          </button>
        </div>
      </div> */}
           <div className={styles.header}>
              <h3 style={{ textAlign: "center" }}>Form submitted successfully!</h3>
              {/* Close Icon */}
              <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={onClose} />
            </div>
      
            <div className={styles.itemList}>
              <div className={styles.item}>
                <p>Please be patient as we process your message.</p>
                {/* Close Button */}
                <button onClick={onClose} style={{ backgroundColor: "white", color: "black", marginBottom: "70px" }}>
                  OK
                </button>
              </div>
              </div>
    </div>
  );
};

export default SubmitForm;
