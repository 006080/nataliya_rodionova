import { useState } from 'react'
import { Cloudinary } from '@cloudinary/url-gen'
import { AdvancedImage } from '@cloudinary/react'
import { auto } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'
import styles from './OurService.module.css'
// import { position } from '@cloudinary/url-gen/qualifiers/timeline'
// import { width } from '@fortawesome/free-solid-svg-icons/fa0'

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dwenvtwyx',
  },
})

const OurService = () => {
  const [selectedImage, setSelectedImage] = useState(null)

  const getImage = (imageId) =>
    cld
      .image(imageId)
      .format('auto')
      .quality('auto')
      .resize(auto().gravity(autoGravity()))

  const getFullSizeUrl = (imageId) =>
    `https://res.cloudinary.com/dwenvtwyx/image/upload/${imageId}.jpg`

  const openImageModal = (imageId) => {
    setSelectedImage(getFullSizeUrl(imageId))
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  return (
    <div className={styles.ordnung}>
      <section
        className={styles.imageContainer}
        onClick={() =>
          openImageModal(
            '66130675_2309445942483047_864015165027254272_n_5_cusrfy'
          )
        }
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage(
            '66130675_2309445942483047_864015165027254272_n_5_cusrfy'
          )}
          alt="Viola"
        />
      </section>

      <section className={styles.sectionStyle}>
        <div className={styles.textContainer}>
          <h1>Brand Manifest :</h1>

          <br />
          <div className= {styles.listOff}>
          <p>
            VARONA is more than a brand.
          </p>

          <br />
          <br />
          <p>
            VARONA does not treat darkness as a comfort zone.
            <p>  In a world where monochrome often promises safety,
            it becomes a space of tension, contrast, and presence.
            
            </p>
          Architectural lines, controlled colour, deliberate deviation —
            fashion shaped as intention, not protection.
          </p>
          </div>
        </div>
      </section>

      <section
        className={styles.imageContainer}
        onClick={() => openImageModal('TEST-Steve-Muliett0867_B-1_fnxrq7')}
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage('TEST-Steve-Muliett0867_B-1_fnxrq7')}
          alt="Woolen"
        />
      </section>

      <section className={styles.sectionMission}>
        <div className={styles.textContainer}>
          <h1 style={{ color: 'black' }}>Why Choose Us?</h1>
          <p>
            We combine creative fashion expertise with sustainability strategy
          </p>

          <p>
            Our services are tailored to the Berlin ecosystem and impact funding programs

          </p>

          <p>
            We support you from concept to launch — ethically, transparently and with measurable results
          </p>
        </div>
      </section>

      <section
        className={styles.imageContainer}
        onClick={() =>
          openImageModal('Screenshot_from_2024-02-05_16-30-14_1_kzdw21')
        }
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage('Screenshot_from_2024-02-05_16-30-14_1_kzdw21')}
          alt="Couple"
        />
      </section>

      <section className={styles.sectionMaterials}>
        <div className={styles.textContainer}>
          <h1>Materials:</h1>
          <p>
            We use a carefully curated selection of recycled and low-impact materials. Our goal is to combine high quality with minimal environmental impact:
          </p>
          <div className={styles.listOff} >
            <p>✔ Recycled wool and wool-blend yarns</p>
            <p>✔ Hemp blends</p>
            <p>✔ Bio-polyester (plant-based)</p>
            <p>✔ Organic cotton</p>
            <p>✔ Regenerated cellulose</p>
            <p>✔ Recycled polyester (rPET)</p>
            <p>✔ Deadstock fabrics</p>
          </div>
        </div>
      </section>

      <section
        className={styles.imageContainer}
        onClick={() => openImageModal('sommer_xjiitv_qnoi0v')}
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage('sommer_xjiitv_qnoi0v')}
          alt="Sommer"
        />
      </section>

      <section className={styles.sectionService}>
        <div className={styles.textContainer}>
          <h1>Our Concept:</h1>
          <div>
          <p>
            Varona is more than a brand.
          </p>
          <p>
            VARONA does not treat darkness as a comfort zone.
          </p>
          <p>
            In a world where monochrome often promises safety,
            it becomes a space of tension, contrast, and presence.
          </p>

          <p>
            Architectural lines, controlled colour, deliberate deviation —
            fashion shaped as intention, not protection.
          </p>
          </div>
        </div>
      </section>

      <section
        className={styles.miaLogoContainer}
        onClick={() => openImageModal('IMG_2624_qepkei')}
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage('IMG_2624_qepkei')}
          alt="Miale Journal"
        />
        <AdvancedImage
          style={{
            width: '350px',
            height: 'auto',
            cursor: 'pointer',
          }}
          className={styles.miaLogo}
          cldImg={getImage('MIALEJOURNAL_BLACK_rwcikd')}
          alt="MiaJournal Logo"
        />
      </section>

      <section
        style={{ backgroundColor: 'beige' }}
        className={styles.sectionService}
      >
        <div className={styles.textContainer}>
          <h1 style={{ color: 'black' }}>Our Service:</h1>
          <p style={{ color: 'black' }}>
            We specialize in creating exclusive, handmade items and accessories
            tailored for both men and women. We craft each piece with care and precision, ensuring it
            reflects the individuality of its wearer. Whether it’s a bespoke
            garment or a custom accessory, we’re here to turn your boldest
            visions into reality.
          </p>
        </div>
      </section>

      <section
        className={styles.imageContainer}
        onClick={() => openImageModal('revista-YBLx2HXM_ji0z8f')}
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage('revista-YBLx2HXM_ji0z8f')}
        />
      </section>

      <section
        style={{ backgroundColor: '#00402b' }}
        className={styles.sectionCustomers}
      >
        <div className={styles.textContainer}>
          <h1>Collaboration:</h1>
          <p>
            We are open to collaborating with NGOs, industry associations, and organizations that promote ethical production, circular solutions, and transparent supply-chain practices. As we grow, we aim to build partnerships with certified material suppliers and textile innovation platforms that provide access to recycled, low-impact, and plant-based fabrics suitable for small-scale production.

            Our goal is to develop a network of responsible partners within the EU, strengthening the environmental and social foundation of the brand and contributing to a more forward-thinking approach to fashion.
          </p>
        </div>
      </section>

      <section
        className={styles.imageContainer}
        onClick={() => openImageModal('undrogin_x7ql7r')}
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage('undrogin_x7ql7r')}
        />
      </section>

      <section
        style={{ backgroundColor: 'black' }}
        className={styles.sectionCustomers}
      >
        <div className={styles.textContainer}>
          <h1 style={{ color: 'beige' }}>Our Clients:</h1>
          <p style={{ color: 'beige' }}>
            Our clients are bold, creative, and expressive individuals who view fashion as a medium for storytelling and self-expression. They span a wide age range — from 18 to 65 + — and embrace diversity in gender, background, and life experience, united by a shared passion for originality and innovation.

            Artists are drawn to our visually striking and conceptually rich designs. Creators seek avant-garde, experimental pieces that align with their boundary-pushing mindset. Creative professionals value our garments as essential elements of their public persona. And fashion-forward individuals — always ahead of the curve — invest in our unique, high-quality wardrobe staples that embody individuality.

          </p>
        </div>
      </section>

      <section
        className={styles.imageContainer}
        onClick={() => openImageModal('image_6487327_hr1zra')}
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage('image_6487327_hr1zra')}
          alt="Bissiol"
        />
      </section>

      {selectedImage && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={closeModal}>
              X
            </button>
            <img
              src={selectedImage}
              alt="Full-size view"
              className={styles.fullSizeImage}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default OurService