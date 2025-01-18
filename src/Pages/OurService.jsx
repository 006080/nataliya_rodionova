import { useState } from 'react'
import { Cloudinary } from '@cloudinary/url-gen'
import { AdvancedImage } from '@cloudinary/react'
import { auto } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'
import styles from './OurService.module.css'
import { position } from '@cloudinary/url-gen/qualifiers/timeline'
import { width } from '@fortawesome/free-solid-svg-icons/fa0'

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
            '66130675_2309445942483047_864015165027254272_n_5_bmvvjh'
          )
        }
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage(
            '66130675_2309445942483047_864015165027254272_n_5_bmvvjh'
          )}
          alt="Viola"
        />
      </section>

      <section className={styles.sectionStyle}>
        <div className={styles.textContainer}>
          <h1>Our Style:</h1>
          <p>
            Welcome to VARONA, where elegance meets poetry in the realm of
            Fashion. Inspired by the graceful allure of crows, our brand crafts
            sophisticated wardrobe essentials and accessories for both men and
            women from the finest Italian wool and cashmere. In shades of grey,
            white, and black, VARONA embodies a captivating amalgamation of
            refinement and lyrical resonance. Explore our collection and embrace
            the timeless charm that defines VARONA - where every piece tells a
            story, and style becomes a poetic manifestation of uniqueness.
          </p>
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
          <h1 style={{ color: 'black' }}>Our Mission:</h1>
          <p>
            Our mission is more than just creating handmade knitwear.
            Recognizing the uniqueness of each client, our approach is far from
            one-size-fits-all. We take the time to understand, adapt, and create
            bespoke pieces that resonate with your individual style. We set the
            highest standards, ensuring every piece is a testament to quality,
            personalized service, and guarantees of satisfaction. Your trust is
            our most cherished possession. Beyond transactions, Varona is a
            haven of care and warmth. We build relationships, providing
            personalized attention to ensure you feel embraced throughout your
            journey with us.
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
            We are committed to using only the finest materials to create our
            designs. Our fabrics are sourced exclusively from highly regarded
            suppliers in Italy, known worldwide for their superior quality and
            craftsmanship. Each piece is crafted with luxurious materials such
            as wool, silk, and cashmere, ensuring unparalleled comfort,
            durability, and elegance. By choosing these premium textiles, we aim
            to deliver timeless creations that reflect our dedication to
            excellence and sophistication.
          </p>
        </div>
      </section>

      <section
        className={styles.imageContainer}
        onClick={() => openImageModal('sommer_xjiitv')}
      >
        <AdvancedImage
          className={styles.fullWidthImage}
          cldImg={getImage('sommer_xjiitv')}
          alt="Sommer"
        />
      </section>

      <section className={styles.sectionService}>
        <div className={styles.textContainer}>
          <h1>Our Concept:</h1>
          <p>
            Varona is more than a brand; it’s an embodiment of elegance, a
            fusion of mystery, and a celebration of timeless shades like black,
            grey, and beige. Founded by Nataliya Rodionova, Varona originated
            from the creative depths cultivated during her education at a
            sartorial school in Ukraine and Istituto Marangoni in Milan. Each
            piece tells a story of artistry and refinement, where every stitch
            and silhouette reflects a harmonious blend of tradition and
            innovation. Varona is a tribute to the beauty of contrasts—where
            simplicity meets sophistication, and individuality finds its perfect
            expression.
          </p>
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
            tailored for both men and women. Using only premium natural
            materials, we craft each piece with care and precision, ensuring it
            reflects the individuality of its wearer. Whether it’s a bespoke
            garment or a custom accessory, we’re here to turn your boldest
            visions into reality. At the heart of our service is a commitment to
            excellence and personal connection, where every creation is a
            masterpiece designed to inspire confidence, elegance, and timeless
            style.
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
            At the heart of our brand is a commitment to fostering creativity
            through collaboration. We work closely with some of the most
            sought-after photographers, stylists, makeup artists, hairdressers,
            models, and modeling agencies to bring bold visions to life. Our
            service extends beyond fashion design — we offer clients the
            opportunity to organize professional photo shoots, providing
            expertise and access to top-tier creative talent. Whether you’re
            looking to rent exclusive clothing for a project or realize your
            most daring ideas, we are here to help you craft unforgettable
            moments and capture them in stunning detail.
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
            Our clients are bold, creative, and expressive individuals who see
            fashion as a medium for storytelling and self-expression. They span
            a wide age range from 20 to 100+, embracing diversity in gender and
            life experiences, with a shared passion for originality and
            innovation. Artists are drawn to our visually striking and
            conceptually rich designs. Creators seek avant-garde, experimental
            styles that align with their boundary-pushing mindsets. Performers,
            including actors and musicians, value our pieces as essential
            elements of their public personas. Lastly, fashion-forward
            individuals, always ahead of trends, invest in our unique,
            high-quality wardrobe staples that embody individuality. Globally
            connected, they are united by their appreciation for niche,
            unconventional fashion.
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