import styles from './PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
  return (
    <div className={styles.policyContainer}>
      <h1>Privacy & Cookie Policy</h1>
      <p className={styles.lastUpdated}>Last updated: May 18, 2025</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to Nataliya Rodionova's website. We respect your privacy and are committed to protecting your personal data.
          This Privacy & Cookie Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
        </p>
        <p>
          Please read this Privacy & Cookie Policy carefully. If you do not agree with the terms of this Privacy & Cookie Policy,
          please do not access this site.
        </p>
      </section>

      <section>
        <h2>2. Data Controller</h2>
        <p>
          Nataliya Rodionova (referred to as "we", "us", or "our" in this policy) is the controller and responsible for your personal data.
        </p>
        <p>
          <strong>Contact Details:</strong><br />
          Email: contact@nataliyarodionova.com<br />
          Postal address: [YOUR PHYSICAL ADDRESS]
        </p>
      </section>

      <section>
        <h2>3. Types of Data We Collect</h2>
        <p>We may collect the following types of personal data from you:</p>
        <ul>
          <li><strong>Identity Data:</strong> First name, last name, username</li>
          <li><strong>Contact Data:</strong> Email address, telephone number, address, country</li>
          <li><strong>Financial Data:</strong> Payment information (processed by our payment providers)</li>
          <li><strong>Transaction Data:</strong> Details about purchases, orders, and payments</li>
          <li><strong>Technical Data:</strong> IP address, browser type and version, device information</li>
          <li><strong>Profile Data:</strong> Your username and password, purchases, preferences, feedback</li>
          <li><strong>Usage Data:</strong> Information about how you use our website</li>
          <li><strong>Marketing Data:</strong> Your preferences for receiving marketing from us</li>
          <li><strong>Special Categories:</strong> Body measurements for custom clothing orders</li>
        </ul>
      </section>

      <section>
        <h2>4. How We Collect Your Data</h2>
        <p>We collect data through:</p>
        <ul>
          <li><strong>Direct interactions:</strong> When you fill in forms, create an account, place an order, provide feedback</li>
          <li><strong>Automated technologies:</strong> As you navigate our website, we may automatically collect Technical Data</li>
          <li><strong>Third parties:</strong> We may receive data from analytics providers, payment providers</li>
        </ul>
      </section>

      <section>
        <h2>5. How We Use Your Data</h2>
        <p>We use your data for the following purposes:</p>
        <ul>
          <li>To register you as a new customer</li>
          <li>To process and deliver your orders</li>
          <li>To manage our relationship with you</li>
          <li>To improve our website and services</li>
          <li>To recommend products that may interest you</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>6. Legal Basis for Processing</h2>
        <p>We process your personal data on the following legal bases:</p>
        <ul>
          <li><strong>Consent:</strong> Where you have given us clear consent to process your data</li>
          <li><strong>Contract:</strong> Where processing is necessary for the performance of a contract with you</li>
          <li><strong>Legal obligation:</strong> Where processing is necessary for compliance with a legal obligation</li>
          <li><strong>Legitimate interests:</strong> Where processing is necessary for our legitimate interests or those of a third party</li>
        </ul>
      </section>

      <section>
        <h2>7. Cookies and Similar Technologies</h2>
        <h3>7.1 Essential Cookies</h3>
        <p>
          We use essential cookies on our website which are strictly necessary for the basic functionality of our site. 
          These cookies enable core features such as security, account management, and authentication. According to GDPR, 
          essential cookies do not require explicit consent as they are necessary for the operation of our website.
        </p>
        <p>
          <strong>Essential cookies we use:</strong>
        </p>
        <ul>
          <li><strong>Session cookies:</strong> Temporary cookies that remember your login status and shopping cart items</li>
          <li><strong>Security cookies:</strong> Cookies that help maintain secure areas of our website</li>
          <li><strong>Preference cookies:</strong> Cookies that remember your basic preferences</li>
        </ul>

        <h3>7.2 Third-Party Cookies (Only with Consent)</h3>
        <p>
          We only use the following third-party cookies after receiving your explicit consent through our cookie banner:
        </p>
        <ul>
          <li>
            <strong>Google reCAPTCHA:</strong> Used to protect our forms from spam and abuse. Google reCAPTCHA sets cookies and 
            collects data to determine if you are a human or a bot. This service sets third-party cookies and loads scripts from Google's servers.
          </li>
          <li>
            <strong>PayPal:</strong> Used for payment processing. PayPal sets cookies to enable secure payment transactions and 
            may collect data about your device and location for fraud prevention purposes.
          </li>
        </ul>
        <p>
          These third-party services will not be loaded or set cookies on your device unless you explicitly consent by clicking 
          "Accept All" on our cookie consent banner.
        </p>

        <h3>7.3 Other Third-Party Services</h3>
        <p>
          <strong>Google Fonts:</strong> We use Google Fonts to enhance the visual appearance of our website. 
          While Google Fonts may collect usage data, it is processed in a way that does not usually identify individuals. 
          Nevertheless, we inform you about this service in the interest of transparency.
        </p>
        <p>
          <strong>Cloudinary:</strong> We use Cloudinary for image hosting and storage of user-uploaded images (such as in reviews). 
          Cloudinary may collect technical data related to image delivery and optimization.
        </p>
      </section>

      <section>
        <h2>8. Data Storage and Security</h2>
        <p>
          Your data is stored in a MongoDB database hosted on our secure servers. We implement appropriate security measures to 
          protect your personal data against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p>
          All payment transactions are encrypted using industry-standard SSL technology. Payment details are not stored on our servers 
          and are processed directly by our payment providers (PayPal).
        </p>
      </section>

      <section>
        <h2>9. Data Retention</h2>
        <p>
          We will retain your personal data only for as long as necessary to fulfill the purposes for which we collected it, 
          including for the purposes of satisfying any legal, accounting, or reporting requirements.
        </p>
        <p>
          User accounts that are inactive for more than 24 months may be subject to deletion after notification. 
          Order information is kept for tax and accounting purposes for the period required by law.
        </p>
      </section>

      <section>
        <h2>10. Your Data Protection Rights</h2>
        <p>Under GDPR, you have the following rights in relation to your personal data:</p>
        <ul>
          <li><strong>Right to access:</strong> You can request copies of your personal data</li>
          <li><strong>Right to rectification:</strong> You can request that we correct inaccurate personal data</li>
          <li><strong>Right to erasure:</strong> You can request that we delete your personal data in certain circumstances</li>
          <li><strong>Right to restrict processing:</strong> You can request that we restrict processing of your personal data</li>
          <li><strong>Right to data portability:</strong> You can request the transfer of your personal data to another organization</li>
          <li><strong>Right to object:</strong> You can object to our processing of your personal data</li>
          <li><strong>Rights related to automated decision making:</strong> You have rights relating to automated decision making and profiling</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us using the details provided in the "Data Controller" section. 
          We will respond to your request within 30 days.
        </p>
      </section>

      <section>
        <h2>11. Third-Party Links</h2>
        <p>
          Our website may include links to third-party websites, plug-ins, and applications. Clicking on those links or enabling those 
          connections may allow third parties to collect or share data about you. We do not control these third-party websites and are 
          not responsible for their privacy statements.
        </p>
      </section>

      <section>
        <h2>12. Children's Privacy</h2>
        <p>
          Our website is not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16. 
          If you are under 16, please do not provide any personal data to us.
        </p>
      </section>

      <section>
        <h2>13. Changes to the Privacy Policy</h2>
        <p>
          We may update this Privacy & Cookie Policy from time to time. We will notify you of any significant changes by posting the new 
          Privacy & Cookie Policy on this page and updating the "Last Updated" date.
        </p>
      </section>

      <section>
        <h2>14. How to Contact Us or File a Complaint</h2>
        <p>
          If you have any questions about this Privacy & Cookie Policy, or if you would like to exercise any of your rights, 
          please contact us at:
        </p>
        <p>
          Email: contact@nataliyarodionova.com<br />
          Postal address: [YOUR PHYSICAL ADDRESS]
        </p>
        <p>
          You have the right to make a complaint at any time to your local data protection authority. However, we would appreciate 
          the chance to deal with your concerns before you approach the authority, so please contact us in the first instance.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;