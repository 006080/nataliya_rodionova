import React from 'react';
import styles from './About.module.css';
import Logo from '../assets/LOGO.png'; // локальный логотип
import ART from '../assets/art.jpg';
import Tum from '../assets/Tum2.jpg';

const About = () => {
    return (
        <div className={styles.aboutContainer}>

            {/* ======================= */}
            {/*       BRAND LOGO        */}
            {/* ======================= */}
            <header className={styles.logoHeader}>
                <img
                    src={Logo}
                    alt="Nataliya Rodionova Brand Logo"
                    className={styles.logo}
                />
            </header>

            {/* ======================= */}
            {/*        HERO BLOCK       */}
            {/* ======================= */}
            <section className={styles.hero}>
                {/* <div className={styles.heroImageWrapper}>
                    <img
                        src={ART}
                        alt="Nataliya Rodionova — Founder & Creative Director"
                        className={styles.heroImage}
                    />
                </div> */}

                <div className={styles.heroText}>
                    <h1 className={styles.heroTitle}>True Style as Authorship</h1>

                    <blockquote className={styles.quote}>
                        <em>
                            “For me, fashion and storytelling coexist as refined forms of expression—
                            revealing what cannot be spoken, without noise, flirtation, or superficiality.

                            I create for individuals who treat fashion as an intellectual domain,
                            not a stage for attention. My work stands firmly in craftsmanship, focus,
                            and intention—unaffected by distraction or the trivial
                            games of the everyday world.

                            I do not work with imitation or requests to mirror someone else’s identity. True style is self-authored, and I collaborate only with those who seek to shape their own identity with honesty, originality, and intention.”
                        </em>
                    </blockquote>
                </div>
            </section>

            {/* ======================= */}
            {/*  BRAND + VISION + BIO   */}
            {/* ======================= */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>About the Brand & Vision</h2>

                <p className={styles.paragraph}>
                    Nataliya Rodionova founded her eponymous brand on the belief that true style is a form of authorship.
                    Every creation begins as an artistic intuition — a spark that chooses its own direction,
                    living both in garments and in the narratives we explore: truth, identity, and the emotional depth behind appearances.
                </p>

                <p className={styles.paragraph}>
                    We design for those who see fashion as an intellectual game: a space where identity is shaped, challenged, and revealed.
                    Our work balances the purity of craftsmanship with the courage of creative risk,
                    honoring individuality and celebrating each unique moment.
                </p>

                <p className={styles.paragraph}>
                    Nataliya graduated from Istituto Marangoni in Milan (2011–2012), where she studied advanced design, construction, and pattern-making.
                    After Marangoni, she continued her education at NABA in Milan, completing a program in fashion illustration and refining her visual and conceptual practice.
                    Following her studies, Nataliya completed internships at companies such as Dolce & Gabbana, Marni, and others — gaining practical insight into Milan’s fashion industry and contemporary product processes.
                    In parallel, she developed her own collection, later presented at the OZONE showroom during both Paris and Milan Fashion Weeks.
                    In 2019, the brand debuted with its first runway show at Kyiv Fashion Week.
                </p>

                <h2 className={styles.sectionTitle1}>SUSTAINABILTY</h2>

                <p className={styles.paragraph1}>
                    Guided by a responsible approach to modern luxury, we explore refined natural fibers,
                    advanced sustainable textiles, and innovative conscious materials. Sustainability is not a trend,
                    but a thoughtful artistic discipline: creating beauty with intention, clarity, and awareness.
                </p>

                <img
                    src={Tum}
                    alt=""
                    className={styles.sustainiblity}
                />



            </section>

            {/* ======================= */}
            {/* EDUCATION & PROFESSIONAL EXPERIENCE */}
            {/* ======================= */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Education & Professional Background</h2>

                <ul className={styles.list}>
                    <li><span className={styles.timelineYear}>2005–2008</span> Tailoring & Garment Construction — VPTU 38, Zaporizhzhya</li>
                    <li><span className={styles.timelineYear}>2008–2009</span> Pattern-Making / Pattern Directrice — Advanced Construction, Fit & Grading</li>
                    <li><span className={styles.timelineYear}>2005–2010</span> Bachelor’s Degree in Management & Administration — ZNTU University</li>
                    <li><span className={styles.timelineYear}>2011–2012</span> Fashion Design — Istituto Marangoni, Milan</li>
                    <li><span className={styles.timelineYear}>2016–2017</span> Illustration — NABA, Nuova Accademia di Belle Arti, Milan</li>
                    <li><span className={styles.timelineYear}>2018</span> Presentation — OZON Showroom, Paris Fashion Week</li>
                    <li><span className={styles.timelineYear}>2018</span> Presentation — OZON Showroom, Milan Fashion Week</li>
                    <li><span className={styles.timelineYear}>2019</span> Independent Runway SHOW — Kyiv Fashion Week</li>
                    {/* <li><span className={styles.timelineYear}>2027</span> Upcoming sustainable capsule collection — Berlin Fashion Week</li> */}
                </ul>

            </section>

            {/* ======================= */}
            {/*       GSX READY FOOTER   */}
            {/* ======================= */}
            <footer className={styles.footer}>
                {/* Breadcrumbs, canonical URL, future product sections can be integrated here */}
            </footer>

        </div>
    );
};

export default About;
