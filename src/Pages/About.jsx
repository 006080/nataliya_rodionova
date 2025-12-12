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
                    {/* <div className={styles.heroText}>
                        <h1 className={styles.heroTitle}>True Style as Authorship</h1>
                        
        
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
                    </div> */}
                </section>

                {/* ======================= */}
                {/*  BRAND + VISION + BIO   */}
                {/* ======================= */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>About the Brand & Vision</h2>

                    <p className={styles.paragraph}>
                       I founded my brand on the belief that true style is a form of authorship. Every creation begins as an artistic intuition — a spark that chooses its own direction, living both in garments and in the narratives we explore: truth, identity, and the emotional depth behind appearances.
                    </p>

                    <p className={styles.paragraph}>
                       I design for those who see fashion as an intellectual game: a space where identity is shaped, challenged, and revealed. My work balances the purity of craftsmanship with the courage of creative risk, honoring individuality and celebrating each unique moment.
                    </p>
                    
                    {/* Simplified biography paragraph */}
                    <p className={styles.paragraph}>
                        I graduated from Istituto Marangoni in Milan (2011–2012) and continued her education at NABA in Milan. Following internships at companies such as Dolce & Gabbana and Marni, I gained practical insight into the Milan fashion industry. The brand later presented collections at the OZONE showroom during both Paris and Milan Fashion Weeks, debuting with its first runway show at Kyiv Fashion Week in 2019.
                    </p>

                    <h2 className={styles.sectionTitle}>SUSTAINABILITY</h2> {/* Corrected potential typo sectionTitle1 */}

                  
<div className= {styles.paragraph}>
    <p>The production process follows a low-waste strategy with digital prototyping, zero-waste pattern development, and precision small-batch manufacturing. This innovative combination of craftsmanship and responsible sourcing ensures minimal textile waste, reduced environmental impact, and long-lasting garment quality.</p>
                    <p>I use a carefully curated selection of recycled and low-impact materials:</p>


<p><strong>Recycled wool and wool-blend yarns</strong> — reducing textile waste while maintaining warmth, durability, and texture.</p>
<p><strong>Recycled polyester (rPET)</strong> — fibers derived from post-consumer plastic, significantly lowering the reliance on virgin polyester.</p>
<p><strong>Organic cotton</strong> — certified cotton grown without pesticides or harmful chemicals.</p>
<p><strong>Regenerated cellulose</strong> — a next-generation cellulosic fiber from controlled sources, offering a more sustainable alternative to conventional viscose.</p>
<p><strong>Deadstock fabrics</strong> — surplus textiles sourced from certified European manufacturers, helping to reduce overproduction.</p>
<p><strong>Hemp blends</strong> — hemp combined with cotton or cellulosic fibers to create strong, breathable, long-lasting fabrics.</p>
<p><strong>Bio-polyester (plant-based</strong>) — bio-derived polyester made from sugar or corn feedstocks, with durability validated through modern material modelling.</p>

<p>My goal is to combine high quality with minimal environmental impact. Sustainability is not a trend, but a thoughtful artistic discipline: creating beauty with intention, clarity, and awareness.</p>
</div>


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
                        <li><p style={{fontSize:'1rem'}}><strong>2005–2008</strong>  Tailoring & Garment Construction — VPTU 38, Zaporizhzhya</p></li>
                        <li><p style={{fontSize:'1rem'}}><strong>2008–2009</strong> Pattern-Making / Pattern Directrice — Advanced Construction, Fit & Grading</p></li>
                        <li><p style={{fontSize:'1rem'}}><strong>2005–2010</strong> Bachelor’s Degree in Management & Administration — ZNTU University</p></li>
                        <li><p style={{fontSize:'1rem'}}><strong>2011–2012</strong> Fashion Design — Istituto Marangoni, Milan</p></li>
                        <li><p style={{fontSize:'1rem'}}><strong>2016–2017</strong> Illustration — NABA, Nuova Accademia di Belle Arti, Milan</p></li>
                        <li><p style={{fontSize:'1rem'}}><strong>2018</strong> Presentation — OZON Showroom, Paris Fashion Week</p></li>
                        <li><p style={{fontSize:'1rem'}}><strong>2018</strong> Presentation — OZON Showroom, Milan Fashion Week</p></li>
                        <li><p style={{fontSize:'1rem'}}><strong>2019</strong> Independent Runway SHOW — Kyiv Fashion Week</p></li>
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