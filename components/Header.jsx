'use client';

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Nav>
      <header
        className={`${styles.navigation} ${
          scrolled ? styles.navigationScrolled : ""
        }`}
      >
        <nav className={styles.navbar}>
          {/* Единственная иконка-домик сверху, которая ведет на главную */}
          <button
            type="button"
            className={styles.homeIconButton}
            onClick={() => navigate("/")}
            title="Home"
            aria-label="Return to home page"
          >
            <div className={styles.iconWrapper}>
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </button>
        </nav>
      </header>
    </Nav>
  );
};

export default Header;