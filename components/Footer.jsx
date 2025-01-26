import { Link } from "react-router-dom"
import styles from "./Footer.module.css"

const Footer = () => {
  return (
    <div className={styles.footer}>
      <p>Seite – verwaltet von The Level S.r.l. - copyright © VARONA S.R.L. 2024 - Alle Rechte vorbehalten - Jegliche Reproduktion der Inhalte ist strengstens verboten.</p>
      <ul className={styles.termsNav}>
        <li className={styles.termsLink}><Link to="/legalnotice">Impressum</Link></li>
        <li className={styles.termsLink}><Link to="/privacypolicy">Datenschutzerklärung</Link></li>
      </ul>
    </div>
  )
}

export default Footer
