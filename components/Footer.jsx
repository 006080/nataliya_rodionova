import styles from "./Footer.module.css"
// import { Router, Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.footer}>
      <h4 className={styles.foot} onClick={() => navigate("/terms")}>Terms and Conditions</h4>
      <h4 className={styles.foot} onClick={() => navigate("/return")}>Return Policy</h4>
      <p>Seite – verwaltet von The Level S.r.l. - copyright © VARONA S.R.L. 2024 - Alle Rechte vorbehalten - Jegliche Reproduktion der Inhalte ist strengstens verboten.</p>

    </div>
  )
}

export default Footer
