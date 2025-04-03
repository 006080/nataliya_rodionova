import React from "react";
import styles from "./ReturnPolicy.module.css"; 


const ReturnPolicy = () => {
  return (
    <div className={styles.returnPolicyContainer}>

      <section className={styles.section}>
        <h3 style={{marginTop:'70px'}} className={styles.subheading}>Return Policy</h3>
        <p className={styles.text}>
          You may return your items within 14 days of receiving your order. 
          To be eligible for a return, the item must be unused and in the same condition that you received it. 
          It must also be in the original packaging.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.subheading}>Conditions for Return</h3>
        <ul className={styles.list}>
          <li>Items must be returned in their original condition.</li>
          <li>Items must have all original tags attached.</li>
          <li>Shipping costs for returns are the responsibility of the customer, unless the item is defective.</li>
          <li>Discounted items are not eligible for return, unless defective.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.subheading}>How to Initiate a Return</h3>
        <p className={styles.text}>
          To initiate a return, please contact our customer service team at <strong>nataliiarodionova00gmail.com  </strong> 
          with your order number and the item(s) you wish to return. Our team will provide instructions on how to proceed.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.subheading}>Refunds</h3>
        <p className={styles.text}>
          Once we receive your returned item, we will inspect it and notify you of the approval or rejection of your refund. 
          If approved, your refund will be processed, and a credit will be applied to your original payment method. 
          Please note that it may take some time for your bank or credit card company to process the refund.
        </p>
      </section>
    </div>
  );
};

export default ReturnPolicy
