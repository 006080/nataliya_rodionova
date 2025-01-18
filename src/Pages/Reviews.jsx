import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedVideo } from '@cloudinary/react';
import { useState } from 'react';
import styles from "./Reviews.module.css";
import Review from '../../components/Review';
import SubmitModal from '../../components/SubmitModal';
import { FaStar } from 'react-icons/fa';

const Reviews = () => {
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);


  // Initialize Cloudinary instance with your cloudName
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'dwenvtwyx',
    },
  });

  // Fetch the video by its public ID
  const video = cld.video('Podium_be5hn5');

  const logo = cld.image('fashion-network-logo_apwgif');
logo.format('webp').quality(80); // Optional settings for format and quality

  // List of image public IDs from Cloudinary (use your own image public IDs here)
  const imagePublicIds = [ // Replace with your image public ID from Cloudinary
    'green_cev8bm',
    'capotto_iaam9k', // Replace with your image public ID from Cloudinary
    'pantaloni_loyblc', // Replace with your image public ID from Cloudinary
    'impermiabile_agbvg3', // Replace with your image public ID from Cloudinary
    'abito_h4xf2u'
  ];

  // State to manage the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Video Element */}
      <div className={styles.videoContainer}>
        <AdvancedVideo cldVid={video} loop autoPlay muted controls={false} />
      </div>

      <a
        href="https://de.fashionnetwork.com/fotogalerien/photos/Varona-by-Nataliya-Rodionova,33328.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className={styles.fashionNetwork}
          src={logo.toURL("https://res.cloudinary.com/dwenvtwyx/image/upload/v1731777892/fashion-network-logo_apwgif.webp")} // Dynamically generated URL from Cloudinary
          alt="Fashion Podium"
        />
      </a>

      {/* Cloudinary Image Section */}
      <div className={styles.imageGallery}>
        {imagePublicIds.map((imageId, index) => {
          const image = cld.image(imageId); // Create a Cloudinary image object using the public ID
          image.format('webp').quality(80); // Customize the image settings (optional)
          return (
            <div className={styles.imageContainer} key={index}>
              <img
                src={image.toURL()} // Get the URL for the image
                alt={`Cloudinary Image ${index}`}
                className={styles.fullScreenImage}
              />
            </div>
            
          );
        })}
      </div>
      <section className={styles.review}>
        <h1 style={{color:'black'}}>Reviews:</h1>
        {/* Reviews */}
        <div className={styles.reviewsList}>
        {error && <div className={styles.error}>{error}</div>}
        {reviews.map((review) => (
          <div key={review._id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <span className={styles.reviewerName}>{review.name}</span>
              <div className={styles.reviewStars}>
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    color={i < review.rating ? "#ffc107" : "#e4e5e9"}
                    size={20}
                  />
                ))}
              </div>
            </div>
            {review.image && (
              <img
                src={review.image}
                alt="Review"
                className={styles.reviewImg}
              />
            )}
            <p className={styles.reviewMessage}>{review.message}</p>
            <span className={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
      </section>
      {/* Overlay Section (Modal and Review) */}
      <div className={styles.overlay}>
        {/* SubmitModal will open only when handleOpenModal is called */}
        {isModalOpen && <SubmitModal onClose={handleCloseModal} />}
        {/* Pass handleOpenModal to Review so it opens the modal on form submission */}
        <Review 
          onSubmit={handleOpenModal} 
          setError={setError}
          setReviews={setReviews}
        />
      </div>
    </div>
  );
};

export default Reviews;
