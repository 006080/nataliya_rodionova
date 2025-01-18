import PropTypes from 'prop-types';
import styles from "./Review.module.css";
import { useState, useEffect, useCallback } from "react";
import { FaStar } from "react-icons/fa";
import SubmitModal from "./SubmitModal";

const Review = ({setReviews, setError}) => {
  const [reviewFields, setReviewFields] = useState({
    name: "",
    rating: 0,
    message: "",
    image: null,
  });

  const [hover, setHover] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getApiUrl = () => {
    const baseUrl = import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL_LOCAL
    return baseUrl
  };

  // Fetch existing reviews
  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl());
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setReviewFields(prev => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file), 
    }));
  };

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setReviewFields(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (ratingValue) => {
    setReviewFields(prev => ({
      ...prev,
      rating: ratingValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { name, rating, message } = reviewFields;

    if (!name.trim()) {
        alert('Please enter your name');
        return;
    }
    if (!rating) {
        alert('Please provide a rating');
        return;
    }
    if (!message.trim()) {
        alert('Please write a review message');
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
        const formData = new FormData();
          formData.append('name', reviewFields.name.trim());
          formData.append('rating', reviewFields.rating);
          formData.append('message', reviewFields.message.trim());
          if (reviewFields.image) {
              formData.append('image', reviewFields.image);
          }

        const response = await fetch(getApiUrl(), {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        const contentType = response.headers.get("content-type");
        let result;

        if (contentType && contentType.includes("application/json")) {
            result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit review');
            }
        } else {
            throw new Error('Invalid server response');
        }

        setReviewFields({
            name: "",
            rating: 0,
            message: "",
            image: null,
            preview: null
        });
        setHover(null);
        setIsModalOpen(true);

    } catch (error) {
        console.error('Submission error:', error);
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

        {/* Image Upload */}
        <label className={styles.imageUpload}>
          <span>Add Image (Optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
          {reviewFields.preview && (
            <img
              src={reviewFields.preview}
              alt="Preview"
              className={styles.previewImg}
              onLoad={() => URL.revokeObjectURL(reviewFields.preview)} 
            />
          )}
        </label>

        {/* Star Rating */}
        <div className={styles.starRating}>
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <label key={index}>
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() => handleRatingClick(ratingValue)}
                  className={styles.radio}
                />
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

        {/* Name Input */}
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={reviewFields.name}
          onChange={handleOnChange}
          className={styles.input}
          required
          maxLength={100}
        />

        {/* Review Message */}
        <textarea
          placeholder="Write your review..."
          name="message"
          value={reviewFields.message}
          onChange={handleOnChange}
          required
          className={styles.textArea}
          maxLength={1000}
        ></textarea>

        <button
          type="submit"
          className={styles.button}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {isModalOpen && (
        <SubmitModal
          onClose={() => setIsModalOpen(false)}
          message="Thank you for your review! It will be visible after moderation."
        />
      )}
    </div>
  );
};

Review.propTypes = {
  setReviews: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

export default Review;