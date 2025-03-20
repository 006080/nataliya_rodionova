import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedVideo } from '@cloudinary/react';
import { useState, useEffect } from 'react';
import styles from "./Reviews.module.css";
import Review from '../../components/Review';
import SubmitModal from '../../components/SubmitModal';
import { FaStar } from 'react-icons/fa';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch reviews from MongoDB
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/reviews'); // Adjust API URL if needed
        if (!response.ok) throw new Error("Failed to fetch reviews.");

        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews.");
      }
    };

    fetchReviews();
  }, []);

  // Initialize Cloudinary instance
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'dwenvtwyx',
    },
  });

  // Fetch the video by its public ID
  const video = cld.video('Podium_be5hn5');

  const logo = cld.image('fashion-network-logo_apwgif');
  logo.format('webp').quality(80);

  const imagePublicIds = [
    'green_cev8bm',
    'capotto_iaam9k',
    'pantaloni_loyblc',
    'impermiabile_agbvg3',
    'abito_h4xf2u'
  ];

  // Function to handle image load completion
  const handleImageLoad = () => {
    setLoadingImages(false);
  };

  return (
    <div>
      <div className={styles.videoContainer}>
        <AdvancedVideo cldVid={video} loop autoPlay muted controls={false} />
      </div>

      <a href="https://de.fashionnetwork.com/fotogalerien/photos/Varona-by-Nataliya-Rodionova,33328.html" target="_blank" rel="noopener noreferrer">
        <img
          className={styles.fashionNetwork}
          src={logo.toURL()}
          alt="Fashion Podium"
        />
      </a>

      <div className={styles.imageGallery}>
        {loadingImages && (
          <div className={styles.loader}>Loading images...</div>
        )}
        {imagePublicIds.map((imageId, index) => {
          const image = cld.image(imageId);
          image.format('webp').quality(80);
          return (
            <div className={styles.imageContainer} key={index}>
              <img 
                src={image.toURL()} 
                alt={`Cloudinary Image ${index}`} 
                className={styles.fullScreenImage} 
                onLoad={handleImageLoad} 
              />
            </div>
          );
        })}
      </div>

      <section className={styles.review}>
        <h1 style={{ color: 'black' }}>Reviews:</h1>
        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div key={review._id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewerName}>{review.name}</span>
                <div className={styles.reviewStars}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} color={i < review.rating ? "#ffc107" : "#e4e5e9"} size={20} />
                  ))}
                </div>
              </div>
              {review.image && <img src={review.image} alt="Review" className={styles.reviewImg} />}
              <p className={styles.reviewMessage}>{review.message}</p>
              <span className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.overlay}>
        {isModalOpen && <SubmitModal onClose={() => setIsModalOpen(false)} />}
        <Review onSubmit={() => setIsModalOpen(true)} setReviews={setReviews} />
      </div>
    </div>
  );
};

export default Reviews;
