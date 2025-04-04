import { useState, useEffect } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedVideo } from '@cloudinary/react';
import styles from "./Reviews.module.css";
import Review from '../../components/Review';
import SubmitModal from '../../components/SubmitModal';
import { FaStar } from 'react-icons/fa';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_URL_PROD
      : import.meta.env.VITE_API_URL_LOCAL
  };

  const apiUrl = getApiUrl();
  const LIMIT = 6; // Number of reviews per page

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async (pageNum = 1, append = false) => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`${apiUrl}?page=${pageNum}&limit=${LIMIT}`);
      if (!response.ok) throw new Error("Failed to fetch reviews.");
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        if (append) {
          setReviews(prev => [...prev, ...data]);
        } else {
          setReviews(data);
        }
        setHasMore(data.length >= LIMIT);
      } else if (data.reviews) {
        if (append) {
          setReviews(prev => [...prev, ...data.reviews]);
        } else {
          setReviews(data.reviews);
        }
        setHasMore(data.pagination?.hasMore || false);
      }
      
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    await fetchReviews(nextPage, true);
  };

  const handleNewReview = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  const cld = new Cloudinary({
    cloud: { cloudName: 'dwenvtwyx' },
  });

  const video = cld.video('Podium_be5hn5');

  const logo = cld.image('fashion-network-logo_apwgif');
  logo.format('webp').quality(80);

  const imagePublicIds = [
    'green_cev8bm', 'capotto_iaam9k', 'pantaloni_loyblc', 
    'impermiabile_agbvg3', 'abito_h4xf2u'
  ];

  const handleImageLoad = () => setLoadingImages(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const LoadingSpinner = () => (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p>Loading reviews...</p>
    </div>
  );

  return (
    <div>
      <div className={styles.videoContainer}>
        <AdvancedVideo cldVid={video} loop autoPlay muted controls={false} />
      </div>

      <a href="https://de.fashionnetwork.com/fotogalerien/photos/Varona-by-Nataliya-Rodionova,33328.html" target="_blank" rel="noopener noreferrer">
        <img className={styles.fashionNetwork} src={logo.toURL()} alt="Fashion Podium" />
      </a>

      <div className={styles.imageGallery}>
        {loadingImages && <div className={styles.loader}>Loading images...</div>}
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
        {error && <div className={styles.error}>{error}</div>}
        
        {loadingReviews && page === 1 ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className={styles.reviewsList}>
              {reviews.length === 0 ? (
                <p className={styles.noReviews}>No reviews yet. Be the first to leave a review!</p>
              ) : (
                reviews.map((review) => (
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
                ))
              )}
            </div>
            
            {hasMore && (
              <div className={styles.loadMoreButtonContainer}>
                <button 
                  onClick={loadMore} 
                  className={styles.loadMoreButton}
                  disabled={loadingReviews}
                >
                  {loadingReviews && page > 1 ? (
                    <>
                      <span className={styles.loadingDot}></span>
                      <span className={styles.loadingDot}></span>
                      <span className={styles.loadingDot}></span>
                    </>
                  ) : (
                    'Load More Reviews'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <div className={styles.overlay}>
        {isModalOpen && <SubmitModal onClose={handleCloseModal} />}
        <Review onSubmit={handleOpenModal} setReviews={handleNewReview} setError={setError} />
      </div>
    </div>
  );
};

export default Reviews;