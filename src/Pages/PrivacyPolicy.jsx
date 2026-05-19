import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PrivacyPolicy.module.css';

const PrivacyPolicyPortfolio = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Effective Date: May 2026</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>01. An Overview of Data Protection</h2>
          <p className={styles.text}>
            This privacy policy explains how your personal data is handled when you visit 
            <strong> nataliyarodionova.com</strong>. As a non-commercial editorial portfolio, 
            data collection is kept to the absolute minimum necessary to securely run and maintain this website.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>02. General Information & Mandated Clauses</h2>
          <p className={styles.text}>
            The controller responsible for processing data on this website under applicable data 
            protection laws, including the General Data Protection Regulation (GDPR), is:
          </p>
          <p className={styles.controllerDetails}>
            <strong>Nataliya Rodionova</strong><br />
            Obstallee 18<br />
            13593, Berlin<br />
            Germany<br />
            Email: info@nataliyarodionova.com
          </p>
          <p className={styles.text}>
            You have the right to request information about your stored personal data, its origin, 
            its recipients, and the purpose of its collection at any time, free of charge. You also 
            have the right to demand that this data be corrected, blocked, or deleted.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>03. Data Collection on This Website</h2>
          <p className={styles.subHeading}>Server Log Files</p>
          <p className={styles.text}>
            The provider of this website automatically collects and stores information in temporary 
            server log files, which your browser transmits automatically. These include browser type, 
            operating system, referrer URL, host name of the accessing computer, and time of the server request. 
            This data is not combined with other data sources and is processed based on Art. 6(1)(f) GDPR 
            to maintain technical stability and security.
          </p>
          
          <p className={styles.subHeading} style={{ marginTop: '20px' }}>Contact Form Data</p>
          <p className={styles.text}>
            If you send an inquiry via our contact form, the information provided (your name, email address, 
            subject, and message) will be stored to process the request and handle potential follow-up questions. 
            We do not share this information without your explicit consent. The processing of this data is 
            based on Art. 6(1)(b) GDPR if your request is related to a contract, or Art. 6(1)(f) GDPR out of our 
            legitimate interest in effective communication.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>04. SSL or TLS Encryption</h2>
          <p className={styles.text}>
            For security reasons and to protect the transmission of confidential content, such as inquiries 
            you send to us as the site operator, this website uses SSL or TLS encryption. You can recognize 
            an encrypted connection by the change in the address line of the browser from "http://" to "https://" 
            and by the lock icon in your browser line.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>05. Right to File a Complaint</h2>
          <p className={styles.text}>
            In the event of violations of the GDPR, data subjects have the right to log a complaint with a 
            supervisory authority, particularly in the Member State of their habitual residence, place of 
            work, or place of the alleged violation. In Berlin, this is the <em>Berliner Beauftragte für Datenschutz 
            und Informationsfreiheit</em>.
          </p>
        </section>

        <div className={styles.footerRow}>
          <Link to="/" className={styles.backLink}>
            ← Back to portfolio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPortfolio;