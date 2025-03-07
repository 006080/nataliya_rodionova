import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import styles from './PaymentMethodSelector.module.css';

const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx",
  },
});

const PaymentMethodSelector = ({ onSelectMethod, selectedMethod }) => {

  const getImage = (imageId) =>
    cld
      .image(imageId)
      .format("auto")
      .quality("auto")
      .resize(auto().gravity(autoGravity()));

  return (
    <div className={styles.paymentMethods}>
      <h3>Select Payment Method</h3>
      
      <div className={styles.methodOptions}>
        <div 
          className={`${styles.method} ${selectedMethod === 'paypal' ? styles.selected : ''}`}
          onClick={() => onSelectMethod('paypal')}
        >
            <AdvancedImage
              className={styles.paymentIcon}
              style={{ marginTop: "10px", width: "100%"}}
              cldImg={getImage("paypal_ww2gpn")}
            />
          <span>PayPal</span>
        </div>
        
        <div 
          className={`${styles.method} ${selectedMethod === 'stripe' ? styles.selected : ''}`}
          onClick={() => onSelectMethod('stripe')}
        >
            <AdvancedImage
              className={styles.paymentIcon}
              style={{ marginTop: "10px", width: "100%"}}
              cldImg={getImage("stripe_pl0sbg")}
            />
          <span>Credit Card</span>
        </div>
        
        <div 
          className={`${styles.method} ${selectedMethod === 'mollie' ? styles.selected : ''}`}
          onClick={() => onSelectMethod('mollie')}
        >
            <AdvancedImage
              style={{ filter: "invert(1)", marginTop: "10px", width: "50%" }}
              className={styles.paymentIcon}
              cldImg={getImage(
                "png-transparent-mollie-logo-tech-companies_u6ibbl"
              )}
            />
          <span>Mollie</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;