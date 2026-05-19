'use client';

import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";
// Импортируем модули Cloudinary для отображения оригинального логотипа
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";

// Инициализируем Cloudinary с вашим облачным именем dwenvtwyx
const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx",
  },
});

// Настраиваем объект изображения логотипа. 
// "LOGO" — это Public ID вашего файла в медиатеке Cloudinary.
const logoImage = cld
  .image("LOGO_remqhx")
  .format("auto")
  .quality("auto");

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className={styles.footer}>
      <div className={styles.topSection}>

        {/* ЛЕВАЯ КОЛОНКА: БРЕНД И КОНТАКТЫ */}
        <div className={styles.brandColumn}>
          <h2 className={styles.logoContainer}>
            <AdvancedImage 
              cldImg={logoImage} 
              className={styles.logoImg} 
              alt="VARONA Logo"
            />
          </h2>

          <p className={styles.description}>
            Independent Fashion Platform — Berlin.
            <br />
            Responsible luxury, digital craftsmanship
            and contemporary design.
          </p>

          <div className={styles.contactBlock}>
            <a
              href="mailto:info@nataliyarodionova.com"
              className={styles.contactLink}
            >
              info@nataliyarodionova.com
            </a>
            <span className={styles.location}>
              Berlin, Germany
            </span>
          </div>
        </div>

        {/* ЦЕНТРАЛЬНАЯ КОЛОНКА: НАВИГАЦИЯ */}
        <div className={styles.navigationColumn}>
          <span className={styles.columnTitle}>Navigation</span>

          {/* Чистый внешний тег <a> без обёртки в <button> */}
          <a
            href="https://www.varonaofficial.com/shop/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalNavLink}
          >
            Shop
          </a>

          <button type="button" onClick={() => navigate("/contacts")}>
           Contact
          </button>

          <button type="button" onClick={() => navigate("/collaboration")}>
            Collaboration
          </button>

          {/* Чистый внешний тег <a> без обёртки в <button> */}
          <a
            href="https://thefashionvox.wordpress.com/2018/07/27/varona/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalNavLink}
          >
            Press
          </a>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ */}
        <div className={styles.legalColumn}>
          <span className={styles.columnTitle}>Legal</span>

          <button type="button" onClick={() => navigate("/impressum")}>
            Impressum
          </button>

          <button type="button" onClick={() => navigate("/privacy-policy")}>
            Privacy Policy
          </button>

          <button type="button" onClick={() => navigate("/cookie-settings")}>
            Cookie Settings
          </button>

          
        </div>

      </div>

      {/* ДЕКОРАТИВНАЯ ЛИНИЯ-РАЗДЕЛИТЕЛЬ */}
      <div className={styles.divider} />

      {/* НИЖНЯЯ СЕКЦИЯ: СОЦСЕТИ И КОПИРАЙТ */}
      <div className={styles.bottomSection}>

        <div className={styles.socials}>
          <a
            href="https://www.instagram.com/varona_nataliyarodionova/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>

          <a
            href="https://www.youtube.com/watch?app=desktop&v=YhKtUzEA-jU"
            target="_blank"
            rel="noopener noreferrer"
          >
            Film
          </a>
        </div>

        <p className={styles.copyright}>
          © VARONA — All Rights Reserved
        </p>

      </div>
    </footer>
  );
};

export default Footer;