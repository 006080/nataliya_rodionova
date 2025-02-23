import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import styles from "./Footer.module.css";

const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx",
  },
});

const Footer = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  const getImage = (imageId) =>
    cld
      .image(imageId)
      .format("auto")
      .quality("auto")
      .resize(auto().gravity(autoGravity()));

  const getFullSizeUrl = (imageId) =>
    `https://res.cloudinary.com/dwenvtwyx/image/upload/${imageId}.jpg`;

  const openImageModal = (imageId) => {
    setSelectedImage(getFullSizeUrl(imageId));
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className={styles.footer}>
      <h4 className={styles.foot} onClick={() => navigate("/terms")}>
        Terms and Conditions
      </h4>
      <h4 className={styles.foot} onClick={() => navigate("/return")}>
        Return Policy
      </h4>
      <div className={styles.paymentIcons}>
        <div className={styles.iconWrapper}>
          <AdvancedImage
            className={styles.paymentIcon}
            cldImg={getImage("card_zoasyf")}
          />
        </div>
        <div className={styles.iconWrapper}>
          <AdvancedImage
            className={styles.paymentIcon}
            cldImg={getImage("visa_vqehyp")}
          />
        </div><div className={styles.iconWrapper}>
          <AdvancedImage 
          style={{ filter: 'invert(1)', marginTop:'7px', width:'70px' }} 
            className={styles.paymentIcon}
            cldImg={getImage("png-transparent-mollie-logo-tech-companies_u6ibbl")}
          />
        </div>
        <div className={styles.iconWrapper}>
          <AdvancedImage
            className={styles.paymentIcon}
            cldImg={getImage("stripe_pl0sbg")}
          />
        </div>
        <div className={styles.iconWrapper}>
          <AdvancedImage
            className={styles.paymentIcon}
            style={{width:'75px',marginTop:"-15px" }} 
            cldImg={getImage("paypal_ww2gpn")}
          />
        </div>
        {/* Add more payment icons if necessary */}
      </div>
      <p>
        Seite – verwaltet von The Level S.r.l. - copyright © VARONA S.R.L. 2024
        - Alle Rechte vorbehalten - Jegliche Reproduktion der Inhalte ist
        strengstens verboten.
      </p>

      {/* Modal for Full-size Image */}
      {selectedImage && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={closeModal}>
              X
            </button>
            <img
              src={selectedImage}
              alt="Full-size view"
              className={styles.fullSizeImage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Footer;
