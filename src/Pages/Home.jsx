'use client';
// import { Cloudinary } from "@cloudinary/url-gen";
// import { AdvancedImage } from "@cloudinary/react";
import { useEffect, useRef } from "react";
import styles from "./Home.module.css";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";

// Импорт локальных изображений
import Tum from '../assets/Tum2.jpg';
import Logo from '../assets/LOGO.png';
import Footer from "../../components/Footer";

const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx",
  },
});

const varonaExploreLogo = cld
  .image("LOGO_remqhx")
  .format("auto")
  .quality("auto");

const backgroundImage = cld
  .image("IMG_1184_ttf4e8")
  .format("auto")
  .quality("auto");

const Home = () => {
  const zoomRef = useRef(null);
  // Начинаем с 1, так как базовое увеличение теперь заложено в CSS-анимацию автоматического «дыхания»
  const scaleRef = useRef(1);

  useEffect(() => {
    const zoomElement = zoomRef.current;
    if (!zoomElement) return;

    const handleWheelZoom = (e) => {
      // Работает только на первом экране
      if (window.scrollY > 200) return;

      const speed = 0.0003;
      scaleRef.current += e.deltaY * speed;

      // Дополнительный интерактивный зум (от 0.95 до 1.2) поверх авто-анимации
      scaleRef.current = Math.min(Math.max(scaleRef.current, 0.95), 1.2);

      // Передаем значение в CSS-переменную, чтобы не ломать текущую авто-анимацию
      zoomElement.style.setProperty('--user-zoom', scaleRef.current);
    };

    window.addEventListener("wheel", handleWheelZoom, { passive: true });
    return () => window.removeEventListener("wheel", handleWheelZoom);
  }, []);

  return (
    <div className={styles.pageWrapper}>

      {/* SECTION 1: HERO SCREEN */}
      <section className={styles.hero}>

        {/* Внешний слой: CSS-Параллакс (сдвиг по вертикали при скролле) */}
        <div className={styles.parallaxContainer}>

          {/* Внутренний слой: Автоматическое дыхание фона + Интерактивный Wheel-зум */}
          <div ref={zoomRef} className={styles.zoomContainer}>
            <AdvancedImage
              cldImg={backgroundImage}
              className={styles.backgroundImage}
            />
          </div>

        </div>

        <div className={styles.overlay} />

        <div className={styles.content}>
          <span className={styles.label}>Nataliya Rodionova</span>
          <h1 className={styles.title}>
            Creative Direction
            <br />
            <span className={styles.titleSub}>& Fashion Identity</span>
          </h1>
          <p className={styles.description}>
            Founder of VARONA.
            <br />
            Visual storytelling, independent fashion and conceptual aesthetics.
          </p>
          <div className={styles.linksContainer}>


            <a
              href="https://www.varonaofficial.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.exploreButtonLink}
            >
              <span className={styles.exploreText}>EXPLORE</span>
              {/* <AdvancedImage
                cldImg={varonaExploreLogo}
                className={styles.exploreButtonLogo}
                alt="VARONA"
              /> */}
            </a>

            {/* <a href="https://thefashionvox.wordpress.com/2018/07/27/varona/" target="_blank" rel="noreferrer" className={styles.secondaryLink}>
              View Press
            </a> */}



          </div>
          <section className={styles.editorialSection}>
            <div className={styles.textContainer}>
              <span className={styles.sectionMeta}>01 / AUTHORSHIP</span>
              <blockquote className={styles.manifestoQuote}>
                “For me, fashion and storytelling coexist as refined forms of expression—
                revealing what cannot be spoken, without noise, flirtation, or superficiality.
                I create for individuals who treat fashion as an intellectual domain,
                not a stage for attention.”
              </blockquote>
              {/* <blockquote className={styles.manifestoQuoteSub}>
            “True style is self-authored. My work stands firmly in craftsmanship, focus,
            and intention—unaffected by distraction or the trivial games of the everyday world.”
          </blockquote> */}
            </div>
          </section>
        </div>
      </section>




      {/* SECTION 2: THE MANIFESTO */}
      {/* <section className={styles.editorialSection}>
        <div className={styles.textContainer}>
          <span className={styles.sectionMeta}>01 / AUTHORSHIP</span>
          <blockquote className={styles.manifestoQuote}>
            “For me, fashion and storytelling coexist as refined forms of expression—
            revealing what cannot be spoken, without noise, flirtation, or superficiality.
            I create for individuals who treat fashion as an intellectual domain,
            not a stage for attention.”
          </blockquote>
          <blockquote className={styles.manifestoQuoteSub}>
            “True style is self-authored. My work stands firmly in craftsmanship, focus,
            and intention—unaffected by distraction or the trivial games of the everyday world.”
          </blockquote>
        </div>
      </section> */}

      {/* SECTION 3: BRAND PHILOSOPHY */}
      {/* <section className={styles.darkPhilosophySection}>
        <div className={styles.splitGrid}>
          <div className={styles.leftGridColumn}>
            <span className={styles.sectionMeta}>02 / DARKNESS DEFINED</span>
            <h2 className={styles.philosophyTitle}>Brand Philosophy</h2>
            <div className={styles.philosophyText}>
              <p><strong>VARONA does not understand darkness as a comfort zone.</strong></p>
              <p>In a world where monochrome often promises safety, it becomes a space of tension. Not as retreat. Not as protection.</p>
              <p>But as a stage for contrast, colour, and controlled intensity. Architectural lines shape the body like space. Colour interrupts expectation. Silhouettes carry presence.</p>
              <p className={styles.highlightText}>VARONA is not a symbol. It is a decision. A darkness that does not hide — but defines.</p>
            </div>
          </div>
          <div className={styles.rightGridColumn}>
            <img src={Logo} alt="VARONA Architectural Logo" className={styles.embeddedLogo} />
          </div>
        </div>
      </section> */}

      {/* SECTION 4: SUSTAINABILITY IN DESIGN */}
      {/* <section className={styles.editorialSection}>
        <div className={styles.sustainabilityGrid}>
          <div className={styles.imageBlock}>
            <img src={Tum} alt="Sustainable materials" className={styles.editorialImage} />
          </div>
          <div className={styles.textBlock}>
            <span className={styles.sectionMeta}>03 / MODERN ETHICS</span>
            <h2 className={styles.sectionTitle}>Sustainability</h2>
            <p className={styles.leadParagraph}>
              The production process follows a low-waste strategy with digital prototyping, zero-waste pattern development, and precision small-batch manufacturing.
            </p>
            <div className={styles.materialsList}>
              <div className={styles.materialItem}><strong>Recycled wool & blend yarns</strong> — reducing textile waste.</div>
              <div className={styles.materialItem}><strong>Recycled polyester (rPET)</strong> — post-consumer plastic fibers.</div>
              <div className={styles.materialItem}><strong>Organic cotton</strong> — grown without harmful pesticides.</div>
              <div className={styles.materialItem}><strong>Regenerated cellulose</strong> — next-generation sustainable fiber.</div>
              <div className={styles.materialItem}><strong>Deadstock fabrics</strong> — certified surplus European textiles.</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* SECTION 5: TIMELINE */}
      {/* <section className={styles.timelineSection}>
        <div className={styles.timelineContainer}>
          <span className={styles.sectionMeta}>04 / CHRONOLOGY</span>
          <h2 className={styles.sectionTitle}>Professional Background</h2>
          
          <div className={styles.timelineRows}>
            <div className={styles.timelineRow}>
              <span className={styles.year}>2019</span>
              <span className={styles.event}>Independent Runway SHOW — Kyiv Fashion Week</span>
            </div>
            <div className={styles.timelineRow}>
              <span className={styles.year}>2018</span>
              <span className={styles.event}>Presentations — OZON Showroom, Paris & Milan Fashion Weeks</span>
            </div>
            <div className={styles.timelineRow}>
              <span className={styles.year}>2016–2017</span>
              <span className={styles.event}>Illustration — NABA, Nuova Accademia di Belle Arti, Milan</span>
            </div>
            <div className={styles.timelineRow}>
              <span className={styles.year}>2011–2012</span>
              <span className={styles.event}>Fashion Design — Istituto Marangoni, Milan</span>
            </div>
            <div className={styles.timelineRow}>
              <span className={styles.year}>2005–2010</span>
              <span className={styles.event}>Tailoring, Garment Construction & Pattern-Making Directrice</span>
            </div>
          </div>
        </div>
      </section> */}
      <Footer></Footer>
    </div>
  );
};

export default Home;