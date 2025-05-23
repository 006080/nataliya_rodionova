import styles from './PrivacyPolicy.module.css';

const LegalNotice = () => {
  return (
    <div className={styles.policyContainer}>
      <h1>Legal Notice</h1>
      <p className={styles.lastUpdated}>Last updated: May 18, 2025</p>

      <section>
        <h2>1. Information in accordance with Section 5 TMG</h2>
        <p>
          Nataliya Rodionova<br />
          [YOUR PHYSICAL ADDRESS]<br />
          Germany
        </p>
        <p>
          <strong>Contact Information:</strong><br />
          Email: contact@nataliyarodionova.com<br />
          Phone: [YOUR PHONE NUMBER, optional if required by law]
        </p>
      </section>

      <section>
        <h2>2. EU Dispute Resolution</h2>
        <p>
          The European Commission provides a platform for online dispute resolution (ODR):<br />
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
        <p>
          Our email address can be found above in this legal notice.
        </p>
      </section>

      <section>
        <h2>3. Liability for Contents</h2>
        <p>
          As a service provider, we are responsible for our own content on these pages in accordance with general laws, pursuant to Section 7 (1) TMG. 
          According to Sections 8 to 10 TMG, however, we are not obligated to monitor transmitted or stored external information or to investigate circumstances that indicate illegal activity.
        </p>
        <p>
          Obligations to remove or block the use of information under general laws remain unaffected. 
          Liability in this respect, however, is only possible from the point in time at which a concrete infringement becomes known. 
          Upon becoming aware of any such legal violations, we will remove the content immediately.
        </p>
      </section>

      <section>
        <h2>4. Liability for Links</h2>
        <p>
          Our offer may contain links to external websites of third parties over whose content we have no control. 
          Therefore, we cannot assume any liability for this external content. 
          The respective provider or operator of the linked pages is always responsible for the content of those pages.
        </p>
        <p>
          The linked pages were checked for possible legal violations at the time of linking. 
          No illegal content was identified at the time of linking. A permanent content control of the linked pages is not reasonable without concrete evidence of an infringement. 
          If we become aware of any legal violations, we will remove such links immediately.
        </p>
      </section>

      <section>
        <h2>5. Copyright</h2>
        <p>
          The content and works on these pages created by the site operator are subject to German copyright law. 
          Duplication, processing, distribution, or any form of commercialization of such material beyond the scope of the copyright law shall require the prior written consent of its respective author or creator.
        </p>
        <p>
          Downloads and copies of this site are only permitted for private, non-commercial use. Insofar as the content on this site was not created by the operator, the copyrights of third parties are respected. 
          In particular, third-party content is marked as such. Should you nevertheless become aware of a copyright infringement, please inform us accordingly. 
          Upon becoming aware of any infringements, we will remove such content immediately.
        </p>
      </section>

    </div>
  );
};

export default LegalNotice;