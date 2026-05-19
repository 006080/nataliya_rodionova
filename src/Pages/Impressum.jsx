import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Impressum.module.css'; // Стили те же, сохраняем консистентность

const Impressum = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>Impressum</h1>
        <p className={styles.lastUpdated}>Legal & Authorship Information</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>01. Provider Information (§ 5 DDG)</h2>
          <p className={styles.text}>
            <strong>Nataliia Rodionova</strong><br />
            Creative Direction & Fashion Identity<br />
            Ostallee 18<br />
            13593, Berlin<br />
            Deutschland
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>02. Contact</h2>
          <p className={styles.text}>
            Telefon: +49 17620652851<br />
            E-Mail: info@nataliyarodionova.com<br />
            Webseite: www.nataliyarodionova.com
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>03. Content Responsibility (§ 18 Abs. 2 MStV)</h2>
          <p className={styles.text}>
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />
            <strong>Nataliia Rodionova</strong><br />
            Obstallee 18<br />
            13593, Berlin<br />
            Deutschland
          </p>
        </section>

        <div style={{ marginTop: '40px' }}>
          <Link to="/" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#999', textDecoration: 'none', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Impressum;