import React, { useState, useEffect } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedVideo } from "@cloudinary/react";
import styles from "./Reviews.module.css";
import Review from "../../components/Review";
import SubmitModal from "../../components/SubmitModal";
import { FaStar } from "react-icons/fa";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl =
          window.location.hostname === "localhost"
            ? "http://localhost:4000/api/reviews"
            : "https://www.nataliyarodionova.com/api/reviews";

        const response = await fetch(apiUrl); // Use apiUrl instead of hardcoded URL
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        setError("Error loading reviews. Please try again later.");
      }
    };

    fetchReviews();
  }, []);

  const cld = new Cloudinary({
    cloud: { cloudName: "dwenvtwyx" },
  });

  const video = cld.video("Podium_be5hn5");
  const logo = cld.image("fashion-network-logo_apwgif").format("webp").quality(80);

  const imagePublicIds = [
    "green_cev8bm",
    "capotto_iaam9k",
    "pantaloni_loyblc",
    "impermiabile_agbvg3",
    "abito_h4xf2u",
  ];

  const handleImageLoad = () => setLoadingImages(false);

  const handleModalOpen = () => setIsModalOpen(true); // Open Modal logic

  return (
    <div>
      <div className={styles.videoContainer}>
        <AdvancedVideo cldVid={video} loop autoPlay muted controls={false} />
      </div>

      <a
        href="https://de.fashionnetwork.com/fotogalerien/photos/Varona-by-Nataliya-Rodionova,33328.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img className={styles.fashionNetwork} src={logo.toURL()} alt="Fashion Podium" />
      </a>

      <div className={styles.imageGallery}>
        {loadingImages && <div className={styles.loader}>Loading images...</div>}
        {imagePublicIds.map((imageId) => {
          const image = cld.image(imageId).format("webp").quality(80);
          return (
            <div className={styles.imageContainer} key={imageId}>
              <img
                src={image.toURL()}
                alt={`Cloudinary Image ${imageId}`}
                className={styles.fullScreenImage}
                onLoad={handleImageLoad}
              />
            </div>
          );
        })}
      </div>

      <section className={styles.review}>
        <h1 style={{ color: "black" }}>Reviews:</h1>
        {error && <div style={{ color: "red" }}>{error}</div>}

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
              {review.image && (
                <img src={review.image} alt="Review" className={styles.reviewImg} />
              )}
              <p className={styles.reviewMessage}>{review.message}</p>
              <span className={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.overlay}>
        {isModalOpen && <SubmitModal onClose={() => setIsModalOpen(false)} />}
        <Review setReviews={setReviews} setError={setError} />
        <button className={styles.openModalButton} onClick={handleModalOpen}>
          Submit a Review
        </button>
      </div>
    </div>
  );
};

export default Reviews;
