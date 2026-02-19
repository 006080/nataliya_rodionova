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
          <div className={styles.listOff}>

            <br />
            <br />
            <p>
              VARONA does not treat darkness as a comfort zone.
              <p>  In a world where monochrome often promises safety,
                it becomes a space of tension, contrast, and presence.
                <br />
                <p>Controlled surreal elegance defines the aesthetic —
                  an avant-garde approach guided by structure and restraint.</p>
              </p>
           This is not darkness in its classical sense.
           <br />
VARONA explores darkness through form and concept,
not through colour alone.
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
            Because fashion is not neutral.
            <br />
            VARONA combines conceptual design with responsible production —
            not as a strategy, but as a structural decision.
            <br />
            Every piece is developed with intention, transparency,
            and respect for material, process, and form.
            <br />
            VARONA is chosen by those who seek clarity, presence,
            and meaning beyond trend or convenience.
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
            We use a carefully curated selection of recycled and low-impact materials.
            <br /> Our goal is to combine high quality with minimal environmental impact:
          </p>
          <div className={styles.listOff} >
            <p>VARONA works with a curated selection of recycled and low-impact materials, chosen for quality, durability, and responsible impact.
              <br /> Material is treated as structure — not excess.</p>
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

          <p>
            VARONA approaches fashion as a spatial and conceptual practice.

            Each piece is developed through architectural thinking, where form, proportion, and tension define the silhouette. Colour is introduced deliberately — not as decoration, but as a counterpoint to structure.

            The collections exist between art and wearability, allowing garments to function both as visual statements and personal extensions of identity.

            VARONA rejects uniformity and comfort-driven design in favour of controlled deviation — where every decision is intentional and nothing is neutral.
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
            VARONA designs and produces bespoke garments and limited pieces
            for individuals who approach fashion as expression.
            <br />
            Each creation is developed with architectural precision
            and adapted to the wearer, allowing form, colour, and presence
            to unfold individually.
            <br />
            This is not customization for comfort —
            but design as a conscious choice.
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
            VARONA approaches collaboration as a conscious choice.
            <br />
            We seek partnerships with organizations and initiatives that share a commitment to responsible production, transparency, and material innovation — not as a trend, but as a structural decision.
            <br />
            As the brand evolves, we work towards building a network of carefully selected partners within the EU, focusing on certified materials, small-scale production, and innovative textile solutions that align with our values.
            <br />
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
            Our clients do not follow fashion — they articulate themselves through it.
            <br />
            They are individuals for whom clothing is not decoration,
            but language.
            <br />
            Artists, creators, performers, and cultural figures choose VARONA
            as part of their visual identity — not to blend in,
            but to define presence.
            <br />
            They value conceptual depth, architectural form,
            and garments that carry intention rather than trend.
            <br />
            VARONA speaks to those who recognize meaning in deviation
            and see style as a conscious decision.
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