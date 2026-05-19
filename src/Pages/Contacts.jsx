import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Contacts.module.css';

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle your form submission logic here (e.g., EmailJS, Formspree, or your backend)
    console.log('Form submitted:', formData);
    alert('Thank you. Your message has been sent.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>Inquiries</h1>
        <p className={styles.lastUpdated}>Creative Direction & Collaborations</p>
      </header>

      <div className={styles.splitLayout}>
        {/* Left Side: Direct Contact Details */}
        <div className={styles.infoColumn}>
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>01. Direct Lines</h2>
            <p className={styles.text}>
              For urgent matters, conceptual briefs, or project consulting:
            </p>
            <p className={styles.contactDetails}>
              <strong>E-Mail:</strong> info@nataliyarodionova.com<br />
              <strong>Phone:</strong> +49 176 20652851
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>02. Digital Identity</h2>
            <div className={styles.socialLinks}>
              <a href="https://www.varonaofficial.com" target="_blank" rel="noreferrer" className={styles.socialLink}>
                Explore VARONA
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialLink}>
                LinkedIn
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialLink}>
                Instagram
              </a>
            </div>
          </section>
        </div>

        {/* Right Side: Editorial Message Form */}
        <div className={styles.formColumn}>
          <h2 className={styles.sectionHeading}>03. Send a Message</h2>
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Your name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="your.email@domain.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="subject" className={styles.label}>Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Project inquiry, consultation, etc."
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="message" className={styles.label}>Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className={styles.textarea}
                placeholder="Describe your vision or proposal..."
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div className={styles.footerRow}>
        <Link to="/" className={styles.backLink}>
          ← Back to portfolio
        </Link>
      </div>
    </div>
  );
};

export default Contacts;