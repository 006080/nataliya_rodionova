import styles from "./Nav.module.css";

const Nav = ({ children }) => {
  const isContactPage = window.location.pathname === "/contacts";

  return (
    <div className={`${styles.nav} ${isContactPage ? styles.navContacts : ""}`}>
      <div className={styles.navBarContentWrapper}>{children}</div>
    </div>
  );
};

export default Nav;