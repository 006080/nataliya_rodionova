import PropTypes from 'prop-types';
import styles from "./Review.module.css";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import SubmitModal from "./SubmitModal";

const Review = ({ setReviews, setError, onSubmit }) => {
  const [reviewFields, setReviewFields] = useState({
    name: "",
    rating: 0,
    message: "",
    image: null,
    preview: null,
  });
  
  const [hover, setHover] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_URL_PROD
      : import.meta.env.VITE_API_URL_LOCAL
  };

  const apiUrl = getApiUrl()

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 800;
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const resizedImage = await resizeImage(file);
    setReviewFields((prev) => ({
      ...prev,
      image: resizedImage,
      preview: URL.createObjectURL(resizedImage),
    }));
  };

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setReviewFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (ratingValue) => {
    setReviewFields((prev) => ({ ...prev, rating: ratingValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { name, rating, message, image } = reviewFields;

    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!rating) {
      alert("Please provide a rating");
      return;
    }
    if (!message.trim()) {
      alert("Please write a review message");
      return;
    }
    if (!image) {
      alert("Please upload an image with your review");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("rating", rating);
      formData.append("message", message.trim());
      formData.append("image", image);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      // After successful submission, fetch updated reviews once
      const getReviewsResponse = await fetch(apiUrl);
      if (getReviewsResponse.ok) {
        const updatedReviews = await getReviewsResponse.json();
        setReviews(updatedReviews);
      }

      setReviewFields({ name: "", rating: 0, message: "", image: null, preview: null });
      setHover(null);
      setIsModalOpen(true);
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.reviewComponent}>
      <form onSubmit={handleSubmit} className={styles.reviewForm}>
        <h2>Leave a Review</h2>

        <label className={styles.imageUpload}>
          <span>Add Image</span>
          <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
          {reviewFields.preview && (
            <img
              src={reviewFields.preview}
              alt="Preview"
              className={styles.previewImg}
              onLoad={() => URL.revokeObjectURL(reviewFields.preview)}
            />
          )}
        </label>

        <div className={styles.starRating}>
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <label key={index}>
                <input type="radio" name="rating" value={ratingValue} onClick={() => handleRatingClick(ratingValue)} className={styles.radio} />
                <FaStar
                  className={styles.star}
                  color={ratingValue <= (hover || reviewFields.rating) ? "#ffc107" : "#e4e5e9"}
                  size={20}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(null)}
                />
              </label>
            );
          })}
        </div>

        <input type="text" name="name" placeholder="Your Name" value={reviewFields.name} onChange={handleOnChange} className={styles.input} required maxLength={100} />

        <textarea placeholder="Write your review..." name="message" value={reviewFields.message} onChange={handleOnChange} required className={styles.textArea} maxLength={1000}></textarea>

        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {isModalOpen && <SubmitModal onClose={() => setIsModalOpen(false)} message="Thank you for your review! It will be visible after moderation." />}
    </div>
  );
};

Review.propTypes = {
  setReviews: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  apiUrl: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
};

export default Review;