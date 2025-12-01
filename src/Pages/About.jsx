import React from 'react';
import { Helmet } from 'react-helmet-async'; // ⬅️ NEW: Import Helmet for SEO
import styles from './About.module.css';
import Logo from '../assets/LOGO.png'; // локальный логотип
import Tum from '../assets/Tum2.jpg';
import NR from '../assets/NR.jpg';

const About = () => {
    return (
        <>
            {/* ======================= */}
            {/*       SEO & META TAGS     */}
            {/* ======================= */}
            <Helmet>
                <title>Nataliya Rodionova | Sustainable Luxury & Artistic Authorship</title>
                <meta 
                    name="description" 
                    content="The Nataliya Rodionova brand creates garment-manifestos for global style collectors, fusing eternal craftsmanship (wool masterpieces) with innovative ethics (reclaimed ocean elements). Founder & Creative Director: Nataliya Rodionova. Global Luxury & Conscious Design." 
                />
                <meta 
                    name="keywords" 
                    content="Sustainable Fashion, Luxury Design, Nataliya Rodionova, Wool Masterpieces, Recycled Ocean Plastic, Artistic Fashion, Ethical Luxury, BFW 2027" 
                />
                <meta property="og:title" content="Nataliya Rodionova | Sustainable Luxury & Artistic Authorship" />
                {/* Add og:image, og:url, etc., here for social media previews */}
            </Helmet>

            <div className={styles.aboutContainer}>

                {/* ======================= */}
                {/*       BRAND LOGO        */}
                {/* ======================= */}
                <header className={styles.logoHeader}>
                    <img
                        src={Logo}
                        alt="Nataliya Rodionova Brand Logo"
                        className={styles.logo}
                    />
                </header>

                {/* ======================= */}
                {/*        HERO BLOCK       */}
                {/* ======================= */}
                <section className={styles.hero}>
                     <img
                        src={NR}
                        alt="Nataliya Rodionova"
                        className={styles.logo1}
                    />
                    <div className={styles.heroText}>
                        <h1 className={styles.heroTitle}>True Style as Authorship</h1>
                        
                        {/* ⬅️ NEW: FOUNDER & CREATIVE DIRECTOR INFO */}
                        {/* <p className={styles.designerInfo}>
                            Nataliya Rodionova | Founder & Creative Director
                        </p> */}

                        <blockquote className={styles.quote}>
                            <em>
                                “For me, fashion and storytelling coexist as refined forms of expression—
                                revealing what cannot be spoken, without noise, flirtation, or superficiality.
                                
                                I create for individuals who treat fashion as an intellectual domain,
                                not a stage for attention. My work stands firmly in craftsmanship, focus,
                                and intention—unaffected by distraction or the trivial
                                games of the everyday world.
                                
                                I do not work with imitation or requests to mirror someone else’s identity.
                                True style is self-authored, and I collaborate only with those who seek to shape
                                their own identity with honesty, originality, and intention.
                                
                                And most importantly—
                                I work with people who value time: their own, mine, and the shared journey that unfolds in the creative process.
                                Those who commit to progress, who enter the work with respect,
                                and who understand that transformation requires presence, patience,
                                and a willingness to walk the path, not rush through it.”
                            </em>
                        </blockquote>
                    </div>
                </section>

                {/* ======================= */}
                {/*  BRAND + VISION + BIO   */}
                {/* ======================= */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>About the Brand & Vision</h2>

                    <p className={styles.paragraph}>
                       Nataliya Rodionova founded her eponymous brand on the belief that true style is a form of authorship. Every creation begins as an artistic intuition — a spark that chooses its own direction, living both in garments and in the narratives we explore: truth, identity, and the emotional depth behind appearances.
                    </p>

                    <p className={styles.paragraph}>
                       We design for those who see fashion as an intellectual game: a space where identity is shaped, challenged, and revealed. Our work balances the purity of craftsmanship with the courage of creative risk, honoring individuality and celebrating each unique moment.
                    </p>
                    
                    {/* Simplified biography paragraph */}
                    <p className={styles.paragraph}>
                        Nataliya graduated from Istituto Marangoni in Milan (2011–2012) and continued her education at NABA in Milan. Following internships at companies such as Dolce & Gabbana and Marni, she gained practical insight into the Milan fashion industry. The brand later presented collections at the OZONE showroom during both Paris and Milan Fashion Weeks, debuting with its first runway show at Kyiv Fashion Week in 2019.
                    </p>

                    <h2 className={styles.sectionTitle}>SUSTAINABILITY</h2> {/* Corrected potential typo sectionTitle1 */}

                    <p className={styles.paragraph}> {/* Corrected potential typo paragraph1 */}
                        Guided by a responsible approach to modern luxury, we explore refined natural fibers,
                        advanced sustainable textiles, and innovative conscious materials. Sustainability is not a trend, but a thoughtful artistic discipline: creating beauty with intention, clarity, and awareness.
                    </p>

                    <img
                        src={Tum}
                        alt="Sustainable material and design philosophy"
                        className={styles.sustainiblity}
                    />
                </section>

                {/* ======================= */}
                {/* EDUCATION & PROFESSIONAL EXPERIENCE */}
                {/* ======================= */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Timeline & Professional Background</h2>

                    <ul className={styles.list}>
                        <li><span className={styles.timelineYear}>2005–2008</span> Tailoring & Garment Construction — VPTU 38, Zaporizhzhya</li>
                        <li><span className={styles.timelineYear}>2008–2009</span> Pattern-Making / Pattern Directrice — Advanced Construction, Fit & Grading</li>
                        <li><span className={styles.timelineYear}>2005–2010</span> Bachelor’s Degree in Management & Administration — ZNTU University</li>
                        <li><span className={styles.timelineYear}>2011–2012</span> Fashion Design — Istituto Marangoni, Milan</li>
                        <li><span className={styles.timelineYear}>2016–2017</span> Illustration — NABA, Nuova Accademia di Belle Arti, Milan</li>
                        <li><span className={styles.timelineYear}>2018</span> Presentation — OZON Showroom, Paris Fashion Week</li>
                        <li><span className={styles.timelineYear}>2018</span> Presentation — OZON Showroom, Milan Fashion Week</li>
                        <li><span className={styles.timelineYear}>2019</span> Independent Runway SHOW — Kyiv Fashion Week</li>
                    </ul>

                </section>

                {/* ======================= */}
                {/*       GSX READY FOOTER   */}
                {/* ======================= */}
                <footer className={styles.footer}>
                    {/* Add contact info, copyright, or navigation links here */}
                    <p>&copy; {new Date().getFullYear()} Nataliya Rodionova. All Rights Reserved.</p>
                </footer>

            </div>
        </>
    );
};

export default About;