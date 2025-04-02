import PropTypes from 'prop-types';
import styles from "./Review.module.css";
import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import SubmitModal from "./SubmitModal";

const hardcodedReviews = [
  {
    id: 1,
    name: "Marina",
    rating: 5,
    message: "Varona is modern and captivating. The garments are expertly finished. Finally, a style that can appeal to everyone. Very well done, my brilliant friend!😘",
    image: "https://res.cloudinary.com/dwenvtwyx/image/upload/v1741449828/reviews/lgbkmqn8iqhmreespqep.jpg",
  date: ""
  },
  {
    id: 5,
    name: "Miki",
    rating: 5,
    message: "Complimenti per la sfilata, per i materiali e le fluidità dei tessuti.Parlavi già 10 anni fa di gender fluid e collezione unisex. Inoltre mi piace molto le vestibilità e le assimetrie.  Complimenti Natalia. Un grande baci ❤️",
    image: "https://res.cloudinary.com/dwenvtwyx/image/upload/v1737314284/reviews/tqjcusg3f7nwj8dvpjr7.jpg",
  date: ""
  },
  {
    id: 5,
    name: "Louis",
    rating: 5,
    message: "I’m super happy to own a beautiful sweater from Varona.Perfect fit and amazing quality that lasts for life.I can only recommend!",
    image: "https://res.cloudinary.com/dwenvtwyx/image/upload/v1741045888/reviews/gxhloroitnkgevt0wj66.jpg",
    date: ""
  },
  {
    id: 5,
    name: "Wolfgang Jger",
    rating: 5,
    message: "",
    image: "https://res.cloudinary.com/dwenvtwyx/image/upload/v1739534959/reviews/gsrlobxiixf7jzxonfld.jpg",
  date: "",
  },
  {
    id: 5,
    name: "Maggie Angelova",
    rating: 5,
    message: "Highly recommend checking out this new brand!!Very cool and unique designs - perfect balance between trendy and timeless. Definitely a brand to watch out for!",
  date: ""
  },
  {
    id: 5,
    name: "Howie B",
    rating: 5,
    message: "Looking forward to your new adventure . I hope you will take part in Berlin Fashion Week.",
    image: "https://res.cloudinary.com/dwenvtwyx/image/upload/v1737057088/reviews/pumx8tqijnetfq1hyybp.jpg",
  date: "1/16/2025"
  },
];

const Review = ({ setReviews, setError }) => {
  const [reviewFields, setReviewFields] = useState({
    name: "",
    rating: 0,
    message: "",
    image: null,
    preview: null,
    dat: ""
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setReviews([...hardcodedReviews]);
  }, [setReviews]);

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

    setReviewFields((prev) => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file),
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

    if (!name.trim() || !rating || !message.trim()) {
      alert("All fields are required, including a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("rating", rating);
      formData.append("message", message.trim());
      if (image) formData.append("image", image);

      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const newReview = await response.json();
      setReviews((prev) => [...prev, newReview]);

      setReviewFields({ name: "", rating: 0, message: "", image: null, preview: null, data:""});
      setIsModalOpen(true);
    } catch (error) {
      console.error("Submission error:", error);
      setError("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.reviewComponent}>
      <form onSubmit={handleSubmit} className={styles.reviewForm}>
        <h2 >Leave a Review</h2>

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
                  color={ratingValue <= (reviewFields.rating) ? "#ffc107" : "#e4e5e9"}
                  size={20}
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

      {isModalOpen && <SubmitModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

Review.propTypes = {
  setReviews: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

export default Review;
